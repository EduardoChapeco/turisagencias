-- Habilitar a extensão pg_cron se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 1. Função para expirar cotações antigas
CREATE OR REPLACE FUNCTION expire_old_quotations()
RETURNS void AS $$
BEGIN
  -- Marca como expirada se passou da validade e está como rascunho ou pendente
  UPDATE public.quotations
  SET status = 'expired'
  WHERE status IN ('draft', 'pending', 'sent')
    AND valid_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job: Rodar a cada dia à meia-noite (0 0 * * *)
SELECT cron.schedule(
  'expire_quotations_job',
  '0 0 * * *',
  $$SELECT public.expire_old_quotations()$$
);

-- 2. Função para monitoramento de crise na malha aérea
CREATE OR REPLACE FUNCTION monitor_airline_crisis()
RETURNS void AS $$
BEGIN
  -- Insere um log de alerta para o Motor Python ler e processar a crise
  INSERT INTO public.ai_decision_logs (org_id, trip_id, agent_role, action, decision_reason, confidence, metadata)
  SELECT org_id, id, 'AURA', 'flight_crisis_check', 'Verificação automática de malha aérea iniciada via pg_cron', 1.0, '{"source": "pg_cron", "type": "crisis_monitoring"}'::jsonb
  FROM public.group_trips
  WHERE status = 'published' AND departure_date > CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job: Monitorar malha aérea a cada 12 horas (0 */12 * * *)
SELECT cron.schedule(
  'monitor_airline_crisis_job',
  '0 */12 * * *',
  $$SELECT public.monitor_airline_crisis()$$
);

-- 3. Função para lembrete de Guia Mágico (Destino)
CREATE OR REPLACE FUNCTION send_magic_guide_reminders()
RETURNS void AS $$
BEGIN
  -- Atualiza bookings marcando que o guia foi programado para envio
  UPDATE public.group_trip_bookings
  SET notes_admin = CONCAT(COALESCE(notes_admin, ''), '\n[AUTOMATION] Guia mágico preparado para envio em ', CURRENT_DATE::text)
  FROM public.group_trips t
  WHERE public.group_trip_bookings.group_trip_id = t.id
    AND t.departure_date BETWEEN CURRENT_DATE + INTERVAL '5 days' AND CURRENT_DATE + INTERVAL '7 days'
    AND COALESCE(notes_admin, '') NOT LIKE '%Guia mágico preparado%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job: Disparar lembretes de guia diariamente às 9h da manhã (0 9 * * *)
SELECT cron.schedule(
  'magic_guide_reminders_job',
  '0 9 * * *',
  $$SELECT public.send_magic_guide_reminders()$$
);
