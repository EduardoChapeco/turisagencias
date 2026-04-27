-- ============================================================
-- SPRINT 2 — MIGRATION: ai_agents, ai_tasks
-- SEC V3 COMPLIANCE: IA Agêntica Real com Memória Persistente
-- Regra Pétrea: toda tarefa com status rastreável + aprovação humana
-- ============================================================

-- 1. TABELA: ai_agents (registro de agentes por org)
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Identificação
  agent_type      TEXT NOT NULL
                  CHECK (agent_type IN (
                    'orchestrator','gds_gateway','boarding_auditor',
                    'ocr_extractor','email_reader','whatsapp_responder',
                    'finance_auditor','simlab','kanban_strategist',
                    'knowledge_enricher','policy_engine','flight_specialist'
                  )),
  name            TEXT NOT NULL,
  description     TEXT,
  version         TEXT NOT NULL DEFAULT '1.0',

  -- Memória persistente (Regra Pétrea: NUNCA hardcoded)
  memory_store    JSONB NOT NULL DEFAULT '{}',
  -- Estrutura obrigatória:
  -- {
  --   "last_action": "...",
  --   "context_window": [],
  --   "learned_preferences": {},
  --   "error_log": [],
  --   "session_count": 0
  -- }

  -- Configuração de regras e políticas
  rules_config    JSONB NOT NULL DEFAULT '{}',
  -- {
  --   "rules_version": "1.0",
  --   "knowledge_cutoff": "2025-12-31",
  --   "max_retries": 3,
  --   "timeout_seconds": 30,
  --   "requires_human_approval": false,
  --   "approval_threshold": null
  -- }

  -- Estado atual
  status          TEXT NOT NULL DEFAULT 'idle'
                  CHECK (status IN ('idle','running','error','paused','disabled')),
  active_tasks    JSONB NOT NULL DEFAULT '[]',   -- IDs das tarefas ativas
  last_action_at  TIMESTAMPTZ,
  last_error      TEXT,
  error_count     INT NOT NULL DEFAULT 0,

  -- Endpoint do motor Python
  python_endpoint TEXT,    -- ex: "http://localhost:8000/api/v1/agents/orchestrate"

  -- Estatísticas
  total_tasks_run INT NOT NULL DEFAULT 0,
  success_rate    NUMERIC(5,2) DEFAULT 100.0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON public.ai_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON public.ai_agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON public.ai_agents(status);
COMMENT ON TABLE public.ai_agents IS 'Registro de agentes de IA por organização. Memória persistente obrigatória. Status sempre rastreável.';

