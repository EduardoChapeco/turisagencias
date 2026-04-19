
-- Create the set_updated_at trigger function
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- Create ai_keys_pool table
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_keys_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  api_key text NOT NULL,
  monthly_limit_usd numeric DEFAULT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_keys_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_keys_pool_select" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_select" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_select" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_select" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_select" ON public.ai_keys_pool
  FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "ai_keys_pool_insert" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_insert" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_insert" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_insert" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_insert" ON public.ai_keys_pool
  FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "ai_keys_pool_update" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_update" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_update" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_update" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_update" ON public.ai_keys_pool
  FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "ai_keys_pool_delete" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_delete" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_delete" ON public.ai_keys_pool;
DROP POLICY IF EXISTS "ai_keys_pool_delete" ON public.ai_keys_pool;
CREATE POLICY "ai_keys_pool_delete" ON public.ai_keys_pool
  FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

DROP TRIGGER IF EXISTS set_ai_keys_pool_updated_at ON public.ai_keys_pool;
DROP TRIGGER IF EXISTS set_ai_keys_pool_updated_at ON public.ai_keys_pool;
DROP TRIGGER IF EXISTS set_ai_keys_pool_updated_at ON public.ai_keys_pool;
DROP TRIGGER IF EXISTS set_ai_keys_pool_updated_at ON public.ai_keys_pool;
CREATE TRIGGER set_ai_keys_pool_updated_at BEFORE UPDATE ON public.ai_keys_pool FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- Create destination_guides table
-- ============================================
CREATE TABLE IF NOT EXISTS public.destination_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  city text NOT NULL,
  country text NOT NULL,
  intro text,
  cover_image_url text,
  currency_info text,
  climate_info text,
  transportation text,
  language_tips text,
  is_published boolean NOT NULL DEFAULT false,
  tips jsonb DEFAULT '[]'::jsonb,
  useful_contacts jsonb DEFAULT '[]'::jsonb,
  emergency_numbers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "destination_guides_select" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_select" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_select" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_select" ON public.destination_guides;
CREATE POLICY "destination_guides_select" ON public.destination_guides
  FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "destination_guides_insert" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_insert" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_insert" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_insert" ON public.destination_guides;
CREATE POLICY "destination_guides_insert" ON public.destination_guides
  FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "destination_guides_update" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_update" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_update" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_update" ON public.destination_guides;
CREATE POLICY "destination_guides_update" ON public.destination_guides
  FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "destination_guides_delete" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_delete" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_delete" ON public.destination_guides;
DROP POLICY IF EXISTS "destination_guides_delete" ON public.destination_guides;
CREATE POLICY "destination_guides_delete" ON public.destination_guides
  FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

DROP TRIGGER IF EXISTS set_destination_guides_updated_at ON public.destination_guides;
DROP TRIGGER IF EXISTS set_destination_guides_updated_at ON public.destination_guides;
DROP TRIGGER IF EXISTS set_destination_guides_updated_at ON public.destination_guides;
DROP TRIGGER IF EXISTS set_destination_guides_updated_at ON public.destination_guides;
CREATE TRIGGER set_destination_guides_updated_at BEFORE UPDATE ON public.destination_guides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
