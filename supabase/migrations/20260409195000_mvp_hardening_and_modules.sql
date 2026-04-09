-- Incremental hardening + MVP modules

-- 1. Normalize signup triggers/functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_promote_first_user ON auth.users;
DROP TRIGGER IF EXISTS on_first_user_promote ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agent')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_first_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count bigint;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;

  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'org_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auth_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_auth_user_first_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_first_user();

-- 2. Incremental schema alignment
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_keys_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.profiles
SET email = u.email
FROM auth.users u
WHERE u.id = public.profiles.user_id
  AND public.profiles.email IS NULL;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.travelers
  ADD COLUMN IF NOT EXISTS rg TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_expiry DATE,
  ADD COLUMN IF NOT EXISTS passport_country TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS frequent_flyer JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS vaccines JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS special_needs TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS trip_id UUID,
  ADD COLUMN IF NOT EXISTS departure_date DATE,
  ADD COLUMN IF NOT EXISTS return_date DATE,
  ADD COLUMN IF NOT EXISTS num_adults INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS num_children INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notes_internal TEXT;

UPDATE public.quotations
SET title = COALESCE(title, CONCAT_WS(' - ', destination, hotel_name))
WHERE title IS NULL;

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.create_notification(
  _org_id UUID,
  _user_id UUID,
  _type TEXT,
  _title TEXT,
  _message TEXT DEFAULT NULL,
  _entity_type TEXT DEFAULT NULL,
  _entity_id UUID DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    org_id, user_id, type, title, message, entity_type, entity_id, metadata
  )
  VALUES (
    _org_id, _user_id, _type, _title, _message, _entity_type, _entity_id, COALESCE(_metadata, '{}'::jsonb)
  )
  RETURNING id INTO _notification_id;

  RETURN _notification_id;
END;
$$;

-- 4. Trips workspace
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.travel_groups(id) ON DELETE SET NULL,
  primary_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  destination_city TEXT,
  destination_country TEXT,
  origin_city TEXT,
  departure_date DATE,
  return_date DATE,
  num_nights INT,
  status TEXT NOT NULL DEFAULT 'quoting',
  operator_id TEXT,
  operator_name TEXT,
  hotel_name TEXT,
  hotel_regime TEXT,
  includes_transfer BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'BRL',
  exchange_rate NUMERIC(10,4),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  contract_url TEXT,
  voucher_url TEXT,
  whatsapp_text_sent TEXT,
  notes_internal TEXT,
  notes_client TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_trips_org ON public.trips(org_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON public.trips(departure_date);

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view trips in own org"
  ON public.trips FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create trips in own org"
  ON public.trips FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update trips in own org"
  ON public.trips FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete trips in own org"
  ON public.trips FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.trip_flights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'outbound',
  airline_code TEXT,
  airline_name TEXT,
  flight_number TEXT,
  locator TEXT,
  origin_airport TEXT,
  origin_city TEXT,
  destination_airport TEXT,
  destination_city TEXT,
  departure_datetime TIMESTAMP WITH TIME ZONE,
  arrival_datetime TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  cabin_class TEXT NOT NULL DEFAULT 'economy',
  baggage_included BOOLEAN NOT NULL DEFAULT false,
  boarding_pass_url TEXT,
  checkin_done BOOLEAN NOT NULL DEFAULT false,
  checkin_done_at TIMESTAMP WITH TIME ZONE,
  checkin_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  change_notes TEXT,
  sequence INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_flights ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_trip_flights_trip ON public.trip_flights(trip_id);
DROP TRIGGER IF EXISTS update_trip_flights_updated_at ON public.trip_flights;
CREATE TRIGGER update_trip_flights_updated_at
  BEFORE UPDATE ON public.trip_flights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view trip flights in own org"
  ON public.trip_flights FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create trip flights in own org"
  ON public.trip_flights FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update trip flights in own org"
  ON public.trip_flights FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete trip flights in own org"
  ON public.trip_flights FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.trip_travelers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  traveler_id UUID NOT NULL REFERENCES public.travelers(id) ON DELETE CASCADE,
  ticket_number TEXT,
  seat_number TEXT,
  room_type TEXT,
  is_lead BOOLEAN NOT NULL DEFAULT false,
  form_token UUID NOT NULL DEFAULT gen_random_uuid(),
  form_completed_at TIMESTAMP WITH TIME ZONE,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (trip_id, traveler_id)
);

ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trip travelers in own org"
  ON public.trip_travelers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can create trip travelers in own org"
  ON public.trip_travelers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can update trip travelers in own org"
  ON public.trip_travelers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));
