-- Tabela Segura para Armazenamento de Credenciais B2B (Orinter/Flytour)
CREATE TABLE IF NOT EXISTS public.b2b_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    portal_name TEXT NOT NULL, -- ex: 'orinter'
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- Temporário (Idealmente usar pgsodium em produção extrema)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, portal_name)
);

ALTER TABLE public.b2b_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their org B2B credentials" ON public.b2b_credentials;
CREATE POLICY "Users can manage their org B2B credentials" ON public.b2b_credentials 
FOR ALL USING (org_id = get_my_org_id());

