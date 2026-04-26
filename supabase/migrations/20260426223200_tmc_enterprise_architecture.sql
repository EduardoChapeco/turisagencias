-- Tabela de Políticas Corporativas (Compliance Motor)
CREATE TABLE IF NOT EXISTS public.corporate_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    max_budget_national_hotel DECIMAL(10,2) DEFAULT 300.00,
    max_budget_international_hotel DECIMAL(10,2) DEFAULT 600.00,
    advance_purchase_days INT DEFAULT 10,
    allowed_cabins TEXT[] DEFAULT ARRAY['ECONOMY']::TEXT[],
    requires_approval_if_out_of_policy BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id)
);

ALTER TABLE public.corporate_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their org corporate_policies" ON public.corporate_policies;
CREATE POLICY "Users can read their org corporate_policies" ON public.corporate_policies 
FOR SELECT USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Admins can manage their org corporate_policies" ON public.corporate_policies;
CREATE POLICY "Admins can manage their org corporate_policies" ON public.corporate_policies 
FOR ALL USING (org_id = get_my_org_id());

-- Expansão da tabela B2B Credentials
ALTER TABLE public.b2b_credentials ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.b2b_credentials ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'sandbox';
ALTER TABLE public.b2b_credentials ADD COLUMN IF NOT EXISTS client_secret TEXT;
ALTER TABLE public.b2b_credentials ADD COLUMN IF NOT EXISTS token_url TEXT;

-- Adição de campos de TMC/Analytics em Quotations e Tickets
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS cost_center_id TEXT;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS co2_emission_kg DECIMAL(10,2);