CREATE POLICY "Users can delete trip travelers in own org"
  ON public.trip_travelers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.org_id = get_my_org_id()));

CREATE TABLE IF NOT EXISTS public.trip_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  is_visible_to_client BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view trip documents in own org"
  ON public.trip_documents FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create trip documents in own org"
  ON public.trip_documents FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update trip documents in own org"
  ON public.trip_documents FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete trip documents in own org"
  ON public.trip_documents FOR DELETE TO authenticated USING (org_id = get_my_org_id());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'quotations_trip_id_fkey'
      AND table_name = 'quotations'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.quotations
      ADD CONSTRAINT quotations_trip_id_fkey
      FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Kanban
CREATE TABLE IF NOT EXISTS public.kanban_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  board_type TEXT NOT NULL DEFAULT 'sales',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (org_id, slug)
);

ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_kanban_boards_updated_at ON public.kanban_boards;
CREATE TRIGGER update_kanban_boards_updated_at
  BEFORE UPDATE ON public.kanban_boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view kanban boards in own org"
  ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create kanban boards in own org"
  ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update kanban boards in own org"
  ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete kanban boards in own org"
  ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  position INT NOT NULL DEFAULT 0,
  wip_limit INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_kanban_columns_updated_at ON public.kanban_columns;
CREATE TRIGGER update_kanban_columns_updated_at
  BEFORE UPDATE ON public.kanban_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view kanban columns in own org"
  ON public.kanban_columns FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create kanban columns in own org"
  ON public.kanban_columns FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update kanban columns in own org"
  ON public.kanban_columns FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete kanban columns in own org"
  ON public.kanban_columns FOR DELETE TO authenticated USING (org_id = get_my_org_id());

CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  position INT NOT NULL DEFAULT 0,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_kanban_cards_updated_at ON public.kanban_cards;
CREATE TRIGGER update_kanban_cards_updated_at
  BEFORE UPDATE ON public.kanban_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view kanban cards in own org"
  ON public.kanban_cards FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create kanban cards in own org"
  ON public.kanban_cards FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update kanban cards in own org"
  ON public.kanban_cards FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete kanban cards in own org"
  ON public.kanban_cards FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- 6. Hotels
CREATE TABLE IF NOT EXISTS public.hotels_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Brasil',
  category INT,
  regime_options TEXT[] NOT NULL DEFAULT '{}'::text[],
  description TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}'::text[],
  photos TEXT[] NOT NULL DEFAULT '{}'::text[],
  cover_photo_url TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  website TEXT,
  internal_rating NUMERIC(3,1),
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hotels_bank ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_hotels_bank_updated_at ON public.hotels_bank;
CREATE TRIGGER update_hotels_bank_updated_at
  BEFORE UPDATE ON public.hotels_bank
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view hotels in own org"
  ON public.hotels_bank FOR SELECT TO authenticated USING (org_id = get_my_org_id());
CREATE POLICY "Users can create hotels in own org"
  ON public.hotels_bank FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can update hotels in own org"
  ON public.hotels_bank FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "Users can delete hotels in own org"
  ON public.hotels_bank FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- 7. Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('client-photos', 'client-photos', false),
  ('trip-documents', 'trip-documents', false),
  ('boarding-passes', 'boarding-passes', false),
  ('hotel-photos', 'hotel-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can view client photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload client photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete client photos" ON storage.objects;
CREATE POLICY "Users can view client photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'client-photos');
CREATE POLICY "Users can upload client photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-photos');
CREATE POLICY "Users can delete client photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'client-photos');

DROP POLICY IF EXISTS "Users can view trip documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload trip documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete trip documents bucket" ON storage.objects;
CREATE POLICY "Users can view trip documents bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'trip-documents');
CREATE POLICY "Users can upload trip documents bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-documents');
CREATE POLICY "Users can delete trip documents bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'trip-documents');

DROP POLICY IF EXISTS "Users can view boarding passes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload boarding passes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete boarding passes bucket" ON storage.objects;
CREATE POLICY "Users can view boarding passes bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'boarding-passes');
CREATE POLICY "Users can upload boarding passes bucket"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'boarding-passes');
CREATE POLICY "Users can delete boarding passes bucket"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'boarding-passes');

