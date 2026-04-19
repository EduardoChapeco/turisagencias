CREATE TABLE IF NOT EXISTS public.client_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  identity_type TEXT NOT NULL DEFAULT 'external',
  label TEXT,
  raw_value TEXT,
  normalized_value TEXT,
  external_id TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_identities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_client_identities_org_client
  ON public.client_identities(org_id, client_id);

CREATE INDEX IF NOT EXISTS idx_client_identities_provider
  ON public.client_identities(org_id, provider, identity_type);

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_identities_provider_normalized
  ON public.client_identities(org_id, provider, normalized_value)
  WHERE normalized_value IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_identities_provider_external_id
  ON public.client_identities(org_id, provider, external_id)
  WHERE external_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_client_identities_updated_at ON public.client_identities;
CREATE TRIGGER update_client_identities_updated_at
  BEFORE UPDATE ON public.client_identities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage client_identities" ON public.client_identities;
CREATE POLICY "org members can manage client_identities" ON public.client_identities
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TABLE IF NOT EXISTS public.external_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'reservation',
  external_id TEXT,
  external_key TEXT NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  occurred_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.external_entities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_external_entities_org_client
  ON public.external_entities(org_id, client_id, provider);

CREATE INDEX IF NOT EXISTS idx_external_entities_org_trip
  ON public.external_entities(org_id, trip_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_external_entities_key
  ON public.external_entities(org_id, provider, entity_type, external_key);

DROP TRIGGER IF EXISTS update_external_entities_updated_at ON public.external_entities;
CREATE TRIGGER update_external_entities_updated_at
  BEFORE UPDATE ON public.external_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage external_entities" ON public.external_entities;
CREATE POLICY "org members can manage external_entities" ON public.external_entities
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TABLE IF NOT EXISTS public.wa_session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  extension_id TEXT NOT NULL,
  session_key TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  contact_phone_key TEXT,
  chat_id TEXT,
  tab_url TEXT,
  page_title TEXT,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_incoming_at TIMESTAMPTZ,
  last_outgoing_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wa_session_metrics_message_count_nonnegative CHECK (message_count >= 0)
);

ALTER TABLE public.wa_session_metrics ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wa_session_metrics_session
  ON public.wa_session_metrics(org_id, session_key);

CREATE INDEX IF NOT EXISTS idx_wa_session_metrics_contact
  ON public.wa_session_metrics(org_id, contact_phone_key, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_session_metrics_client
  ON public.wa_session_metrics(org_id, client_id, last_seen_at DESC);

DROP TRIGGER IF EXISTS update_wa_session_metrics_updated_at ON public.wa_session_metrics;
CREATE TRIGGER update_wa_session_metrics_updated_at
  BEFORE UPDATE ON public.wa_session_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage wa_session_metrics" ON public.wa_session_metrics;
CREATE POLICY "org members can manage wa_session_metrics" ON public.wa_session_metrics
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TABLE IF NOT EXISTS public.wa_conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  wa_session_id UUID REFERENCES public.wa_session_metrics(id) ON DELETE SET NULL,
  session_key TEXT NOT NULL,
  contact_phone TEXT,
  contact_phone_key TEXT,
  direction TEXT NOT NULL DEFAULT 'in',
  message_text TEXT NOT NULL,
  message_hash TEXT NOT NULL,
  message_time_label TEXT,
  message_time TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_conversation_logs ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wa_conversation_logs_hash
  ON public.wa_conversation_logs(org_id, session_key, message_hash);

CREATE INDEX IF NOT EXISTS idx_wa_conversation_logs_session
  ON public.wa_conversation_logs(org_id, session_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wa_conversation_logs_client
  ON public.wa_conversation_logs(org_id, client_id, created_at DESC);

DROP POLICY IF EXISTS "org members can manage wa_conversation_logs" ON public.wa_conversation_logs;
CREATE POLICY "org members can manage wa_conversation_logs" ON public.wa_conversation_logs
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TABLE IF NOT EXISTS public.operator_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  external_entity_id UUID REFERENCES public.external_entities(id) ON DELETE SET NULL,
  wa_session_id UUID REFERENCES public.wa_session_metrics(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'booking',
  locator TEXT,
  page_url TEXT,
  page_title TEXT,
  fingerprint TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ingested_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ingested_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operator_snapshots ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_snapshots_fingerprint
  ON public.operator_snapshots(org_id, fingerprint);

CREATE INDEX IF NOT EXISTS idx_operator_snapshots_client
  ON public.operator_snapshots(org_id, client_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_operator_snapshots_trip
  ON public.operator_snapshots(org_id, trip_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_operator_snapshots_provider
  ON public.operator_snapshots(org_id, provider, captured_at DESC);

DROP TRIGGER IF EXISTS update_operator_snapshots_updated_at ON public.operator_snapshots;
CREATE TRIGGER update_operator_snapshots_updated_at
  BEFORE UPDATE ON public.operator_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "org members can manage operator_snapshots" ON public.operator_snapshots;
CREATE POLICY "org members can manage operator_snapshots" ON public.operator_snapshots
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());
