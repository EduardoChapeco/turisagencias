-- Sprint 1: Quotations PDF Engine & Missing Columns

-- 1. Add missing columns to quotations
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS layout_mode TEXT DEFAULT 'executivo', -- executivo, apresentacao, excetur
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Add missing columns to organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anac_registration TEXT,
  ADD COLUMN IF NOT EXISTS iata_code TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- 3. Add missing columns to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_member BOOLEAN DEFAULT false;

-- 4. Create sequence and trigger for COT-XXXXXX
CREATE SEQUENCE IF NOT EXISTS public.quotation_code_seq START 100000;

CREATE OR REPLACE FUNCTION public.generate_quotation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := 'COT-' || nextval('public.quotation_code_seq')::TEXT;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_quotation_code ON public.quotations;
CREATE TRIGGER trg_generate_quotation_code
  BEFORE INSERT ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_quotation_code();

-- Update existing quotations to have a code if they don't
DO $$
DECLARE
  q RECORD;
BEGIN
  FOR q IN SELECT id FROM public.quotations WHERE code IS NULL LOOP
    UPDATE public.quotations SET code = 'COT-' || nextval('public.quotation_code_seq')::TEXT WHERE id = q.id;
  END LOOP;
END $$;
