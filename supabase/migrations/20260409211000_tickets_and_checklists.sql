-- Tickets and checklists MVP

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_type TEXT NOT NULL DEFAULT 'agent',
  created_by_id UUID,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'support',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tickets_org ON public.tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_trip ON public.tickets(trip_id);
DROP TRIGGER IF EXISTS update_tickets_updated_at ON public.tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view tickets in own org"
  ON public.tickets FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create tickets in own org"
  ON public.tickets FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update tickets in own org"
  ON public.tickets FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete tickets in own org"
  ON public.tickets FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'agent',
  sender_id UUID,
  content TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view ticket messages via ticket org"
  ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create ticket messages via ticket org"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can update ticket messages via ticket org"
  ON public.ticket_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete ticket messages via ticket org"
  ON public.ticket_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));

CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'trip_instance',
  is_visible_to_client BOOLEAN NOT NULL DEFAULT false,
  share_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_checklists_org ON public.checklists(org_id);
CREATE INDEX IF NOT EXISTS idx_checklists_trip ON public.checklists(trip_id);

CREATE POLICY "Users can view checklists in own org"
  ON public.checklists FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create checklists in own org"
  ON public.checklists FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update checklists in own org"
  ON public.checklists FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete checklists in own org"
  ON public.checklists FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view checklist items via checklist org"
  ON public.checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can create checklist items via checklist org"
  ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can update checklist items via checklist org"
  ON public.checklist_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can delete checklist items via checklist org"
  ON public.checklist_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));

CREATE OR REPLACE FUNCTION public.get_public_checklist(_token UUID)
RETURNS TABLE (
  checklist_id UUID,
  title TEXT,
  item_id UUID,
  item_title TEXT,
  item_description TEXT,
  is_completed BOOLEAN,
  position INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    i.id,
    i.title,
    i.description,
    i.is_completed,
    i.position
  FROM public.checklists c
  JOIN public.checklist_items i ON i.checklist_id = c.id
  WHERE c.share_token = _token
    AND c.is_visible_to_client = true
  ORDER BY i.position, i.created_at
$$;

CREATE OR REPLACE FUNCTION public.toggle_public_checklist_item(_token UUID, _item_id UUID, _is_completed BOOLEAN)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _checklist_id UUID;
BEGIN
  UPDATE public.checklist_items i
  SET
    is_completed = _is_completed,
    completed_at = CASE WHEN _is_completed THEN now() ELSE NULL END
  FROM public.checklists c
  WHERE c.id = i.checklist_id
    AND c.share_token = _token
    AND c.is_visible_to_client = true
    AND i.id = _item_id
  RETURNING c.id INTO _checklist_id;

  RETURN _checklist_id;
END;
$$;
