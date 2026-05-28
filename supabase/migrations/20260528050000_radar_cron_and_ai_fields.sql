-- Adiciona coluna pg_cron para sincronização automática do Radar de Notícias
-- O cron roda a cada 6 horas: 00h, 06h, 12h, 18h (UTC)
-- Requer que a extensão pg_cron esteja habilitada (já foi feito na migration anterior)

-- Garante que a função de trigger da sync existe
create or replace function trigger_radar_sync()
returns void as $$
begin
  -- Faz um HTTP call para a Edge Function usando net.http_post
  -- (só funciona se o pg_net estiver habilitado no projeto Supabase)
  perform net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/sync-market-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := '{"triggered_by":"cron"}'::jsonb
  );
exception when others then
  -- Se pg_net não estiver disponível, registra o erro mas não falha
  raise warning 'trigger_radar_sync: pg_net não disponível ou erro de rede: %', SQLERRM;
end;
$$ language plpgsql security definer;

-- Agenda o cron: a cada 6 horas
-- Remove agendamento anterior caso exista
select cron.unschedule('radar-sync-every-6h') where exists (
  select 1 from cron.job where jobname = 'radar-sync-every-6h'
);

select cron.schedule(
  'radar-sync-every-6h',
  '0 0,6,12,18 * * *',
  'select trigger_radar_sync()'
);

-- Adiciona campos enriquecidos de IA na tabela news_articles se não existirem
alter table public.news_articles
  add column if not exists ai_short_summary text,
  add column if not exists ai_bullets jsonb default '[]',
  add column if not exists ai_tags jsonb default '[]',
  add column if not exists ai_recommended_action text,
  add column if not exists ai_travel_agency_insight text;
