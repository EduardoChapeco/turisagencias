
-- =====================================================
-- GRUPOS TERRESTRES — Fundação
-- =====================================================

-- 1. bus_layouts (independente)
CREATE TABLE public.bus_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'bus' CHECK (vehicle_type IN ('bus','van','minibus','plane')),
  rows INTEGER NOT NULL DEFAULT 10,
  cols INTEGER NOT NULL DEFAULT 4,
  -- seat_map: matriz [[{label:'1A',type:'seat'},{type:'aisle'},...],...]
  seat_map JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bus_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage bus_layouts" ON public.bus_layouts
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

-- 2. group_trips
CREATE TABLE public.group_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  created_by UUID,

  -- Identidade pública
  title TEXT NOT NULL DEFAULT 'Novo Pacote',
  subtitle TEXT,
  slug TEXT UNIQUE,
  cover_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',

  -- Roteiro
  destination TEXT,
  origin_city TEXT,
  departure_date DATE,
  return_date DATE,
  num_days INTEGER,
  num_nights INTEGER,

  -- Comercial
  price_per_pax NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  max_pax INTEGER NOT NULL DEFAULT 40,
  current_pax INTEGER NOT NULL DEFAULT 0,

  -- Conteúdo
  description_md TEXT,
  includes TEXT[] DEFAULT '{}',
  excludes TEXT[] DEFAULT '{}',
  important_notes TEXT,

  -- Transporte
  transport_type TEXT DEFAULT 'bus' CHECK (transport_type IN ('bus','van','minibus','plane','none')),
  bus_layout_id UUID REFERENCES public.bus_layouts(id) ON DELETE SET NULL,

  -- Pagamento
  installments_count INTEGER NOT NULL DEFAULT 1 CHECK (installments_count >= 1),
  payment_due_offset_days INTEGER NOT NULL DEFAULT 1, -- última parcela X dias antes da viagem

  -- Contrato
  contract_template_id UUID REFERENCES public.contract_templates(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed','cancelled')),
  is_public BOOLEAN NOT NULL DEFAULT false,

  view_count INTEGER NOT NULL DEFAULT 0,
  booking_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_trips_org ON public.group_trips(org_id);
CREATE INDEX idx_group_trips_public ON public.group_trips(slug) WHERE is_public = true;

ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage group_trips" ON public.group_trips
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "public read published group_trips" ON public.group_trips
  FOR SELECT TO anon, authenticated USING (is_public = true AND status = 'published');

-- 3. group_trip_days
CREATE TABLE public.group_trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_trip_id UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT '',
  description_md TEXT,
  -- media: [{url, type:'image'|'video', caption}]
  media JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_trip_id, day_number)
);

CREATE INDEX idx_group_trip_days_trip ON public.group_trip_days(group_trip_id);

ALTER TABLE public.group_trip_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org manages days via parent" ON public.group_trip_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  );
CREATE POLICY "public read days of published trips" ON public.group_trip_days
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.is_public = true AND gt.status = 'published')
  );

-- 4. group_bookings
CREATE TABLE public.group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_trip_id UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE RESTRICT,
  org_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Lead (sempre obrigatório porque pode vir de público)
  lead_name TEXT NOT NULL,
  lead_email TEXT,
  lead_phone TEXT,
  lead_cpf TEXT,

  pax_count INTEGER NOT NULL DEFAULT 1 CHECK (pax_count >= 1),
  seat_numbers TEXT[] DEFAULT '{}',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','signed','paid','cancelled')),

  -- Voucher
  voucher_code TEXT UNIQUE,
  voucher_url TEXT,

  -- Acesso público para o cliente acompanhar
  public_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  -- Notas internas
  internal_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_bookings_trip ON public.group_bookings(group_trip_id);
CREATE INDEX idx_group_bookings_org ON public.group_bookings(org_id);

ALTER TABLE public.group_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage group_bookings" ON public.group_bookings
  FOR ALL USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());

-- 5. booking_installments
CREATE TABLE public.booking_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.group_bookings(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','late','cancelled')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, installment_number)
);

CREATE INDEX idx_booking_installments_booking ON public.booking_installments(booking_id);

ALTER TABLE public.booking_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org manages installments via booking" ON public.booking_installments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_bookings b WHERE b.id = booking_id AND b.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_bookings b WHERE b.id = booking_id AND b.org_id = get_my_org_id())
  );

-- 6. bus_seat_assignments
CREATE TABLE public.bus_seat_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_trip_id UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  seat_label TEXT NOT NULL,
  booking_id UUID REFERENCES public.group_bookings(id) ON DELETE SET NULL,
  traveler_name TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_trip_id, seat_label)
);

CREATE INDEX idx_bus_seats_trip ON public.bus_seat_assignments(group_trip_id);

ALTER TABLE public.bus_seat_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org manages seats via trip" ON public.bus_seat_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.org_id = get_my_org_id())
  );
CREATE POLICY "public read seats of published trips" ON public.bus_seat_assignments
  FOR SELECT TO anon, authenticated USING (
    EXISTS (SELECT 1 FROM public.group_trips gt WHERE gt.id = group_trip_id AND gt.is_public = true AND gt.status = 'published')
  );

