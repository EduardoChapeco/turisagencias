-- Migration: automation_executions_idempotency
-- Propósito: Prevenir o Gatilho Fantasma no Boarding Auditor e Automations
-- Data: 2026-04-27

CREATE TABLE IF NOT EXISTS public.automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- Ex: 'magic_guide_sent', 'flight_crisis_check'
  target_id UUID NOT NULL,  -- Pode referenciar group_trip_id, quotation_id, ticket_id
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Garantia absoluta de idempotência (1 execução por tipo de evento por alvo)
  CONSTRAINT automation_executions_idempotency_key UNIQUE (org_id, event_type, target_id)
);

-- RLS
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizações podem ver suas próprias execuções de automação"
ON public.automation_executions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.org_id = automation_executions.org_id
  )
);

-- Edge functions e Workers devem operar com service_role para inserir aqui, 
-- portanto não precisamos de políticas de INSERT públicas.

-- Função para registrar execução se não existir
CREATE OR REPLACE FUNCTION log_automation_execution(_org_id UUID, _event_type TEXT, _target_id UUID, _metadata JSONB DEFAULT '{}'::jsonb)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.automation_executions (org_id, event_type, target_id, metadata)
  VALUES (_org_id, _event_type, _target_id, _metadata)
  ON CONFLICT ON CONSTRAINT automation_executions_idempotency_key DO NOTHING;
  
  -- Retorna TRUE se a inserção ocorreu (o rowCount > 0), FALSE se bateu no CONFLICT
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
