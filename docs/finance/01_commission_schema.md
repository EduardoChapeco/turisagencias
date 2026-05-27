# Schema Financeiro de Comissões

Para substituir as planilhas flutuantes com fórmulas difíceis de auditar, o módulo Financeiro precisa das seguintes tabelas no Supabase:

## Tabelas Iniciais Recomendadas

```sql
-- 1. agent_commission_periods: Períodos mensais (Competência)
CREATE TABLE agent_commission_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  month_date date NOT NULL, -- ex: '2026-05-01'
  status varchar DEFAULT 'open', -- 'open', 'review', 'closed', 'paid'
  total_sales numeric,
  created_at timestamptz
);

-- 2. agent_commission_rules: Regras de comissão da Agência/Agente/Operadora
CREATE TABLE agent_commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  agent_id uuid REFERENCES profiles(id), -- Nullable: Se nulo, aplica para a org inteira
  operator_name varchar, -- Ex: 'Orinter' (Opcional, regras específicas)
  min_sales numeric DEFAULT 0, -- Condicional de Meta
  base_commission_pct numeric, -- A % que o agente ganha
  over_commission_pct numeric, -- A % do over que ele ganha
  requires_tax_discount boolean DEFAULT true
);

-- 3. agent_commission_entries: Lançamentos / Vendas de Pacotes
CREATE TABLE agent_commission_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  agent_id uuid REFERENCES profiles(id),
  period_id uuid REFERENCES agent_commission_periods(id),
  client_name varchar,
  operator_name varchar,
  booking_locator varchar, -- Localizador da viagem
  payment_method varchar,
  
  -- Valores Brutos (Fornecidos no ato da venda)
  gross_sales numeric, -- Venda bruta
  taxes numeric, -- Taxas (não comissionáveis)
  gross_over numeric, -- Over bruto da operadora
  
  -- Valores Calculados (Via Edge Function ou RPC, NUNCA via client-side insert)
  commissionable_base numeric, -- (gross_sales - taxes - gross_over)
  operator_tax numeric, -- Taxa da forma de pagamento sobre o over
  net_over numeric, -- (gross_over - operator_tax)
  
  base_commission_amount numeric, -- (commissionable_base * regra_base_pct)
  over_commission_amount numeric, -- (net_over * regra_over_pct)
  
  adjustment_amount numeric DEFAULT 0,
  final_commission numeric, -- (base + over + adjustment)
  
  status varchar DEFAULT 'pending', -- 'pending', 'approved', 'disputed'
  created_at timestamptz DEFAULT now()
);

-- 4. agent_commission_audit_logs: Rastreabilidade (Quem alterou a comissão e por que)
CREATE TABLE agent_commission_audit_logs (
  id uuid PRIMARY KEY,
  entry_id uuid REFERENCES agent_commission_entries(id),
  changed_by uuid REFERENCES profiles(id),
  old_data jsonb,
  new_data jsonb,
  change_reason varchar,
  created_at timestamptz
);
```
