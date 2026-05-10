-- =====================================================================
-- MIGRAÇÃO: 20260428000013_restore_all_dropped_policies
-- Restaura TODAS as políticas que foram dropadas devido ao CASCADE do DROP FUNCTION get_my_org_id()
-- =====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own org" ON public.organizations;
CREATE POLICY "Users can view own org"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org admins can update own org" ON public.organizations;
CREATE POLICY "Org admins can update own org" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id = get_my_org_id() AND has_role(auth.uid(), 'org_admin'))
  WITH CHECK (id = get_my_org_id());

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (get_my_org_id() IS NULL);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view clients in own org" ON public.clients;
CREATE POLICY "Users can view clients in own org" ON public.clients
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create clients in own org" ON public.clients;
CREATE POLICY "Users can create clients in own org" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update clients in own org" ON public.clients;
CREATE POLICY "Users can update clients in own org" ON public.clients
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete clients in own org" ON public.clients;
CREATE POLICY "Users can delete clients in own org" ON public.clients
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view travelers in own org" ON public.travelers;
CREATE POLICY "Users can view travelers in own org" ON public.travelers
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create travelers in own org" ON public.travelers;
CREATE POLICY "Users can create travelers in own org" ON public.travelers
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update travelers in own org" ON public.travelers;
CREATE POLICY "Users can update travelers in own org" ON public.travelers
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete travelers in own org" ON public.travelers;
CREATE POLICY "Users can delete travelers in own org" ON public.travelers
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can view docs in own org" ON public.traveler_documents
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can create docs in own org" ON public.traveler_documents
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can update docs in own org" ON public.traveler_documents
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete docs in own org" ON public.traveler_documents;
CREATE POLICY "Users can delete docs in own org" ON public.traveler_documents
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view groups in own org" ON public.travel_groups;
CREATE POLICY "Users can view groups in own org" ON public.travel_groups
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create groups in own org" ON public.travel_groups;
CREATE POLICY "Users can create groups in own org" ON public.travel_groups
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update groups in own org" ON public.travel_groups;
CREATE POLICY "Users can update groups in own org" ON public.travel_groups
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete groups in own org" ON public.travel_groups;
CREATE POLICY "Users can delete groups in own org" ON public.travel_groups
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.travel_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view members via group org" ON public.travel_group_members;
CREATE POLICY "Users can view members via group org" ON public.travel_group_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));

ALTER TABLE public.travel_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create members via group org" ON public.travel_group_members;
CREATE POLICY "Users can create members via group org" ON public.travel_group_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));

ALTER TABLE public.travel_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete members via group org" ON public.travel_group_members;
CREATE POLICY "Users can delete members via group org" ON public.travel_group_members
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM travel_groups g WHERE g.id = travel_group_members.group_id AND g.org_id = get_my_org_id()));

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
CREATE POLICY "Users can view quotations in own org" ON public.quotations
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
CREATE POLICY "Users can create quotations in own org" ON public.quotations
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
CREATE POLICY "Users can update quotations in own org" ON public.quotations
  FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
CREATE POLICY "Users can delete quotations in own org" ON public.quotations
  FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trips in own org" ON public.trips;
