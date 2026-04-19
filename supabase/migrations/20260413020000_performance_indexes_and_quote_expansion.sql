-- Migration: performance_indexes_and_quote_expansion
-- Objetivo: Índices de performance + expansão da tabela quotations para o PRD

-- 1. Índices de performance nas colunas mais consultadas
CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients(org_id);
CREATE INDEX IF NOT EXISTS idx_quotations_org_id ON public.quotations(org_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON public.quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_ai_keys_pool_org ON public.ai_keys_pool(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_bank_org ON public.hotels_bank(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON public.kanban_cards(column_id, position);

-- 2. Melhoria na tabela ai_keys_pool para rastreamento do orquestrador
ALTER TABLE public.ai_keys_pool
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_count INT DEFAULT 0;

-- 3. Campos expandidos em quotations para o novo schema de extração IA (conforme PRD)
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS cancelamento_data_limite TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelamento_valor_multa NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS cancelamento_texto_raw TEXT,
  ADD COLUMN IF NOT EXISTS pax_adultos INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pax_criancas INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pax_infantil INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pax_seniores INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS id_operadora TEXT,
  ADD COLUMN IF NOT EXISTS operadora_nome TEXT,
  ADD COLUMN IF NOT EXISTS tarifa_base NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS taxas NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS impostos NUMERIC(12,2);

-- 4. Tabela de transfers extraídos da cotação
CREATE TABLE IF NOT EXISTS public.quote_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'round',
  nome TEXT,
  fornecedor TEXT,
  data_inicio DATE,
  data_fim DATE,
  instrucoes TEXT,
  ponto_encontro TEXT,
  limite_bagagem_kg INT,
  adultos INT DEFAULT 1,
  criancas INT DEFAULT 0,
  valor_total NUMERIC(12,2),
  order_position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_transfers_quote ON public.quote_transfers(quote_id);

ALTER TABLE public.quote_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage quote transfers in own org" ON public.quote_transfers;
DROP POLICY IF EXISTS "Users can manage quote transfers in own org" ON public.quote_transfers;
DROP POLICY IF EXISTS "Users can manage quote transfers in own org" ON public.quote_transfers;
DROP POLICY IF EXISTS "Users can manage quote transfers in own org" ON public.quote_transfers;
CREATE POLICY "Users can manage quote transfers in own org" ON public.quote_transfers FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quote_id AND q.org_id = get_my_org_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotations q 
    WHERE q.id = quote_id AND q.org_id = get_my_org_id()
  ));
