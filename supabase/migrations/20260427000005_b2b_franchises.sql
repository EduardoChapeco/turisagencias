-- Migration: omega_v5_b2b_franchises
-- Propósito: Implementar hierarquia B2B (Master Agency -> Sub Agencies)

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS parent_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_parent_org_id ON public.organizations(parent_org_id);

-- Atualizar a View 'agencies' com a nova topologia corporativa
DROP VIEW IF EXISTS public.agencies; CREATE OR REPLACE VIEW public.agencies AS
SELECT 
  id AS agency_id,
  id AS org_id,
  parent_org_id,
  name,
  slug,
  handle,
  logo_url,
  primary_color,
  whatsapp,
  plan,
  google_business_id,
  settings,
  created_at,
  updated_at
FROM public.organizations;

-- Permissões de RLS para a View
GRANT SELECT ON public.agencies TO authenticated, anon;

-- Política para permitir que a Agência Master veja os dados de suas sub-agências
-- Idempotente: remove antes de recriar
DROP POLICY IF EXISTS "Master agencies can view child agencies profiles" ON public.profiles;

CREATE POLICY "Master agencies can view child agencies profiles"
ON public.profiles
FOR SELECT
USING (
  org_id IN (
    SELECT id FROM public.organizations WHERE parent_org_id = (
      SELECT org_id FROM public.profiles p2 WHERE p2.id = auth.uid()
      LIMIT 1
    )
  )
  OR org_id = (SELECT org_id FROM public.profiles p3 WHERE p3.id = auth.uid() LIMIT 1)
);