CREATE POLICY "Users can view trips in own org" ON public.trips FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create trips in own org" ON public.trips;
CREATE POLICY "Users can create trips in own org" ON public.trips FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update trips in own org" ON public.trips;
CREATE POLICY "Users can update trips in own org" ON public.trips FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete trips in own org" ON public.trips;
CREATE POLICY "Users can delete trips in own org" ON public.trips FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trip flights in own org" ON public.trip_flights;
CREATE POLICY "Users can view trip flights in own org" ON public.trip_flights FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create trip flights in own org" ON public.trip_flights;
CREATE POLICY "Users can create trip flights in own org" ON public.trip_flights FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update trip flights in own org" ON public.trip_flights;
CREATE POLICY "Users can update trip flights in own org" ON public.trip_flights FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete trip flights in own org" ON public.trip_flights;
CREATE POLICY "Users can delete trip flights in own org" ON public.trip_flights FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trip travelers in own org" ON public.trip_travelers;
CREATE POLICY "Users can view trip travelers in own org" ON public.trip_travelers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create trip travelers in own org" ON public.trip_travelers;
CREATE POLICY "Users can create trip travelers in own org" ON public.trip_travelers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update trip travelers in own org" ON public.trip_travelers;
CREATE POLICY "Users can update trip travelers in own org" ON public.trip_travelers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete trip travelers in own org" ON public.trip_travelers;
CREATE POLICY "Users can delete trip travelers in own org" ON public.trip_travelers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trip documents in own org" ON public.trip_documents;
CREATE POLICY "Users can view trip documents in own org" ON public.trip_documents FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create trip documents in own org" ON public.trip_documents;
CREATE POLICY "Users can create trip documents in own org" ON public.trip_documents FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update trip documents in own org" ON public.trip_documents;
CREATE POLICY "Users can update trip documents in own org" ON public.trip_documents FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete trip documents in own org" ON public.trip_documents;
CREATE POLICY "Users can delete trip documents in own org" ON public.trip_documents FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view kanban boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can view kanban boards in own org" ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create kanban boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can create kanban boards in own org" ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update kanban boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can update kanban boards in own org" ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete kanban boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can delete kanban boards in own org" ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view kanban columns in own org" ON public.kanban_columns;
CREATE POLICY "Users can view kanban columns in own org" ON public.kanban_columns FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create kanban columns in own org" ON public.kanban_columns;
CREATE POLICY "Users can create kanban columns in own org" ON public.kanban_columns FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update kanban columns in own org" ON public.kanban_columns;
CREATE POLICY "Users can update kanban columns in own org" ON public.kanban_columns FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete kanban columns in own org" ON public.kanban_columns;
CREATE POLICY "Users can delete kanban columns in own org" ON public.kanban_columns FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view kanban cards in own org" ON public.kanban_cards;
CREATE POLICY "Users can view kanban cards in own org" ON public.kanban_cards FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create kanban cards in own org" ON public.kanban_cards;
CREATE POLICY "Users can create kanban cards in own org" ON public.kanban_cards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update kanban cards in own org" ON public.kanban_cards;
CREATE POLICY "Users can update kanban cards in own org" ON public.kanban_cards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete kanban cards in own org" ON public.kanban_cards;
CREATE POLICY "Users can delete kanban cards in own org" ON public.kanban_cards FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view hotels in own org" ON public.hotels_bank;
CREATE POLICY "Users can view hotels in own org" ON public.hotels_bank FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create hotels in own org" ON public.hotels_bank;
CREATE POLICY "Users can create hotels in own org" ON public.hotels_bank FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update hotels in own org" ON public.hotels_bank;
CREATE POLICY "Users can update hotels in own org" ON public.hotels_bank FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete hotels in own org" ON public.hotels_bank;
CREATE POLICY "Users can delete hotels in own org" ON public.hotels_bank FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view tickets in own org" ON public.tickets;
CREATE POLICY "Users can view tickets in own org" ON public.tickets FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create tickets in own org" ON public.tickets;
CREATE POLICY "Users can create tickets in own org" ON public.tickets FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update tickets in own org" ON public.tickets;
CREATE POLICY "Users can update tickets in own org" ON public.tickets FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete tickets in own org" ON public.tickets;
CREATE POLICY "Users can delete tickets in own org" ON public.tickets FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view ticket messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can view ticket messages via ticket org" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create ticket messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can create ticket messages via ticket org" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update ticket messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can update ticket messages via ticket org" ON public.ticket_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete ticket messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can delete ticket messages via ticket org" ON public.ticket_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view checklists in own org" ON public.checklists;
CREATE POLICY "Users can view checklists in own org" ON public.checklists FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create checklists in own org" ON public.checklists;
CREATE POLICY "Users can create checklists in own org" ON public.checklists FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update checklists in own org" ON public.checklists;
CREATE POLICY "Users can update checklists in own org" ON public.checklists FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete checklists in own org" ON public.checklists;
CREATE POLICY "Users can delete checklists in own org" ON public.checklists FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view checklist items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can view checklist items via checklist org" ON public.checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create checklist items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can create checklist items via checklist org" ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update checklist items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can update checklist items via checklist org" ON public.checklist_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete checklist items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can delete checklist items via checklist org" ON public.checklist_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can view boards in own org" ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can create boards in own org" ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can update boards in own org" ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete boards in own org" ON public.kanban_boards;
CREATE POLICY "Users can delete boards in own org" ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view columns via board org" ON public.kanban_columns;
CREATE POLICY "Users can view columns via board org" ON public.kanban_columns FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create columns via board org" ON public.kanban_columns;
CREATE POLICY "Users can create columns via board org" ON public.kanban_columns FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update columns via board org" ON public.kanban_columns;
CREATE POLICY "Users can update columns via board org" ON public.kanban_columns FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete columns via board org" ON public.kanban_columns;
CREATE POLICY "Users can delete columns via board org" ON public.kanban_columns FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_columns.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view cards via board org" ON public.kanban_cards;
CREATE POLICY "Users can view cards via board org" ON public.kanban_cards FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create cards via board org" ON public.kanban_cards;
CREATE POLICY "Users can create cards via board org" ON public.kanban_cards FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update cards via board org" ON public.kanban_cards;
CREATE POLICY "Users can update cards via board org" ON public.kanban_cards FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete cards via board org" ON public.kanban_cards;
CREATE POLICY "Users can delete cards via board org" ON public.kanban_cards FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.kanban_boards b WHERE b.id = kanban_cards.board_id AND b.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can view messages via ticket org" ON public.ticket_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can create messages via ticket org" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete messages via ticket org" ON public.ticket_messages;
CREATE POLICY "Users can delete messages via ticket org" ON public.ticket_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_messages.ticket_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can view items via checklist org" ON public.checklist_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can create items via checklist org" ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can update items via checklist org" ON public.checklist_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete items via checklist org" ON public.checklist_items;
CREATE POLICY "Users can delete items via checklist org" ON public.checklist_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_items.checklist_id AND c.org_id = get_my_org_id()));

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view flights via trip org" ON public.trip_flights;
CREATE POLICY "Users can view flights via trip org" ON public.trip_flights FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create flights via trip org" ON public.trip_flights;
CREATE POLICY "Users can create flights via trip org" ON public.trip_flights FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update flights via trip org" ON public.trip_flights;
CREATE POLICY "Users can update flights via trip org" ON public.trip_flights FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete flights via trip org" ON public.trip_flights;
CREATE POLICY "Users can delete flights via trip org" ON public.trip_flights FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_flights.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view docs via trip org" ON public.trip_documents;
CREATE POLICY "Users can view docs via trip org" ON public.trip_documents FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create docs via trip org" ON public.trip_documents;
CREATE POLICY "Users can create docs via trip org" ON public.trip_documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update docs via trip org" ON public.trip_documents;
CREATE POLICY "Users can update docs via trip org" ON public.trip_documents FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete docs via trip org" ON public.trip_documents;
CREATE POLICY "Users can delete docs via trip org" ON public.trip_documents FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_documents.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trip travelers via trip org" ON public.trip_travelers;
CREATE POLICY "Users can view trip travelers via trip org" ON public.trip_travelers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create trip travelers via trip org" ON public.trip_travelers;
CREATE POLICY "Users can create trip travelers via trip org" ON public.trip_travelers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update trip travelers via trip org" ON public.trip_travelers;
CREATE POLICY "Users can update trip travelers via trip org" ON public.trip_travelers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete trip travelers via trip org" ON public.trip_travelers;
CREATE POLICY "Users can delete trip travelers via trip org" ON public.trip_travelers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_travelers.trip_id AND t.org_id = get_my_org_id()));

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admins acessam ai_keys_pool" ON public.ai_keys_pool;
CREATE POLICY "Apenas admins acessam ai_keys_pool" ON ai_keys_pool FOR ALL
  TO authenticated
  USING (
    org_id = get_my_org_id()
  );

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org acessam knowledge base" ON public.ai_knowledge_base;
CREATE POLICY "Membros da org acessam knowledge base" ON ai_knowledge_base FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org acessam destination_guides para edicao" ON public.destination_guides;
CREATE POLICY "Membros da org acessam destination_guides para edicao" ON destination_guides FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clientes acessam destination_guides publicados" ON public.destination_guides;
CREATE POLICY "Clientes acessam destination_guides publicados" ON destination_guides FOR SELECT
  TO authenticated
  USING (is_published = TRUE AND org_id = get_my_org_id());

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_keys_pool_select" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_select" ON public.ai_keys_pool
  FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_keys_pool_insert" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_insert" ON public.ai_keys_pool
  FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_keys_pool_update" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_update" ON public.ai_keys_pool
  FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_keys_pool_delete" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_delete" ON public.ai_keys_pool
  FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "destination_guides_select" ON public.destination_guides;