DROP TRIGGER IF EXISTS update_ai_agents_updated_at ON public.ai_agents;
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users view agents in own org" ON public.ai_agents;
CREATE POLICY "Users view agents in own org" ON public.ai_agents
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users manage agents in own org" ON public.ai_agents;
CREATE POLICY "Users manage agents in own org" ON public.ai_agents
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- 2. TABELA: ai_tasks (fila de tarefas dos agentes)
CREATE TABLE IF NOT EXISTS public.ai_tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_agent_id       UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,

  -- Tipo e payload
  task_type         TEXT NOT NULL,
  -- ex: 'search_flights','extract_pdf','audit_boarding','respond_whatsapp'
  task_payload      JSONB NOT NULL DEFAULT '{}',

  -- Status (máquina de estados)
  status            TEXT NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued','running','awaiting_approval','completed','failed','cancelled')),

  -- Log de execução em tempo real (append-only)
  execution_log     JSONB NOT NULL DEFAULT '[]',
  -- [{ timestamp, level: "info|warn|error", message, data }]

  -- Resultado
  result            JSONB,
  error_message     TEXT,
  retry_count       INT NOT NULL DEFAULT 0,
  max_retries       INT NOT NULL DEFAULT 3,

  -- Datas de execução
  queued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,

  -- Aprovação humana (Regra Pétrea: IA nunca age sozinha em ações críticas)
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approval_prompt   TEXT,     -- O que o agente quer fazer (ex-factual para humano)
  approved_by       UUID REFERENCES auth.users(id),
  approved_at       TIMESTAMPTZ,
  rejected_at       TIMESTAMPTZ,
  rejection_reason  TEXT,

  -- Contexto (entidade relacionada)
  entity_type       TEXT,     -- 'quotation' | 'trip' | 'client' | 'booking'
  entity_id         UUID,

  -- Rastreabilidade
  triggered_by      UUID REFERENCES auth.users(id),   -- quem disparou
  triggered_source  TEXT,     -- 'user' | 'automation' | 'cron' | 'webhook'

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_tasks_org ON public.ai_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_agent ON public.ai_tasks(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON public.ai_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_queued_at ON public.ai_tasks(queued_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_approval ON public.ai_tasks(requires_approval, status)
  WHERE requires_approval = true AND status = 'awaiting_approval';
COMMENT ON TABLE public.ai_tasks IS 'Fila de tarefas dos agentes. Status sempre rastreável. Aprovação humana quando requires_approval=true.';

DROP TRIGGER IF EXISTS update_ai_tasks_updated_at ON public.ai_tasks;
CREATE TRIGGER update_ai_tasks_updated_at
  BEFORE UPDATE ON public.ai_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: sincronizar agent.active_tasks quando task muda
CREATE OR REPLACE FUNCTION public.sync_agent_active_tasks()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.ai_agents
  SET
    active_tasks = (
      SELECT COALESCE(jsonb_agg(id), '[]'::jsonb)
      FROM public.ai_tasks
      WHERE ai_agent_id = COALESCE(NEW.ai_agent_id, OLD.ai_agent_id)
        AND status IN ('queued','running','awaiting_approval')
    ),
    status = CASE
      WHEN EXISTS (
        SELECT 1 FROM public.ai_tasks
        WHERE ai_agent_id = COALESCE(NEW.ai_agent_id, OLD.ai_agent_id)
          AND status = 'running'
      ) THEN 'running'
      WHEN EXISTS (
        SELECT 1 FROM public.ai_tasks
        WHERE ai_agent_id = COALESCE(NEW.ai_agent_id, OLD.ai_agent_id)
          AND status = 'queued'
      ) THEN 'idle'
      ELSE 'idle'
    END,
    last_action_at = CASE
      WHEN NEW.status = 'completed' THEN now()
      ELSE last_action_at
    END,
    total_tasks_run = CASE
      WHEN NEW.status IN ('completed','failed') THEN total_tasks_run + 1
      ELSE total_tasks_run
    END
  WHERE id = COALESCE(NEW.ai_agent_id, OLD.ai_agent_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_agent_active_tasks ON public.ai_tasks;
CREATE TRIGGER trg_sync_agent_active_tasks
  AFTER INSERT OR UPDATE OR DELETE ON public.ai_tasks
  FOR EACH ROW EXECUTE FUNCTION public.sync_agent_active_tasks();

-- RLS ai_tasks
DROP POLICY IF EXISTS "Users view tasks in own org" ON public.ai_tasks;
CREATE POLICY "Users view tasks in own org" ON public.ai_tasks
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users manage tasks in own org" ON public.ai_tasks;
CREATE POLICY "Users manage tasks in own org" ON public.ai_tasks
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- 3. FUNÇÃO RPC: Aprovar tarefa de IA
CREATE OR REPLACE FUNCTION public.approve_ai_task(
  p_task_id UUID,
  p_approved BOOLEAN DEFAULT TRUE,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  _task public.ai_tasks;
BEGIN
  SELECT * INTO _task FROM public.ai_tasks
  WHERE id = p_task_id AND org_id = get_my_org_id();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task not found');
  END IF;

  IF _task.status != 'awaiting_approval' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Task is not awaiting approval');
  END IF;

  IF p_approved THEN
    UPDATE public.ai_tasks
    SET status = 'running',
        approved_by = auth.uid(),
        approved_at = now()
    WHERE id = p_task_id;
  ELSE
    UPDATE public.ai_tasks
    SET status = 'cancelled',
        rejected_at = now(),
        rejection_reason = COALESCE(p_reason, 'Rejected by user')
    WHERE id = p_task_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'task_id', p_task_id,
    'approved', p_approved
  );
END;
$$;

-- 4. FUNÇÃO RPC: Enfileirar nova tarefa de IA
CREATE OR REPLACE FUNCTION public.enqueue_ai_task(
  p_agent_type      TEXT,
  p_task_type       TEXT,
  p_task_payload    JSONB DEFAULT '{}',
  p_requires_approval BOOLEAN DEFAULT FALSE,
  p_approval_prompt TEXT DEFAULT NULL,
  p_entity_type     TEXT DEFAULT NULL,
  p_entity_id       UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  _agent    public.ai_agents;
  _task_id  UUID;
  _org_id   UUID := get_my_org_id();
BEGIN
  -- Buscar agente ativo do tipo solicitado
  SELECT * INTO _agent
  FROM public.ai_agents
  WHERE org_id = _org_id
    AND agent_type = p_agent_type
    AND status != 'disabled'
  LIMIT 1;

  IF NOT FOUND THEN
    -- Auto-criar agente se não existir
    INSERT INTO public.ai_agents (org_id, agent_type, name, description)
    VALUES (
      _org_id,
      p_agent_type,
      INITCAP(REPLACE(p_agent_type, '_', ' ')),
      'Agente criado automaticamente pelo sistema'
    )
    RETURNING * INTO _agent;
  END IF;

  -- Criar task
  INSERT INTO public.ai_tasks (
    org_id, ai_agent_id, task_type, task_payload,
    requires_approval, approval_prompt,
    entity_type, entity_id,
    triggered_by, triggered_source
  )
  VALUES (
    _org_id, _agent.id, p_task_type, p_task_payload,
    p_requires_approval, p_approval_prompt,
    p_entity_type, p_entity_id,
    auth.uid(), 'user'
  )
  RETURNING id INTO _task_id;

  RETURN jsonb_build_object(
    'success', true,
    'task_id', _task_id,
    'agent_id', _agent.id,
    'agent_type', p_agent_type,
    'status', 'queued'
  );
END;
$$;

-- 5. REALTIME: habilitar para ai_tasks (AI Dashboard em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_agents;

-- 6. VIEW consolidada para o AI Dashboard
CREATE OR REPLACE VIEW public.ai_dashboard_summary
WITH (security_invoker = true)
AS
SELECT
  a.org_id,
  a.id AS agent_id,
  a.agent_type,
  a.name AS agent_name,
  a.status AS agent_status,
  a.last_action_at,
  a.total_tasks_run,
  a.success_rate,
  a.error_count,
  COUNT(t.id) FILTER (WHERE t.status = 'running') AS tasks_running,
  COUNT(t.id) FILTER (WHERE t.status = 'queued') AS tasks_queued,
  COUNT(t.id) FILTER (WHERE t.status = 'awaiting_approval') AS tasks_awaiting,
  COUNT(t.id) FILTER (WHERE t.status = 'failed') AS tasks_failed,
  COUNT(t.id) FILTER (WHERE t.status = 'completed') AS tasks_completed
FROM public.ai_agents a
LEFT JOIN public.ai_tasks t ON t.ai_agent_id = a.id
GROUP BY a.org_id, a.id, a.agent_type, a.name, a.status,
         a.last_action_at, a.total_tasks_run, a.success_rate, a.error_count;