DROP POLICY IF EXISTS "Users can view hotel photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload hotel photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete hotel photos" ON storage.objects;
CREATE POLICY "Users can view hotel photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'hotel-photos');
CREATE POLICY "Users can upload hotel photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hotel-photos');
CREATE POLICY "Users can delete hotel photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hotel-photos');

-- 8. Triggers for notifications
CREATE OR REPLACE FUNCTION public.notify_quotation_viewed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.viewed_at IS NOT NULL AND OLD.viewed_at IS NULL AND NEW.agent_id IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.org_id,
      NEW.agent_id,
      'quotation_viewed',
      'Cotação visualizada',
      COALESCE(NEW.destination, 'Sua cotação foi visualizada pelo cliente.'),
      'quotation',
      NEW.id,
      jsonb_build_object('status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_quotation_viewed ON public.quotations;
CREATE TRIGGER trg_notify_quotation_viewed
  AFTER UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_quotation_viewed();

CREATE OR REPLACE FUNCTION public.notify_traveler_form_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _agent_id UUID;
BEGIN
  IF NEW.form_completed_at IS NOT NULL AND OLD.form_completed_at IS NULL THEN
    SELECT COALESCE(c.assigned_agent_id, c.created_by)
      INTO _agent_id
    FROM public.clients c
    WHERE c.id = NEW.client_id;

    IF _agent_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.org_id,
        _agent_id,
        'traveler_form_completed',
        'Formulário de viajante concluído',
        NEW.full_name,
        'traveler',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_traveler_form_completed ON public.travelers;
CREATE TRIGGER trg_notify_traveler_form_completed
  AFTER UPDATE ON public.travelers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_traveler_form_completed();

CREATE OR REPLACE FUNCTION public.notify_onboarding_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS NOT NULL AND OLD.org_id IS NULL THEN
    PERFORM public.create_notification(
      NEW.org_id,
      NEW.user_id,
      'onboarding_completed',
      'Onboarding concluído',
      'Sua organização já está pronta para uso.',
      'profile',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_onboarding_completed ON public.profiles;
CREATE TRIGGER trg_notify_onboarding_completed
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_onboarding_completed();

-- 9. Seed helper for default kanban boards/columns
CREATE OR REPLACE FUNCTION public.ensure_default_kanban_boards(_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sales_board_id UUID;
  _departures_board_id UUID;
BEGIN
  INSERT INTO public.kanban_boards (org_id, slug, name, board_type)
  VALUES (_org_id, 'sales', 'Kanban de Vendas', 'sales')
  ON CONFLICT (org_id, slug) DO NOTHING;

  INSERT INTO public.kanban_boards (org_id, slug, name, board_type)
  VALUES (_org_id, 'departures', 'Kanban de Embarques', 'departures')
  ON CONFLICT (org_id, slug) DO NOTHING;

  SELECT id INTO _sales_board_id
  FROM public.kanban_boards
  WHERE org_id = _org_id AND slug = 'sales';

  SELECT id INTO _departures_board_id
  FROM public.kanban_boards
  WHERE org_id = _org_id AND slug = 'departures';

  INSERT INTO public.kanban_columns (board_id, org_id, name, color, position)
  VALUES
    (_sales_board_id, _org_id, 'Cotação a Fazer', '#94a3b8', 0),
    (_sales_board_id, _org_id, 'Enviado', '#0ea5e9', 1),
    (_sales_board_id, _org_id, 'Em Andamento', '#f59e0b', 2),
    (_sales_board_id, _org_id, 'Aguardando Retorno', '#a855f7', 3),
    (_sales_board_id, _org_id, 'Confirmado', '#10b981', 4),
    (_sales_board_id, _org_id, 'Perdido', '#ef4444', 5)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.kanban_columns (board_id, org_id, name, color, position)
  VALUES
    (_departures_board_id, _org_id, 'Este Mês', '#0ea5e9', 0),
    (_departures_board_id, _org_id, 'Próximos Check-ins', '#f59e0b', 1),
    (_departures_board_id, _org_id, 'Embarcados', '#10b981', 2)
  ON CONFLICT DO NOTHING;
END;
$$;