CREATE POLICY "destination_guides_select" ON public.destination_guides
  FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "destination_guides_insert" ON public.destination_guides;
CREATE POLICY "destination_guides_insert" ON public.destination_guides
  FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "destination_guides_update" ON public.destination_guides;
CREATE POLICY "destination_guides_update" ON public.destination_guides
  FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "destination_guides_delete" ON public.destination_guides;
CREATE POLICY "destination_guides_delete" ON public.destination_guides
  FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org gerenciam kanban_notes" ON public.kanban_notes;
CREATE POLICY "Membros da org gerenciam kanban_notes" ON kanban_notes FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org gerenciam kanban_checklists" ON public.kanban_checklists;
CREATE POLICY "Membros da org gerenciam kanban_checklists" ON kanban_checklists FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org gerenciam kanban_checklist_items" ON public.kanban_checklist_items;
CREATE POLICY "Membros da org gerenciam kanban_checklist_items" ON kanban_checklist_items FOR ALL
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM kanban_checklists WHERE org_id = get_my_org_id()
    )
  )
  WITH CHECK (
    checklist_id IN (
      SELECT id FROM kanban_checklists WHERE org_id = get_my_org_id()
    )
  );

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org gerenciam kanban_tags" ON public.kanban_tags;
CREATE POLICY "Membros da org gerenciam kanban_tags" ON kanban_tags FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.kanban_card_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros da org gerenciam kanban_card_tags" ON public.kanban_card_tags;
CREATE POLICY "Membros da org gerenciam kanban_card_tags" ON kanban_card_tags FOR ALL
  TO authenticated
  USING (
    card_id IN (
      SELECT id FROM kanban_cards WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE org_id = get_my_org_id()
      )
    )
  )
  WITH CHECK (
    card_id IN (
      SELECT id FROM kanban_cards WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE org_id = get_my_org_id()
      )
    )
  );

ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization info pages" ON public.traveler_info_pages;
CREATE POLICY "Users can view their organization info pages" ON traveler_info_pages FOR SELECT
    USING (org_id = get_my_org_id());

ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their organization info pages" ON public.traveler_info_pages;
CREATE POLICY "Users can insert their organization info pages" ON traveler_info_pages FOR INSERT
    WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update their organization info pages" ON public.traveler_info_pages;
