-- Migration: omega_v5_portal_handle_support
-- Propósito: Suporte a acesso ao portal via handle público (/@omega-jardins)
-- além do slug existente (/omega-jardins).

-- Index para busca rápida por handle (já existe o de slug)
CREATE INDEX IF NOT EXISTS idx_organizations_handle ON public.organizations(handle)
  WHERE handle IS NOT NULL;

-- Atualizar a RPC get_public_organization_by_slug para suportar handle também
-- (Renomeada para get_public_portal_org para mais clareza)
CREATE OR REPLACE FUNCTION public.get_public_portal_org(p_ident text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  handle text,
  logo_url text,
  primary_color text,
  whatsapp text
)
LANGUAGE sql STABLE PARALLEL SAFE SECURITY DEFINER
AS $$
  SELECT
    id,
    name,
    slug,
    handle,
    logo_url,
    primary_color,
    whatsapp
  FROM public.organizations
  WHERE
    is_active = true
    AND (
      slug   = p_ident
      OR handle = p_ident
      OR handle = '@' || p_ident  -- suporta busca com ou sem @
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_portal_org(text) TO anon, authenticated;
