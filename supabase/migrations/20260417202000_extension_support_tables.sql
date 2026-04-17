CREATE TABLE IF NOT EXISTS public.proactive_alerts (
  id TEXT PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'ALERT',
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT,
  message TEXT,
  done BOOLEAN NOT NULL DEFAULT false,
  trip JSONB NOT NULL DEFAULT '{}'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.proactive_alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_proactive_alerts_org_done
  ON public.proactive_alerts(org_id, done, created_at DESC);

DROP TRIGGER IF EXISTS update_proactive_alerts_updated_at ON public.proactive_alerts;
CREATE TRIGGER update_proactive_alerts_updated_at
  BEFORE UPDATE ON public.proactive_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage proactive_alerts" ON public.proactive_alerts;
CREATE POLICY "org members can manage proactive_alerts"
  ON public.proactive_alerts
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TABLE IF NOT EXISTS public.memory_contexts (
  id TEXT PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_phone_key TEXT NOT NULL,
  client_phone TEXT,
  client_name TEXT,
  recent_trips JSONB NOT NULL DEFAULT '[]'::jsonb,
  detected_intents JSONB NOT NULL DEFAULT '[]'::jsonb,
  pending_quotation JSONB,
  last_intent JSONB,
  keyword_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_seen TIMESTAMPTZ,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memory_contexts ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_contexts_org_phone
  ON public.memory_contexts(org_id, client_phone_key);

DROP TRIGGER IF EXISTS update_memory_contexts_updated_at ON public.memory_contexts;
CREATE TRIGGER update_memory_contexts_updated_at
  BEFORE UPDATE ON public.memory_contexts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage memory_contexts" ON public.memory_contexts;
CREATE POLICY "org members can manage memory_contexts"
  ON public.memory_contexts
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());