CREATE POLICY "Users can update their organization info pages" ON traveler_info_pages FOR UPDATE
    USING (org_id = get_my_org_id());

ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete their organization info pages" ON public.traveler_info_pages;
CREATE POLICY "Users can delete their organization info pages" ON traveler_info_pages FOR DELETE
    USING (org_id = get_my_org_id());

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_org" ON public.kanban_tags;
CREATE POLICY "kanban_tags_org" ON public.kanban_tags FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_org" ON public.kanban_notes;
CREATE POLICY "kanban_notes_org" ON public.kanban_notes FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_org" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_org" ON public.kanban_checklists FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_checklists cl WHERE cl.id = checklist_id AND cl.org_id = public.get_my_org_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kanban_checklists cl WHERE cl.id = checklist_id AND cl.org_id = public.get_my_org_id()
    )
  );

ALTER TABLE public.traveler_info_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "traveler_info_pages_org" ON public.traveler_info_pages;
CREATE POLICY "traveler_info_pages_org" ON public.traveler_info_pages FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.hotel_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Membros gerenciam hotel_reviews" ON public.hotel_reviews;
CREATE POLICY "Membros gerenciam hotel_reviews" ON hotel_reviews FOR ALL
  TO authenticated
  USING  (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.quote_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage quote transfers in own org" ON public.quote_transfers;
CREATE POLICY "Users can manage quote transfers in own org" ON public.quote_transfers FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quote_id AND q.org_id = get_my_org_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quote_id AND q.org_id = get_my_org_id()
  ));

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage policy cache in own org" ON public.policy_cache;
CREATE POLICY "Users can manage policy cache in own org" ON public.policy_cache FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage experiences in own org" ON public.experiences;
CREATE POLICY "Users can manage experiences in own org" ON public.experiences FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.quote_experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage quote experiences in own org" ON public.quote_experiences;
CREATE POLICY "Users can manage quote experiences in own org" ON public.quote_experiences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = get_my_org_id()));

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_cache_select" ON public.policy_cache;
CREATE POLICY "policy_cache_select" ON public.policy_cache FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_cache_insert" ON public.policy_cache;
CREATE POLICY "policy_cache_insert" ON public.policy_cache FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_cache_update" ON public.policy_cache;
CREATE POLICY "policy_cache_update" ON public.policy_cache FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "policy_cache_delete" ON public.policy_cache;
CREATE POLICY "policy_cache_delete" ON public.policy_cache FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
CREATE POLICY "experiences_select" ON public.experiences FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
CREATE POLICY "experiences_insert" ON public.experiences FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
CREATE POLICY "experiences_update" ON public.experiences FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;
CREATE POLICY "experiences_delete" ON public.experiences FOR DELETE TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.flight_segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can view flight_segments" ON public.flight_segments;
CREATE POLICY "Auth can view flight_segments" ON public.flight_segments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.flight_segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can modify flight_segments" ON public.flight_segments;
CREATE POLICY "Auth can modify flight_segments" ON public.flight_segments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.flight_amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can view flight_amenities" ON public.flight_amenities;
CREATE POLICY "Auth can view flight_amenities" ON public.flight_amenities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.flight_amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can modify flight_amenities" ON public.flight_amenities;
CREATE POLICY "Auth can modify flight_amenities" ON public.flight_amenities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.flights f JOIN public.quotations q ON q.id = f.quote_id WHERE f.id = flight_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can view itinerary_items" ON public.itinerary_items;
CREATE POLICY "Auth can view itinerary_items" ON public.itinerary_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can modify itinerary_items" ON public.itinerary_items;
CREATE POLICY "Auth can modify itinerary_items" ON public.itinerary_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.itinerary_days d JOIN public.quotations q ON q.id = d.quote_id WHERE d.id = itinerary_day_id AND q.org_id = public.get_my_org_id())
);

