-- Migration: Automations Core Reality Sync
-- Adiciona a tabela de fila de trabalhos automatizados (Jobs) 
-- para garantir que as regras sejam executadas pelo worker (Edge Function)

CREATE TABLE IF NOT EXISTS public.automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  
  trigger_type TEXT NOT NULL, -- 'schedule', 'event', 'manual'
  event_payload JSONB DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  error_message TEXT,
  error_stack TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance para a fila
CREATE INDEX IF NOT EXISTS idx_automation_jobs_org_id ON public.automation_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON public.automation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_scheduled_for ON public.automation_jobs(scheduled_for) WHERE status = 'pending';

-- RLS
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;

-- As agências podem ver seus jobs, mas apenas o sistema/edge function pode processar
DROP POLICY IF EXISTS "org_read_own_jobs" ON public.automation_jobs;
CREATE POLICY "org_read_own_jobs" ON public.automation_jobs
  FOR SELECT USING (org_id = (SELECT get_my_org_id()));

-- Apenas admins podem criar/cancelar jobs manualmente
DROP POLICY IF EXISTS "admin_manage_jobs" ON public.automation_jobs;
CREATE POLICY "admin_manage_jobs" ON public.automation_jobs
  USING (
    org_id = (SELECT get_my_org_id())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('org_admin', 'super_admin')
    )
  );
