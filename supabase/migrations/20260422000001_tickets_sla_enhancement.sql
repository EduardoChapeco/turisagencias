-- Migration to add SLA and Priority Score to Tickets
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS sla_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz DEFAULT now();

-- Update trigger to maintain last_interaction_at
CREATE OR REPLACE FUNCTION update_ticket_interaction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tickets
  SET last_interaction_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_ticket_interaction ON public.ticket_messages;
CREATE TRIGGER tr_update_ticket_interaction
AFTER INSERT ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION update_ticket_interaction_timestamp();

-- Index for SLA monitoring
CREATE INDEX IF NOT EXISTS idx_tickets_sla ON public.tickets(sla_deadline) WHERE status != 'closed';
