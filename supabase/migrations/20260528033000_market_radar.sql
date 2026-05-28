-- Migration: market_news
create table if not exists public.market_news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text unique not null,
  source_name text not null,
  published_at timestamptz not null default now(),
  content_text text,
  ai_summary text,
  ai_category varchar(50) check (ai_category in ('mercado', 'urgente', 'alerta', 'dica')),
  ai_impact_score int default 0,
  read_count int default 0,
  archived boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.market_news enable row level security;

create policy "Enable read access for authenticated users"
  on public.market_news for select
  to authenticated
  using (true);

-- Trigger for archiving after 30 days (This can be a pg_cron or Edge function, but we'll manage it via edge function or a simple query for now)
