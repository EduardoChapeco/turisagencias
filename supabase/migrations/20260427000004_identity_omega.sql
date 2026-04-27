-- Migration: omega_v5_identity_agencies
-- Propósito: Adicionar a identidade pública (handle, GBP) e finalizar a transição lógica para Agencies.

-- 1. Injetar novos campos na tabela existente de organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_business_id TEXT;

-- Criação de um Index para otimizar buscas por handle (ex: agencia.com/@omega)
CREATE INDEX IF NOT EXISTS idx_organizations_handle ON public.organizations(handle);

-- 2. Criar a View 'agencies' como Single Source of Truth para novos endpoints
-- Isso atende o requisito do PRD ("transição org_id -> agency_id") 
-- sem corromper as FKs existentes do ecossistema antigo.
CREATE OR REPLACE VIEW public.agencies AS
SELECT 
  id AS agency_id,
  id AS org_id, -- Retrocompatibilidade
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

-- Permissões de RLS para a View (herdam da tabela base, mas garantimos o acesso)
GRANT SELECT ON public.agencies TO authenticated, anon;
