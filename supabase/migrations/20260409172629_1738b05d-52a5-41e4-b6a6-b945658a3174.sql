
-- Quotations table
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES auth.users(id),
  
  -- Destination info
  destination TEXT,
  hotel_name TEXT,
  hotel_stars INT,
  hotel_photo_url TEXT,
  check_in DATE,
  check_out DATE,
  num_nights INT,
  meal_plan TEXT, -- all_inclusive, half_board, bed_breakfast, room_only
  room_type TEXT,
  
  -- Pricing
  total_value NUMERIC(12,2),
  currency TEXT DEFAULT 'BRL',
  installments JSONB DEFAULT '[]', -- [{type:"credit_12x", value:500, total:6000}, ...]
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, viewed, accepted, expired
  
  -- WhatsApp
  whatsapp_text TEXT,
  
  -- Public page
  share_token UUID DEFAULT gen_random_uuid() UNIQUE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Source file
  source_file_url TEXT,
  
  -- AI extraction metadata
  ai_extracted BOOLEAN DEFAULT false,
  ai_raw_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quotations_org ON public.quotations(org_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON public.quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_share_token ON public.quotations(share_token);

DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
DROP TRIGGER IF EXISTS update_quotations_updated_at ON public.quotations;
CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can view quotations in own org" ON public.quotations;
CREATE POLICY "Users can view quotations in own org" ON public.quotations FOR SELECT USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can create quotations in own org" ON public.quotations;
CREATE POLICY "Users can create quotations in own org" ON public.quotations FOR INSERT WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can update quotations in own org" ON public.quotations;
CREATE POLICY "Users can update quotations in own org" ON public.quotations FOR UPDATE USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
DROP POLICY IF EXISTS "Users can delete quotations in own org" ON public.quotations;
CREATE POLICY "Users can delete quotations in own org" ON public.quotations FOR DELETE USING (org_id = public.get_my_org_id());

-- Public quotation view function (by share_token, no auth needed)
DROP FUNCTION IF EXISTS public.get_public_quotation CASCADE;
DROP FUNCTION IF EXISTS public.get_public_quotation CASCADE;
CREATE OR REPLACE FUNCTION public.get_public_quotation(_token UUID)
RETURNS TABLE (
  destination TEXT,
  hotel_name TEXT,
  hotel_stars INT,
  hotel_photo_url TEXT,
  check_in DATE,
  check_out DATE,
  num_nights INT,
  meal_plan TEXT,
  room_type TEXT,
  total_value NUMERIC,
  currency TEXT,
  installments JSONB,
  org_name TEXT,
  org_logo TEXT,
  org_whatsapp TEXT,
  org_primary_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark as viewed
  UPDATE public.quotations SET viewed_at = COALESCE(viewed_at, now()), status = 
    CASE WHEN status = 'sent' THEN 'viewed' ELSE status END
  WHERE share_token = _token;

  RETURN QUERY
  SELECT 
    q.destination, q.hotel_name, q.hotel_stars, q.hotel_photo_url,
    q.check_in, q.check_out, q.num_nights, q.meal_plan, q.room_type,
    q.total_value, q.currency, q.installments,
    o.name AS org_name, o.logo_url AS org_logo, o.whatsapp AS org_whatsapp,
    o.primary_color AS org_primary_color
  FROM public.quotations q
  JOIN public.organizations o ON o.id = q.org_id
  WHERE q.share_token = _token;
END;
$$;

-- Storage bucket for quotation source files
INSERT INTO storage.buckets (id, name, public) VALUES ('quotation-sources', 'quotation-sources', false);

DROP POLICY IF EXISTS "Users can view quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can view quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can view quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can view quotation sources" ON storage.objects;
CREATE POLICY "Users can view quotation sources" ON storage.objects FOR SELECT
  USING (bucket_id = 'quotation-sources' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can upload quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload quotation sources" ON storage.objects;
CREATE POLICY "Users can upload quotation sources" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quotation-sources' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can delete quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete quotation sources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete quotation sources" ON storage.objects;
CREATE POLICY "Users can delete quotation sources" ON storage.objects FOR DELETE
  USING (bucket_id = 'quotation-sources' AND auth.role() = 'authenticated');