ALTER TABLE public.guide_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can manage guide_pages" ON public.guide_pages;
CREATE POLICY "Auth can manage guide_pages" ON public.guide_pages
  FOR ALL TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth can manage route_stops" ON public.route_stops;
CREATE POLICY "Auth can manage route_stops" ON public.route_stops
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.guide_pages p WHERE p.id = guide_page_id AND p.org_id = public.get_my_org_id())
  );

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage contract_templates" ON public.contract_templates;
CREATE POLICY "org members can manage contract_templates" ON public.contract_templates
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.communication_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage communication_rules" ON public.communication_rules;
CREATE POLICY "org members can manage communication_rules" ON public.communication_rules
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.financial_suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage financial_suppliers" ON public.financial_suppliers;
CREATE POLICY "org members can manage financial_suppliers" ON public.financial_suppliers
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage financial_transactions" ON public.financial_transactions;
CREATE POLICY "org members can manage financial_transactions" ON public.financial_transactions
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage itineraries" ON public.itineraries;
CREATE POLICY "org members manage itineraries" ON public.itineraries
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.itinerary_stops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage itinerary_stops" ON public.itinerary_stops;
CREATE POLICY "org members manage itinerary_stops" ON public.itinerary_stops
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.org_id = public.get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.itineraries i WHERE i.id = itinerary_id AND i.org_id = public.get_my_org_id())
  );

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage team_members" ON public.team_members;
CREATE POLICY "org members manage team_members" ON public.team_members
  FOR ALL USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.bus_layouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage bus_layouts" ON public.bus_layouts;
