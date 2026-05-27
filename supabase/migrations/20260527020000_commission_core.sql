-- Migration: Commission Core Reality Sync
-- Cria o módulo de comissões server-side real

-- Regras de comissão por agência
CREATE TABLE IF NOT EXISTS public.agent_commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed', 'tiered'
  -- Configuração de tiers (para tipo 'tiered')
  tiers JSONB DEFAULT '[]',
  -- Para tipo fixo/percentual simples
  base_percentage NUMERIC(5,2),
  base_fixed_amount NUMERIC(12,2),
  -- Over (comissão de operadora)
  over_percentage NUMERIC(5,2) DEFAULT 30.0,
  over_operator_tax NUMERIC(5,2) DEFAULT 0.0,
  -- Validade
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Períodos de comissão (mês a mês)
CREATE TABLE IF NOT EXISTS public.agent_commission_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'calculated', 'approved', 'paid'
  total_sales NUMERIC(12,2) DEFAULT 0,
  total_commission NUMERIC(12,2) DEFAULT 0,
  total_over NUMERIC(12,2) DEFAULT 0,
  total_incentives NUMERIC(12,2) DEFAULT 0,
  total_adjustments NUMERIC(12,2) DEFAULT 0,
  total_final NUMERIC(12,2) DEFAULT 0,
  calculated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, agent_id, period_start, period_end)
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agent_commission_periods' AND column_name='agent_id') THEN
    ALTER TABLE public.agent_commission_periods ADD COLUMN agent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agent_commission_periods' AND column_name='period_start') THEN
    ALTER TABLE public.agent_commission_periods ADD COLUMN period_start DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agent_commission_periods' AND column_name='period_end') THEN
    ALTER TABLE public.agent_commission_periods ADD COLUMN period_end DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='agent_commission_entries' AND column_name='rule_id') THEN
    ALTER TABLE public.agent_commission_entries ADD COLUMN rule_id UUID REFERENCES public.agent_commission_rules(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Entradas individuais de comissão
CREATE TABLE IF NOT EXISTS public.agent_commission_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.agent_commission_periods(id) ON DELETE SET NULL,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.agent_commission_rules(id) ON DELETE SET NULL,
  -- Referência à venda
  sale_type TEXT NOT NULL, -- 'quotation', 'group_booking', 'package'
  sale_id UUID,
  sale_reference TEXT,
  -- Valores calculados
  sale_gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  over_gross NUMERIC(12,2) DEFAULT 0,
  over_operator_tax NUMERIC(12,2) DEFAULT 0,
  over_net NUMERIC(12,2) DEFAULT 0,
  commission_base NUMERIC(12,2) DEFAULT 0,
  commission_over NUMERIC(12,2) DEFAULT 0,
  commission_incentives NUMERIC(12,2) DEFAULT 0,
  commission_adjustments NUMERIC(12,2) DEFAULT 0,
  commission_total NUMERIC(12,2) DEFAULT 0,
  -- Meta aplicada
  meta_percentage NUMERIC(5,2),
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajustes manuais de comissão (somente finance pode criar)
CREATE TABLE IF NOT EXISTS public.agent_commission_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_id UUID NOT NULL REFERENCES public.agent_commission_periods(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL, -- 'bonus', 'deduction', 'correction'
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_commission_rules_org_id ON public.agent_commission_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_periods_org_agent ON public.agent_commission_periods(org_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_agent_id ON public.agent_commission_entries(agent_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_org_id ON public.agent_commission_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_period_id ON public.agent_commission_entries(period_id);

-- RLS
ALTER TABLE public.agent_commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commission_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_commission_adjustments ENABLE ROW LEVEL SECURITY;

-- Policies: commission_rules (apenas admin lê e escreve)
DROP POLICY IF EXISTS "admin_manage_commission_rules" ON public.agent_commission_rules;
CREATE POLICY "admin_manage_commission_rules" ON public.agent_commission_rules
  USING (org_id = (SELECT get_my_org_id()));

-- Policies: commission_periods
DROP POLICY IF EXISTS "agent_read_own_periods" ON public.agent_commission_periods;
CREATE POLICY "agent_read_own_periods" ON public.agent_commission_periods
  FOR SELECT USING (
    org_id = (SELECT get_my_org_id())
    AND (
      agent_id = auth.uid()
      OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('org_admin', 'super_admin', 'finance')
    )
  );

-- Policies: commission_entries
DROP POLICY IF EXISTS "agent_read_own_entries" ON public.agent_commission_entries;
CREATE POLICY "agent_read_own_entries" ON public.agent_commission_entries
  FOR SELECT USING (
    org_id = (SELECT get_my_org_id())
    AND (
      agent_id = auth.uid()
      OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('org_admin', 'super_admin', 'finance')
    )
  );

-- RPC: Calcular comissão (server-side)
CREATE OR REPLACE FUNCTION public.calculate_agent_commission(
  p_org_id UUID,
  p_agent_id UUID,
  p_sale_gross NUMERIC,
  p_over_gross NUMERIC DEFAULT 0,
  p_sale_type TEXT DEFAULT 'quotation',
  p_sale_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule RECORD;
  v_commission_base NUMERIC := 0;
  v_commission_over NUMERIC := 0;
  v_meta_pct NUMERIC := 0;
  v_over_operator_tax NUMERIC := 0;
  v_over_net NUMERIC := 0;
BEGIN
  -- Buscar regra ativa
  SELECT * INTO v_rule
  FROM public.agent_commission_rules
  WHERE org_id = p_org_id
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object(
      'commission_base', 0,
      'commission_over', 0,
      'commission_total', 0,
      'error', 'Nenhuma regra de comissão ativa encontrada'
    );
  END IF;

  -- Calcular percentual de meta (exemplo: tiers padrão)
  -- Até 100.000 = 1%, acima = 1.5%
  IF v_rule.rule_type = 'tiered' THEN
    v_meta_pct := CASE
      WHEN p_sale_gross <= 100000 THEN 1.0
      ELSE 1.5
    END;
  ELSE
    v_meta_pct := COALESCE(v_rule.base_percentage, 1.0);
  END IF;

  -- Calcular comissão base
  v_commission_base := p_sale_gross * (v_meta_pct / 100);

  -- Calcular over
  IF p_over_gross > 0 THEN
    v_over_operator_tax := p_over_gross * (COALESCE(v_rule.over_operator_tax, 0) / 100);
    v_over_net := p_over_gross - v_over_operator_tax;
    v_commission_over := v_over_net * (COALESCE(v_rule.over_percentage, 30) / 100);
  END IF;

  RETURN jsonb_build_object(
    'commission_base', ROUND(v_commission_base, 2),
    'commission_over', ROUND(v_commission_over, 2),
    'commission_total', ROUND(v_commission_base + v_commission_over, 2),
    'meta_percentage', v_meta_pct,
    'over_net', ROUND(v_over_net, 2),
    'rule_id', v_rule.id,
    'rule_name', v_rule.name
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_agent_commission TO authenticated;
