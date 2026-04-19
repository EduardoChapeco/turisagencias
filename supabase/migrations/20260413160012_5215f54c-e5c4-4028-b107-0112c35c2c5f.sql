
-- Table: policy_cache
CREATE TABLE IF NOT EXISTS public.policy_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  criado_por uuid,
  operadora text NOT NULL,
  operadora_display text,
  tipo text DEFAULT 'condicoes_gerais',
  conteudo jsonb NOT NULL DEFAULT '{}',
  notas_internas text,
  criado_em timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_cache_select" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_select" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_select" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_select" ON public.policy_cache;
CREATE POLICY "policy_cache_select" ON public.policy_cache FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "policy_cache_insert" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_insert" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_insert" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_insert" ON public.policy_cache;
CREATE POLICY "policy_cache_insert" ON public.policy_cache FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "policy_cache_update" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_update" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_update" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_update" ON public.policy_cache;
CREATE POLICY "policy_cache_update" ON public.policy_cache FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "policy_cache_delete" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_delete" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_delete" ON public.policy_cache;
DROP POLICY IF EXISTS "policy_cache_delete" ON public.policy_cache;
CREATE POLICY "policy_cache_delete" ON public.policy_cache FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- Table: experiences
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text,
  descricao text,
  preco numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
DROP POLICY IF EXISTS "experiences_select" ON public.experiences;
CREATE POLICY "experiences_select" ON public.experiences FOR SELECT TO authenticated USING (org_id = get_my_org_id());
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
CREATE POLICY "experiences_insert" ON public.experiences FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
CREATE POLICY "experiences_update" ON public.experiences FOR UPDATE TO authenticated USING (org_id = get_my_org_id()) WITH CHECK (org_id = get_my_org_id());
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;
DROP POLICY IF EXISTS "experiences_delete" ON public.experiences;
CREATE POLICY "experiences_delete" ON public.experiences FOR DELETE TO authenticated USING (org_id = get_my_org_id());

-- RPC: confirm_public_quotation
DROP FUNCTION IF EXISTS public.confirm_public_quotation CASCADE;
DROP FUNCTION IF EXISTS public.confirm_public_quotation CASCADE;
CREATE OR REPLACE FUNCTION public.confirm_public_quotation(
  p_token uuid,
  p_traveler_name text,
  p_traveler_email text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quotations
  SET status = 'confirmed',
      updated_at = now()
  WHERE share_token = p_token
    AND status IN ('draft', 'sent', 'viewed');
END;
$$;