CREATE POLICY "org members manage bus_layouts" ON public.bus_layouts
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage group_trips" ON public.group_trips;
CREATE POLICY "org members manage group_trips" ON public.group_trips
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.group_trip_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org manages days via parent" ON public.group_trip_days;
CREATE POLICY "org manages days via parent" ON public.group_trip_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  );

ALTER TABLE public.group_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members manage group_bookings" ON public.group_bookings;
CREATE POLICY "org members manage group_bookings" ON public.group_bookings
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.booking_installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org manages installments via booking" ON public.booking_installments;
CREATE POLICY "org manages installments via booking" ON public.booking_installments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_bookings b WHERE b.id = booking_id AND b.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_bookings b WHERE b.id = booking_id AND b.org_id = get_my_org_id())
  );

ALTER TABLE public.bus_seat_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org manages seats via trip" ON public.bus_seat_assignments;
CREATE POLICY "org manages seats via trip" ON public.bus_seat_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  );

ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org reads contract_signatures" ON public.contract_signatures;
CREATE POLICY "org reads contract_signatures" ON public.contract_signatures
  FOR SELECT USING (org_id = get_my_org_id());

ALTER TABLE public.b2b_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their org B2B credentials" ON public.b2b_credentials;
CREATE POLICY "Users can manage their org B2B credentials" ON public.b2b_credentials 
FOR ALL USING (org_id = get_my_org_id());

ALTER TABLE public.proactive_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage proactive_alerts" ON public.proactive_alerts;
CREATE POLICY "org members can manage proactive_alerts" ON public.proactive_alerts
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.memory_contexts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage memory_contexts" ON public.memory_contexts;
CREATE POLICY "org members can manage memory_contexts" ON public.memory_contexts
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.client_identities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage client_identities" ON public.client_identities;
CREATE POLICY "org members can manage client_identities" ON public.client_identities
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.external_entities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage external_entities" ON public.external_entities;
CREATE POLICY "org members can manage external_entities" ON public.external_entities
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.wa_session_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage wa_session_metrics" ON public.wa_session_metrics;
CREATE POLICY "org members can manage wa_session_metrics" ON public.wa_session_metrics
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.wa_conversation_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage wa_conversation_logs" ON public.wa_conversation_logs;
CREATE POLICY "org members can manage wa_conversation_logs" ON public.wa_conversation_logs
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.operator_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members can manage operator_snapshots" ON public.operator_snapshots;
CREATE POLICY "org members can manage operator_snapshots" ON public.operator_snapshots
  FOR ALL
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_events_select" ON public.ticket_events;
CREATE POLICY "ticket_events_select" ON public.ticket_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_events_insert" ON public.ticket_events;
CREATE POLICY "ticket_events_insert" ON public.ticket_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_attachments_select" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_select" ON public.ticket_attachments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_attachments_insert" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_insert" ON public.ticket_attachments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_attachments_delete" ON public.ticket_attachments;
CREATE POLICY "ticket_attachments_delete" ON public.ticket_attachments FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tickets t 
    WHERE t.id = ticket_id AND t.org_id = get_my_org_id()
  ));

ALTER TABLE public.email_tracking_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view tracking logs for their org" ON public.email_tracking_logs;
CREATE POLICY "Users can view tracking logs for their org"
    ON public.email_tracking_logs
    FOR SELECT
    USING (org_id = public.get_my_org_id());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members view media assets" ON public.media_assets;
CREATE POLICY "org members view media assets" ON public.media_assets
  FOR SELECT TO authenticated
  USING (org_id = public.get_my_org_id());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members insert media assets" ON public.media_assets;
CREATE POLICY "org members insert media assets" ON public.media_assets
  FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members update media assets" ON public.media_assets;
CREATE POLICY "org members update media assets" ON public.media_assets
  FOR UPDATE TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org members delete media assets" ON public.media_assets;
CREATE POLICY "org members delete media assets" ON public.media_assets
  FOR DELETE TO authenticated
  USING (org_id = public.get_my_org_id());

