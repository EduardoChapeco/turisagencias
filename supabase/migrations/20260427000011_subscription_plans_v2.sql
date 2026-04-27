-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    features JSONB DEFAULT '[]'::jsonb,
    missing_features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    stripe_product_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Planos sao publicos para leitura" ON public.subscription_plans;
CREATE POLICY "Planos sao publicos para leitura" ON public.subscription_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas masters podem editar planos" ON public.subscription_plans;
CREATE POLICY "Apenas masters podem editar planos" ON public.subscription_plans FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND (profiles.email LIKE '%aline%' OR profiles.email LIKE '%admin%')
    )
);

-- Insert default plans if table is empty
INSERT INTO public.subscription_plans (name, description, price_monthly, features, missing_features, is_popular)
SELECT 'Starter', 'Para consultores independentes e freelas.', 149, 
    '["Até 100 Cotações/mês", "Portal do Viajante (Basic)", "1 Agente", "Kanban de Vendas", "Suporte por Email"]'::jsonb,
    '["Extração Inteligente (PDFs)", "Auditor de Embarque Automático", "Rotina de Tarefas AI"]'::jsonb,
    false
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Starter');

INSERT INTO public.subscription_plans (name, description, price_monthly, features, missing_features, is_popular)
SELECT 'Pro (OMEGA)', 'Automação de ponta a ponta com o Motor Turis AI.', 399, 
    '["Cotações Ilimitadas", "Extração Inteligente (Motor AI)", "Até 5 Agentes", "Auditor de Embarque Automático", "Portal do Viajante (Premium)", "Grupos e Frotas de Ônibus", "Rotinas de Kanban Automáticas"]'::jsonb,
    '[]'::jsonb,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Pro (OMEGA)');

INSERT INTO public.subscription_plans (name, description, price_monthly, features, missing_features, is_popular)
SELECT 'Enterprise', 'Para TMCs e consolidadoras com grandes volumes.', 1200, 
    '["Agentes Ilimitados", "Acessos B2B (Múltiplas Agências)", "GDS Gateway via API", "Motor de Políticas Customizadas", "Suporte Dedicado (SLA)", "Infraestrutura Dedicada", "Whitelabel do Portal"]'::jsonb,
    '[]'::jsonb,
    false
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Enterprise');