-- 7. contract_signatures
CREATE TABLE public.contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.group_bookings(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,

  contract_html TEXT NOT NULL, -- snapshot imutável

  signer_name TEXT NOT NULL,
  signer_cpf TEXT,
  signer_email TEXT,

  -- Provas (MP 2.200-2/2001 — assinatura eletrônica simples)
  signer_ip TEXT,
  user_agent TEXT,
  geolocation JSONB,
  facial_photo_url TEXT,

  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hash_sha256 TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contract_signatures_booking ON public.contract_signatures(booking_id);

ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org reads contract_signatures" ON public.contract_signatures
  FOR SELECT USING (org_id = get_my_org_id());
-- INSERT acontece via edge function (service-role); sem policy de write para usuário comum

-- 8. Triggers updated_at
CREATE TRIGGER trg_bus_layouts_updated BEFORE UPDATE ON public.bus_layouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_group_trips_updated BEFORE UPDATE ON public.group_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_group_bookings_updated BEFORE UPDATE ON public.group_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Função pública para ler pacote por slug (e contar view)
CREATE OR REPLACE FUNCTION public.get_public_group_trip(_slug TEXT)
RETURNS TABLE (
  id UUID, title TEXT, subtitle TEXT, slug TEXT,
  cover_image_url TEXT, gallery_urls TEXT[],
  destination TEXT, origin_city TEXT,
  departure_date DATE, return_date DATE, num_days INTEGER, num_nights INTEGER,
  price_per_pax NUMERIC, currency TEXT, max_pax INTEGER, current_pax INTEGER,
  description_md TEXT, includes TEXT[], excludes TEXT[], important_notes TEXT,
  transport_type TEXT, installments_count INTEGER,
  org_name TEXT, org_logo TEXT, org_whatsapp TEXT, org_primary_color TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- bump view count
  UPDATE public.group_trips SET view_count = view_count + 1
  WHERE group_trips.slug = _slug AND is_public = true AND status = 'published';

  RETURN QUERY
  SELECT
    gt.id, gt.title, gt.subtitle, gt.slug,
    gt.cover_image_url, gt.gallery_urls,
    gt.destination, gt.origin_city,
    gt.departure_date, gt.return_date, gt.num_days, gt.num_nights,
    gt.price_per_pax, gt.currency, gt.max_pax, gt.current_pax,
    gt.description_md, gt.includes, gt.excludes, gt.important_notes,
    gt.transport_type, gt.installments_count,
    o.name, o.logo_url, o.whatsapp, o.primary_color
  FROM public.group_trips gt
  JOIN public.organizations o ON o.id = gt.org_id
  WHERE gt.slug = _slug AND gt.is_public = true AND gt.status = 'published';
END;
$$;

-- 10. Função para gerar parcelas automaticamente
CREATE OR REPLACE FUNCTION public.generate_booking_installments(_booking_id UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _booking RECORD;
  _trip RECORD;
  _installment_amount NUMERIC;
  _last_due_date DATE;
  _interval_days INTEGER;
  _i INTEGER;
BEGIN
  SELECT * INTO _booking FROM public.group_bookings WHERE id = _booking_id;
  IF _booking IS NULL THEN RAISE EXCEPTION 'Booking não encontrada'; END IF;

  SELECT * INTO _trip FROM public.group_trips WHERE id = _booking.group_trip_id;

  -- limpa parcelas anteriores
  DELETE FROM public.booking_installments WHERE booking_id = _booking_id;

  _last_due_date := _trip.departure_date - _trip.payment_due_offset_days;
  _installment_amount := ROUND(_booking.total_amount / _trip.installments_count, 2);

  IF _trip.installments_count = 1 THEN
    INSERT INTO public.booking_installments (booking_id, installment_number, due_date, amount)
    VALUES (_booking_id, 1, _last_due_date, _booking.total_amount);
  ELSE
    -- distribui igualmente entre hoje e _last_due_date
    _interval_days := GREATEST(1, (_last_due_date - CURRENT_DATE)::INTEGER / _trip.installments_count);

    FOR _i IN 1.._trip.installments_count LOOP
      INSERT INTO public.booking_installments (booking_id, installment_number, due_date, amount)
      VALUES (
        _booking_id,
        _i,
        CASE
          WHEN _i = _trip.installments_count THEN _last_due_date
          ELSE CURRENT_DATE + (_interval_days * _i)
        END,
        CASE
          WHEN _i = _trip.installments_count
            THEN _booking.total_amount - (_installment_amount * (_trip.installments_count - 1))
          ELSE _installment_amount
        END
      );
    END LOOP;
  END IF;
END;
$$;

-- 11. Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('group-trip-media', 'group-trip-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-signatures', 'booking-signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies para group-trip-media (público leitura, org write)
CREATE POLICY "group_trip_media public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'group-trip-media');

CREATE POLICY "group_trip_media auth upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'group-trip-media');

CREATE POLICY "group_trip_media auth update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'group-trip-media');

CREATE POLICY "group_trip_media auth delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'group-trip-media');

-- booking-signatures: somente serviços (insert via edge), org lê
CREATE POLICY "booking_signatures org read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'booking-signatures');