ALTER TABLE public.corporate_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their org corporate_policies" ON public.corporate_policies;
CREATE POLICY "Users can read their org corporate_policies" ON public.corporate_policies 
FOR SELECT USING (org_id = get_my_org_id());

ALTER TABLE public.corporate_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage their org corporate_policies" ON public.corporate_policies;
CREATE POLICY "Admins can manage their org corporate_policies" ON public.corporate_policies 
FOR ALL USING (org_id = get_my_org_id());

ALTER TABLE public.hotel_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their org hotel reviews" ON public.hotel_reviews;
CREATE POLICY "Users can manage their org hotel reviews"
    ON public.hotel_reviews
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view bookings in own org" ON public.bookings;
CREATE POLICY "Users view bookings in own org" ON public.bookings
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users create bookings in own org" ON public.bookings;
CREATE POLICY "Users create bookings in own org" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users update bookings in own org" ON public.bookings;
CREATE POLICY "Users update bookings in own org" ON public.bookings
  FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view payments in own org" ON public.payments;
CREATE POLICY "Users view payments in own org" ON public.payments
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage payments in own org" ON public.payments;
CREATE POLICY "Users manage payments in own org" ON public.payments
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view agents in own org" ON public.ai_agents;
CREATE POLICY "Users view agents in own org" ON public.ai_agents
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage agents in own org" ON public.ai_agents;
CREATE POLICY "Users manage agents in own org" ON public.ai_agents
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view tasks in own org" ON public.ai_tasks;
CREATE POLICY "Users view tasks in own org" 
  ON public.ai_tasks
  FOR SELECT 
  TO authenticated 
  USING (
    org_id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );

ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage tasks in own org" ON public.ai_tasks;
CREATE POLICY "Users manage tasks in own org" ON public.ai_tasks
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_org_select" ON public.chat_sessions;
create policy chat_sessions_org_select on public.chat_sessions
  for select to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid());

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_org_insert" ON public.chat_sessions;
create policy chat_sessions_org_insert on public.chat_sessions
  for insert to authenticated
  with check (org_id = public.get_my_org_id() and user_id = auth.uid());

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_org_update" ON public.chat_sessions;
create policy chat_sessions_org_update on public.chat_sessions
  for update to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid())
  with check (org_id = public.get_my_org_id() and user_id = auth.uid());

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_sessions_org_delete" ON public.chat_sessions;
create policy chat_sessions_org_delete on public.chat_sessions
  for delete to authenticated
  using (org_id = public.get_my_org_id() and user_id = auth.uid());

ALTER TABLE public.portal_ai_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_ai_photos_org_all" ON public.portal_ai_photos;
create policy portal_ai_photos_org_all on public.portal_ai_photos
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

ALTER TABLE public.itinerary_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "itinerary_leads_org_select" ON public.itinerary_leads;
create policy itinerary_leads_org_select on public.itinerary_leads
  for select to authenticated
  using (org_id = public.get_my_org_id());

ALTER TABLE public.itinerary_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "itinerary_leads_org_insert" ON public.itinerary_leads;
create policy itinerary_leads_org_insert on public.itinerary_leads
  for insert to authenticated
  with check (org_id = public.get_my_org_id());

ALTER TABLE public.client_travel_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_travel_credits_org_all" ON public.client_travel_credits;
create policy client_travel_credits_org_all on public.client_travel_credits
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

