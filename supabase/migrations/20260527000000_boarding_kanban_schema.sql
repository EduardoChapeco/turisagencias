-- 1. Registry de links por companhia
create table if not exists airline_link_registry (
  id uuid primary key default gen_random_uuid(),
  airline_iata text not null,
  airline_icao text,
  airline_name text not null,
  country text,
  link_type text not null check (
    link_type in (
      'checkin',
      'boarding_pass',
      'manage_booking',
      'baggage',
      'flight_status',
      'support',
      'documents'
    )
  ),
  official_url text not null,
  deep_link_template text,
  required_fields text[] not null default '{}',
  optional_fields text[] not null default '{}',
  window_open_hours_before integer,
  window_close_minutes_before integer,
  supports_prefill boolean default false,
  supports_boarding_pass_direct boolean default false,
  source_url text,
  source_notes text,
  last_verified_at timestamptz,
  verification_status text not null default 'needs_review'
    check (verification_status in ('verified','needs_review','broken','deprecated')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(airline_iata, link_type)
);

-- 2. Links gerados por viagem/passageiro/trecho
create table if not exists trip_airline_action_links (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  trip_id uuid not null,
  traveler_id uuid,
  flight_segment_id uuid,
  passenger_ticket_id uuid,
  airline_iata text not null,
  link_type text not null,
  registry_id uuid references airline_link_registry(id),
  generated_url text,
  masked_url text,
  required_payload jsonb default '{}'::jsonb,
  missing_fields text[] default '{}',
  status text not null default 'pending'
    check (status in ('pending','ready','missing_data','outside_window','opened','completed_external','failed','expired')),
  opened_by uuid,
  opened_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Status operacional de check-in
create table if not exists trip_checkin_status (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  trip_id uuid not null,
  traveler_id uuid,
  flight_segment_id uuid,
  passenger_ticket_id uuid,
  airline_iata text,
  status text not null default 'not_available'
    check (status in (
      'not_available',
      'waiting_window',
      'missing_data',
      'available',
      'opened',
      'in_progress',
      'done_external',
      'boarding_pass_attached',
      'sent_to_client',
      'airport_counter_required',
      'problem'
    )),
  reason text,
  window_opens_at timestamptz,
  window_closes_at timestamptz,
  last_checked_at timestamptz,
  updated_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Arquivos de cartão de embarque
create table if not exists boarding_pass_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  trip_id uuid not null,
  traveler_id uuid,
  flight_segment_id uuid,
  passenger_ticket_id uuid,
  asset_id uuid,
  storage_bucket text not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  source text check (source in ('uploaded','email','manual','airline_download','client_upload')),
  status text default 'attached',
  uploaded_by uuid,
  sent_to_client_at timestamptz,
  created_at timestamptz default now()
);

-- 5. Logs operacionais
create table if not exists boarding_operation_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  trip_id uuid not null,
  traveler_id uuid,
  flight_segment_id uuid,
  action_type text not null,
  actor_id uuid,
  actor_role text,
  metadata jsonb default '{}'::jsonb,
  pii_masked boolean default true,
  created_at timestamptz default now()
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

alter table airline_link_registry enable row level security;
alter table trip_airline_action_links enable row level security;
alter table trip_checkin_status enable row level security;
alter table boarding_pass_documents enable row level security;
alter table boarding_operation_logs enable row level security;

-- Registry: Público para usuários logados (apenas leitura). Edição via service_role ou superadmin.
create policy "Registry is visible to authenticated users"
on airline_link_registry for select
to authenticated
using (true);

-- Action Links: Isolamento por tenant
create policy "Action Links tenant isolation"
on trip_airline_action_links for all
to authenticated
using (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid)
with check (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);

-- Checkin Status: Isolamento por tenant
create policy "Checkin Status tenant isolation"
on trip_checkin_status for all
to authenticated
using (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid)
with check (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);

-- Pass Documents: Isolamento por tenant
create policy "Boarding Pass tenant isolation"
on boarding_pass_documents for all
to authenticated
using (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid)
with check (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);

-- Logs: Isolamento por tenant
create policy "Logs tenant isolation"
on boarding_operation_logs for all
to authenticated
using (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid)
with check (org_id = (select auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid);

-- ==========================================
-- POPULATE REGISTRY (MOCK DATA VERIFIED)
-- ==========================================

insert into airline_link_registry (airline_iata, airline_name, country, link_type, official_url, deep_link_template, required_fields, window_open_hours_before, supports_prefill, verification_status)
values
  ('LA', 'LATAM Airlines', 'BR', 'checkin', 'https://www.latamairlines.com/br/pt/minhas-viagens', 'https://www.latamairlines.com/br/pt/cartao-de-embarque?orderId={{orderId}}&lastName={{lastName}}&segmentIndex={{segmentIndex}}&itineraryId={{itineraryId}}&tripPassengerId={{tripPassengerId}}', ARRAY['orderId', 'lastName', 'segmentIndex', 'itineraryId', 'tripPassengerId'], 48, true, 'needs_review'),
  ('G3', 'GOL Linhas Aéreas', 'BR', 'checkin', 'https://b2c.voegol.com.br/checkin/', null, ARRAY['booking_reference', 'departure_airport_iata'], 48, false, 'needs_review'),
  ('AD', 'Azul Linhas Aéreas', 'BR', 'checkin', 'https://www.voeazul.com.br/br/pt/home/check-in', null, ARRAY['booking_reference', 'origin'], 72, false, 'needs_review'),
  ('TP', 'TAP Air Portugal', 'PT', 'checkin', 'https://www.flytap.com/pt-br/check-in', null, ARRAY['booking_reference', 'last_name'], 36, false, 'needs_review')
on conflict (airline_iata, link_type) do nothing;
