
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  primary_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  destination text,
  departure_date date,
  return_date date,
  status text NOT NULL DEFAULT 'planning',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trips in own org" ON public.trips FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create trips in own org" ON public.trips FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update trips in own org" ON public.trips FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete trips in own org" ON public.trips FOR DELETE TO authenticated USING (org_id = get_my_org_id());
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.kanban_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view boards in own org" ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create boards in own org" ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update boards in own org" ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete boards in own org" ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = get_my_org_id());
CREATE TRIGGER update_kanban_boards_updated_at BEFORE UPDATE ON public.kanban_boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.kanban_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  name text NOT NULL,
  "position" integer NOT NULL DEFAULT 0,
  color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view columns via board org" ON public.kanban_columns FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can create columns via board org" ON public.kanban_columns FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can update columns via board org" ON public.kanban_columns FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can delete columns via board org" ON public.kanban_columns FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));

CREATE TABLE public.kanban_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id uuid NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  board_id uuid NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "position" integer NOT NULL DEFAULT 0,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  assigned_to uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view cards via board org" ON public.kanban_cards FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can create cards via board org" ON public.kanban_cards FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can update cards via board org" ON public.kanban_cards FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));
CREATE POLICY "Users can delete cards via board org" ON public.kanban_cards FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));
CREATE TRIGGER update_kanban_cards_updated_at BEFORE UPDATE ON public.kanban_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.hotels_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  stars integer,
  city text,
  state text,
  country text DEFAULT 'Brasil',
  address text,
  phone text,
  email text,
  website text,
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view hotels in own org" ON public.hotels_bank FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create hotels in own org" ON public.hotels_bank FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update hotels in own org" ON public.hotels_bank FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete hotels in own org" ON public.hotels_bank FOR DELETE TO authenticated USING (org_id = get_my_org_id());
CREATE TRIGGER update_hotels_bank_updated_at BEFORE UPDATE ON public.hotels_bank FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_to uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view tickets in own org" ON public.tickets FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create tickets in own org" ON public.tickets FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update tickets in own org" ON public.tickets FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete tickets in own org" ON public.tickets FOR DELETE TO authenticated USING (org_id = get_my_org_id());
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id uuid,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages via ticket org" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create messages via ticket org" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete messages via ticket org" ON public.ticket_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));

CREATE TABLE public.checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  share_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view checklists in own org" ON public.checklists FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create checklists in own org" ON public.checklists FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update checklists in own org" ON public.checklists FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete checklists in own org" ON public.checklists FOR DELETE TO authenticated USING (org_id = get_my_org_id());
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_checked boolean NOT NULL DEFAULT false,
  checked_at timestamptz,
  "position" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items via checklist org" ON public.checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can create items via checklist org" ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can update items via checklist org" ON public.checklist_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));
CREATE POLICY "Users can delete items via checklist org" ON public.checklist_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.ensure_default_kanban_boards(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _board_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id) THEN
    INSERT INTO public.kanban_boards (org_id, name, slug) VALUES (_org_id, 'Vendas', 'vendas') RETURNING id INTO _board_id;
    INSERT INTO public.kanban_columns (board_id, name, "position", color) VALUES
      (_board_id, 'Leads', 0, '#94a3b8'),
      (_board_id, 'Contato Feito', 1, '#60a5fa'),
      (_board_id, 'Proposta Enviada', 2, '#fbbf24'),
      (_board_id, 'Negociação', 3, '#f97316'),
      (_board_id, 'Fechado', 4, '#22c55e'),
      (_board_id, 'Perdido', 5, '#ef4444');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_checklist(_token uuid)
RETURNS TABLE(
  checklist_id uuid,
  checklist_title text,
  item_id uuid,
  item_title text,
  item_description text,
  is_checked boolean,
  item_position integer,
  org_name text,
  org_logo text,
  org_primary_color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.title,
    ci.id, ci.title, ci.description,
    ci.is_checked, ci."position",
    o.name, o.logo_url, o.primary_color
  FROM public.checklists c
  JOIN public.organizations o ON o.id = c.org_id
  LEFT JOIN public.checklist_items ci ON ci.checklist_id = c.id
  WHERE c.share_token = _token
  ORDER BY ci."position";
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_public_checklist_item(_item_id uuid, _token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_state boolean;
BEGIN
  UPDATE public.checklist_items ci
  SET is_checked = NOT ci.is_checked,
      checked_at = CASE WHEN NOT ci.is_checked THEN now() ELSE NULL END
  FROM public.checklists c
  WHERE ci.id = _item_id
    AND ci.checklist_id = c.id
    AND c.share_token = _token
  RETURNING ci.is_checked INTO _new_state;
  RETURN _new_state;
END;
$$;