ALTER TABLE public.email_inbound ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_inbound_org_all" ON public.email_inbound;
create policy email_inbound_org_all on public.email_inbound
  for all to authenticated
  using (org_id = public.get_my_org_id())
  with check (org_id = public.get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view bookings in own org" ON public.bookings;
CREATE POLICY "Users can view bookings in own org" ON public.bookings FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create bookings in own org" ON public.bookings;
CREATE POLICY "Users can create bookings in own org" ON public.bookings FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update bookings in own org" ON public.bookings;
CREATE POLICY "Users can update bookings in own org" ON public.bookings FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete bookings in own org" ON public.bookings;
CREATE POLICY "Users can delete bookings in own org" ON public.bookings FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view payments in own org" ON public.payments;
CREATE POLICY "Users can view payments in own org" ON public.payments FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create payments in own org" ON public.payments;
CREATE POLICY "Users can create payments in own org" ON public.payments FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update payments in own org" ON public.payments;
CREATE POLICY "Users can update payments in own org" ON public.payments FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete payments in own org" ON public.payments;
CREATE POLICY "Users can delete payments in own org" ON public.payments FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_select" ON public.organizations;
CREATE POLICY "orgs_select"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'super_admin'
    )
  );

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_update" ON public.organizations;
CREATE POLICY "orgs_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = public.get_my_org_id()
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('org_admin', 'super_admin')
    )
  )
  WITH CHECK (
    id = public.get_my_org_id()
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('org_admin', 'super_admin')
    )
  );

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members can view payments" ON public.payments;
CREATE POLICY "Org members can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org admins can manage payments" ON public.payments;
CREATE POLICY "Org admins can manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members can view bookings" ON public.bookings;
CREATE POLICY "Org members can view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org admins can manage bookings" ON public.bookings;
CREATE POLICY "Org admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (
    (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Own profile
    auth.uid() = user_id
    -- OR same org teammate (via SECURITY DEFINER function to prevent recursion)
    OR (
      org_id IS NOT NULL
      AND org_id = public.get_my_org_id()
    )
    -- OR super_admin (direct query on user_roles)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_member_select" ON public.organizations;
CREATE POLICY "orgs_member_select"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_admin_update" ON public.organizations;
CREATE POLICY "orgs_admin_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    (id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_boards_select" ON public.kanban_boards;
CREATE POLICY "kanban_boards_select" ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_boards_insert" ON public.kanban_boards;
CREATE POLICY "kanban_boards_insert" ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_boards_update" ON public.kanban_boards;
CREATE POLICY "kanban_boards_update" ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_boards_delete" ON public.kanban_boards;
CREATE POLICY "kanban_boards_delete" ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_columns_select" ON public.kanban_columns;
CREATE POLICY "kanban_columns_select" ON public.kanban_columns FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_columns_insert" ON public.kanban_columns;
CREATE POLICY "kanban_columns_insert" ON public.kanban_columns FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_columns_update" ON public.kanban_columns;
CREATE POLICY "kanban_columns_update" ON public.kanban_columns FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_columns_delete" ON public.kanban_columns;
CREATE POLICY "kanban_columns_delete" ON public.kanban_columns FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_cards_select" ON public.kanban_cards;
CREATE POLICY "kanban_cards_select" ON public.kanban_cards FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_cards_insert" ON public.kanban_cards;
CREATE POLICY "kanban_cards_insert" ON public.kanban_cards FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_cards_update" ON public.kanban_cards;
CREATE POLICY "kanban_cards_update" ON public.kanban_cards FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_cards_delete" ON public.kanban_cards;
CREATE POLICY "kanban_cards_delete" ON public.kanban_cards FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_select" ON public.kanban_notes;
CREATE POLICY "kanban_notes_select" ON public.kanban_notes FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_insert" ON public.kanban_notes;
CREATE POLICY "kanban_notes_insert" ON public.kanban_notes FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_update" ON public.kanban_notes;
CREATE POLICY "kanban_notes_update" ON public.kanban_notes FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_delete" ON public.kanban_notes;
CREATE POLICY "kanban_notes_delete" ON public.kanban_notes FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_select" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_select" ON public.kanban_checklists FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_insert" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_insert" ON public.kanban_checklists FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_update" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_update" ON public.kanban_checklists FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_delete" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_delete" ON public.kanban_checklists FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_select" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_select" ON public.kanban_checklist_items FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_insert" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_insert" ON public.kanban_checklist_items FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_update" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_update" ON public.kanban_checklist_items FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()))
WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_delete" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_delete" ON public.kanban_checklist_items FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_select" ON public.kanban_tags;
CREATE POLICY "kanban_tags_select" ON public.kanban_tags FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_insert" ON public.kanban_tags;
CREATE POLICY "kanban_tags_insert" ON public.kanban_tags FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_update" ON public.kanban_tags;
CREATE POLICY "kanban_tags_update" ON public.kanban_tags FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());

ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_delete" ON public.kanban_tags;
CREATE POLICY "kanban_tags_delete" ON public.kanban_tags FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

