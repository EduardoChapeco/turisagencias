-- Incremental registered app modules surfaced by the SEC audit.
-- Keep this migration additive and idempotent: it registers tables/functions already
-- referenced by existing routes without duplicating existing modules.

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  context text,
  messages jsonb not null default '[]'::jsonb,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_org_user_updated
  on public.chat_sessions(org_id, user_id, updated_at desc);

alter table public.chat_sessions enable row level security;

drop policy if exists chat_sessions_org_select on public.chat_sessions;
create policy chat_sessions_org_select on public.chat_sessions
  for select to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid());

drop policy if exists chat_sessions_org_insert on public.chat_sessions;
create policy chat_sessions_org_insert on public.chat_sessions
  for insert to authenticated
  with check (org_id = public.get_my_org_id() and user_id = auth.uid());

drop policy if exists chat_sessions_org_update on public.chat_sessions;
create policy chat_sessions_org_update on public.chat_sessions
  for update to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid())
  with check (org_id = public.get_my_org_id() and user_id = auth.uid());

drop policy if exists chat_sessions_org_delete on public.chat_sessions;
create policy chat_sessions_org_delete on public.chat_sessions
  for delete to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid());

drop trigger if exists update_chat_sessions_updated_at on public.chat_sessions;
create trigger update_chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.update_updated_at_column();

create table if not exists public.portal_ai_photos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  trip_id uuid references public.group_trips(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  original_url text not null,
  result_url text,
  style text not null,
  status text not null default 'pending',
  provider text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portal_ai_photos_org_trip
  on public.portal_ai_photos(org_id, trip_id, created_at desc);

alter table public.portal_ai_photos enable row level security;

drop policy if exists portal_ai_photos_org_all on public.portal_ai_photos;
create policy portal_ai_photos_org_all on public.portal_ai_photos
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

drop trigger if exists update_portal_ai_photos_updated_at on public.portal_ai_photos;
create trigger update_portal_ai_photos_updated_at
  before update on public.portal_ai_photos
  for each row execute function public.update_updated_at_column();

create table if not exists public.itinerary_leads (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  whatsapp text not null,
  action text not null default 'general_interest',
  utm_source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_itinerary_leads_org_itinerary
  on public.itinerary_leads(org_id, itinerary_id, created_at desc);

alter table public.itinerary_leads enable row level security;

drop policy if exists itinerary_leads_org_select on public.itinerary_leads;
create policy itinerary_leads_org_select on public.itinerary_leads
  for select to authenticated
  using (org_id = public.get_my_org_id());

drop policy if exists itinerary_leads_org_insert on public.itinerary_leads;
create policy itinerary_leads_org_insert on public.itinerary_leads
  for insert to authenticated
  with check (org_id = public.get_my_org_id());

drop policy if exists itinerary_leads_public_insert on public.itinerary_leads;
create policy itinerary_leads_public_insert on public.itinerary_leads
  for insert to anon
  with check (
    exists (
      select 1
      from public.itineraries i
      where i.id = itinerary_id
        and i.org_id = org_id
        and i.is_public = true
    )
  );

create table if not exists public.client_travel_credits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  originating_cancellation_id uuid references public.booking_cancellations(id) on delete set null,
  lead_email text,
  lead_name text,
  amount numeric(12,2) not null default 0,
  used_amount numeric(12,2) not null default 0,
  expires_at date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_client_travel_credits_org_email
  on public.client_travel_credits(org_id, lead_email, status);

alter table public.client_travel_credits enable row level security;

drop policy if exists client_travel_credits_org_all on public.client_travel_credits;
create policy client_travel_credits_org_all on public.client_travel_credits
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

drop trigger if exists update_client_travel_credits_updated_at on public.client_travel_credits;
create trigger update_client_travel_credits_updated_at
  before update on public.client_travel_credits
  for each row execute function public.update_updated_at_column();

create table if not exists public.email_inbound (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  from_email text,
  from_name text,
  subject text,
  body text,
  ai_classification text,
  ai_summary text,
  status text not null default 'received',
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_email_inbound_org_received
  on public.email_inbound(org_id, received_at desc);

alter table public.email_inbound enable row level security;

drop policy if exists email_inbound_org_all on public.email_inbound;
create policy email_inbound_org_all on public.email_inbound
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

alter table public.destinations
  add column if not exists iata_gateway text,
  add column if not exists gateway_rules jsonb,
  add column if not exists transfer_time_hours numeric,
  add column if not exists avoid_season text,
  add column if not exists is_active boolean not null default true;

create or replace function public.increment_itinerary_view(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.itineraries
  set view_count = coalesce(view_count, 0) + 1
  where public_token = p_token
    and is_public = true;
end;
$$;

grant execute on function public.increment_itinerary_view(text) to anon, authenticated;

create or replace function public.calculate_cancellation_fine(
  _booking_id uuid,
  _cancellation_date date default current_date
)
returns table (
  total_paid numeric,
  fine_pct numeric,
  fine_amount numeric,
  refund_amount numeric,
  policy_desc text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_departure date;
  v_total_paid numeric := 0;
  v_days integer;
begin
  select gb.org_id, gt.departure_date
    into v_org_id, v_departure
  from public.group_bookings gb
  left join public.group_trips gt on gt.id = gb.group_trip_id
  where gb.id = _booking_id;

  if v_org_id is null then
    raise exception 'booking_not_found';
  end if;

  if auth.role() = 'authenticated' and v_org_id <> public.get_my_org_id() then
    raise exception 'not_authorized';
  end if;

  select coalesce(sum(amount), 0)
    into v_total_paid
  from public.booking_installments
  where booking_id = _booking_id
    and status = 'paid';

  v_days := case
    when v_departure is null then null
    else v_departure - _cancellation_date
  end;

  fine_pct := case
    when v_days is null then 10
    when v_days < 0 then 100
    when v_days <= 7 then 50
    when v_days <= 30 then 20
    else 10
  end;

  total_paid := v_total_paid;
  fine_amount := round(v_total_paid * fine_pct / 100, 2);
  refund_amount := greatest(v_total_paid - fine_amount, 0);
  policy_desc := case
    when v_days is null then 'Multa padrao aplicada por ausencia de data de embarque.'
    when v_days < 0 then 'Cancelamento apos a data de embarque.'
    when v_days <= 7 then 'Cancelamento a 7 dias ou menos do embarque.'
    when v_days <= 30 then 'Cancelamento entre 8 e 30 dias antes do embarque.'
    else 'Cancelamento com mais de 30 dias de antecedencia.'
  end;

  return next;
end;
$$;

grant execute on function public.calculate_cancellation_fine(uuid, date) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('client-photos', 'client-photos', true)
on conflict (id) do nothing;
