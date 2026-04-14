-- 1. Add ticket_code to tickets table to allow easy referencing
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE;

-- Create function to auto-generate a 8-char ticket code [TCKR-ABCD1234] before insert
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := 'TCKR-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain ticket_code creation
DROP TRIGGER IF EXISTS trg_generate_ticket_code ON public.tickets;
CREATE TRIGGER trg_generate_ticket_code
BEFORE INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_code();

-- Generate codes for any existing tickets
UPDATE public.tickets 
SET ticket_code = 'TCKR-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8)) 
WHERE ticket_code IS NULL;

-- 2. Index for quick lookup by ticket code
CREATE INDEX IF NOT EXISTS idx_tickets_code_org ON public.tickets(ticket_code, org_id);

-- 3. Create email_messages table
CREATE TABLE IF NOT EXISTS public.email_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id       UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id         UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  
  -- Email metadata
  gmail_id        TEXT,
  thread_id       TEXT,
  subject         TEXT,
  from_email      TEXT,
  from_name       TEXT,
  to_emails       TEXT[],
  
  -- Content 
  body_text       TEXT,
  body_html       TEXT,
  attachments     JSONB DEFAULT '[]'::jsonb,
  
  -- AI Parsed Fields
  extracted_ticket_code TEXT,
  extracted_locator     TEXT,
  ai_type               TEXT,           -- 'cancelamento' | 'confirmacao' | 'duvida' | 'operadora'
  ai_priority           TEXT,           -- 'urgente' | 'alta' | 'normal' | 'baixa'
  ai_summary            TEXT,
  
  direction       TEXT DEFAULT 'inbound', -- 'inbound' | 'outbound'
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for email_messages
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view emails of their organization') THEN
        CREATE POLICY "Users can view emails of their organization" 
        ON public.email_messages FOR SELECT 
        USING (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert emails to their organization') THEN
        CREATE POLICY "Users can insert emails to their organization" 
        ON public.email_messages FOR INSERT 
        WITH CHECK (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update emails of their organization') THEN
        CREATE POLICY "Users can update emails of their organization" 
        ON public.email_messages FOR UPDATE 
        USING (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_messages_ticket ON public.email_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_client ON public.email_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_trip   ON public.email_messages(trip_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_received ON public.email_messages(received_at DESC);

-- View to union all touchpoints into a unified client timeline
-- Notice: drops and replaces for safety
DROP VIEW IF EXISTS public.client_timeline;
CREATE OR REPLACE VIEW public.client_timeline AS
SELECT 
  client_id,
  'ticket' as type, 
  id as entity_id, 
  title as summary, 
  created_at as interaction_date, 
  NULL::text as agent_name,
  org_id
FROM public.tickets
UNION ALL
SELECT 
  client_id, 
  'email' as type, 
  id as entity_id, 
  subject as summary, 
  received_at as interaction_date, 
  NULL::text as agent_name,
  org_id
FROM public.email_messages
WHERE client_id IS NOT NULL
UNION ALL
SELECT 
  client_id, 
  'whatsapp' as type, 
  id as entity_id, 
  ai_summary as summary, 
  started_at as interaction_date, 
  agent_id::text as agent_name,
  org_id
FROM public.wa_conversation_logs
WHERE client_id IS NOT NULL
UNION ALL
SELECT 
  primary_client_id as client_id, 
  'trip' as type, 
  id as entity_id, 
  title as summary, 
  created_at as interaction_date, 
  assigned_agent_id::text as agent_name,
  org_id
FROM public.trips
UNION ALL
SELECT 
  client_id, 
  'quotation' as type, 
  id as entity_id, 
  title as summary, 
  created_at as interaction_date, 
  agent_id::text as agent_name,
  org_id
FROM public.quotations
WHERE client_id IS NOT NULL;
