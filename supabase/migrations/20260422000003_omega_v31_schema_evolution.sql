-- ============================================================
-- OMEGA v3.1 — Schema Evolution
-- Tickets avançado + Events + Attachments + AI Insights Function
-- ============================================================

-- 1. EXPAND TICKETS TABLE
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'manual',
  -- manual | email | whatsapp | portal | phone
  ADD COLUMN IF NOT EXISTS subject_line TEXT,
  ADD COLUMN IF NOT EXISTS email_thread_id TEXT, -- Gmail thread ID for tracking
  ADD COLUMN IF NOT EXISTS sla_hours INT NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ GENERATED ALWAYS AS 
    (created_at + (sla_hours || ' hours')::INTERVAL) STORED,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS priority_score INT DEFAULT 0, -- auto-calculated
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS group_trip_id UUID REFERENCES public.group_trips(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID; -- same as assigned_agent_id but used by frontend

-- Sync assigned_agent_id -> assigned_to (compatibility)
UPDATE public.tickets SET assigned_to = assigned_agent_id WHERE assigned_to IS NULL AND assigned_agent_id IS NOT NULL;

-- 2. TICKET EVENTS TABLE (audit trail / timeline system events)
CREATE TABLE IF NOT EXISTS public.ticket_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  -- status_changed | assigned | note_added | email_sent | email_received
  -- attachment_added | sla_breached | priority_changed | linked_client | linked_trip
  payload JSONB NOT NULL DEFAULT '{}',
  -- For status_changed: { from: 'open', to: 'in_progress' }
  -- For assigned: { from_agent: 'UUID', to_agent: 'UUID' }
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'agent', -- agent | system | client
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ticket_events_ticket ON public.ticket_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_events_type ON public.ticket_events(event_type);

DROP POLICY IF EXISTS "ticket_events_select" ON public.ticket_events;
CREATE POLICY "ticket_events_select" ON public.ticket_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

DROP POLICY IF EXISTS "ticket_events_insert" ON public.ticket_events;
CREATE POLICY "ticket_events_insert" ON public.ticket_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

-- 3. TICKET ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.ticket_messages(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INT,
  file_type TEXT, -- image/jpeg, application/pdf, etc.
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON public.ticket_attachments(ticket_id);

DROP POLICY IF EXISTS "ticket_attachments_select" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_select" ON public.ticket_attachments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

DROP POLICY IF EXISTS "ticket_attachments_insert" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_insert" ON public.ticket_attachments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

DROP POLICY IF EXISTS "ticket_attachments_delete" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_delete" ON public.ticket_attachments FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

-- 4. ADD message_type TO ticket_messages
ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'internal',
  -- internal | public | email_sent | email_received | whatsapp_sent | system
  ADD COLUMN IF NOT EXISTS email_message_id TEXT, -- for threading
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- 5. KANBAN AI INSIGHTS FUNCTION (real data, zero mocks)
CREATE OR REPLACE FUNCTION public.fn_get_kanban_ai_insights(p_org_id UUID)
RETURNS TABLE(
  card_id UUID,
  card_title TEXT,
  alert_type TEXT,
  alert_message TEXT,
  column_name TEXT,
  days_stale INT,
  estimated_value NUMERIC,
  client_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    kc.id AS card_id,
    kc.title AS card_title,
    CASE 
      WHEN kc.updated_at < now() - INTERVAL '7 days' THEN 'lead_cold'
      WHEN kc.updated_at < now() - INTERVAL '3 days' THEN 'lead_cooling'
      WHEN (kc.estimated_value > 5000 AND kc.quotation_id IS NULL) THEN 'high_value_no_quote'
      WHEN (kc.client_id IS NOT NULL AND kc.estimated_value IS NULL) THEN 'no_value_estimate'
      ELSE 'needs_action'
    END AS alert_type,
    CASE 
      WHEN kc.updated_at < now() - INTERVAL '7 days' THEN 'Lead esfriou — mais de 7 dias sem movimentação. Retome o contato urgente.'
      WHEN kc.updated_at < now() - INTERVAL '3 days' THEN 'Lead esfriando — ' || EXTRACT(DAY FROM now() - kc.updated_at)::INT::TEXT || ' dias sem interação. Faça um follow-up.'
      WHEN (kc.estimated_value > 5000 AND kc.quotation_id IS NULL) THEN 'Alto valor sem proposta. Gere uma cotação para ' || to_char(kc.estimated_value, 'FM"R$"999G999D00') || ' agora.'
      WHEN (kc.client_id IS NOT NULL AND kc.estimated_value IS NULL) THEN 'Cliente vinculado sem valor estimado. Atualize para calcular previsão de receita.'
      ELSE 'Card precisa de atenção da equipe.'
    END AS alert_message,
    col.name AS column_name,
    EXTRACT(DAY FROM now() - kc.updated_at)::INT AS days_stale,
    kc.estimated_value,
    cl.name AS client_name
  FROM public.kanban_cards kc
  JOIN public.kanban_columns col ON col.id = kc.column_id
  JOIN public.kanban_boards kb ON kb.id = col.board_id
  LEFT JOIN public.clients cl ON cl.id = kc.client_id
  WHERE kb.org_id = p_org_id
    AND kb.slug = 'sales'
    AND col.name NOT IN ('Fechado', 'Perdido', 'Vendido', 'Cancelado')
    AND (
      kc.updated_at < now() - INTERVAL '3 days'
      OR (kc.estimated_value > 5000 AND kc.quotation_id IS NULL)
      OR (kc.client_id IS NOT NULL AND kc.estimated_value IS NULL)
    )
  ORDER BY kc.updated_at ASC
  LIMIT 6
$$;

-- 6. TRIGGER: auto-create ticket event on status change
CREATE OR REPLACE FUNCTION public.fn_ticket_status_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_events (ticket_id, event_type, payload, actor_type)
    VALUES (
      NEW.id,
      'status_changed',
      jsonb_build_object('from', OLD.status, 'to', NEW.status),
      'system'
    );
    
    -- Update last_interaction_at
    NEW.last_interaction_at := now();
    
    -- Set closed_at if closing
    IF NEW.status IN ('closed', 'resolved') AND OLD.status NOT IN ('closed', 'resolved') THEN
      NEW.closed_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ticket_status_event ON public.tickets;
CREATE TRIGGER trg_ticket_status_event
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_ticket_status_event();

-- 7. TRIGGER: update last_interaction_at when a message is created
CREATE OR REPLACE FUNCTION public.fn_ticket_message_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tickets 
  SET last_interaction_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ticket_message_interaction ON public.ticket_messages;
CREATE TRIGGER trg_ticket_message_interaction
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_ticket_message_interaction();

-- 8. Expand quotations with multi-accommodation support
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS accommodations JSONB DEFAULT '[]',
  -- replaces single hotel fields, now an array of accommodation objects
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(14,2), -- custo total da agência
  ADD COLUMN IF NOT EXISTS total_sale NUMERIC(14,2), -- preço total de venda
  ADD COLUMN IF NOT EXISTS margin_percent NUMERIC(5,2), -- margem calculada
  ADD COLUMN IF NOT EXISTS total_pax INT; -- passageiros totais calculados
