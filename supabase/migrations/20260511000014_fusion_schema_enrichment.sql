-- =============================================================================
-- Migration: 20260511000014_fusion_schema_enrichment
-- Objetivo: Incrementar schemas existentes e criar tabelas novas (contracts,
--           vouchers) com base na fusão do aiturisagente.
--           Zero-breaks: usa ADD COLUMN IF NOT EXISTS e CREATE TABLE IF NOT EXISTS.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENRICHMENT: tabela clients
--    Campos do aiturisagente que não existem como colunas nativas no turisagencias
--    (atualmente enterrados em preferences jsonb ou ausentes por completo)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS rg                  TEXT,
  ADD COLUMN IF NOT EXISTS profession          TEXT,
  ADD COLUMN IF NOT EXISTS passport_number     TEXT,
  ADD COLUMN IF NOT EXISTS passport_expiry     DATE,
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact   TEXT,
  ADD COLUMN IF NOT EXISTS frequent_flyer      TEXT,
  ADD COLUMN IF NOT EXISTS identity_url        TEXT,
  ADD COLUMN IF NOT EXISTS identity_doc_name   TEXT;

COMMENT ON COLUMN public.clients.rg                   IS 'Registro Geral brasileiro';
COMMENT ON COLUMN public.clients.profession            IS 'Profissão do viajante';
COMMENT ON COLUMN public.clients.passport_number       IS 'Número do passaporte';
COMMENT ON COLUMN public.clients.passport_expiry       IS 'Validade do passaporte';
COMMENT ON COLUMN public.clients.dietary_restrictions  IS 'Restrições alimentares / médicas';
COMMENT ON COLUMN public.clients.emergency_contact     IS 'Contato de emergência (nome + fone)';
COMMENT ON COLUMN public.clients.frequent_flyer        IS 'Programas de fidelidade / milhas';
COMMENT ON COLUMN public.clients.identity_url          IS 'URL do documento de identidade (Storage)';
COMMENT ON COLUMN public.clients.identity_doc_name     IS 'Nome do arquivo anexado';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ENRICHMENT: tabela quotations
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS ocr_instructions TEXT,     -- Guia de contexto antes do OCR
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,     -- Imagem de capa para o card
  ADD COLUMN IF NOT EXISTS condicoes        TEXT;     -- Notas / regras de cancelamento

COMMENT ON COLUMN public.quotations.ocr_instructions IS 'Instruções prévias para o extrator IA';
COMMENT ON COLUMN public.quotations.cover_image_url  IS 'URL da imagem de capa da proposta';
COMMENT ON COLUMN public.quotations.condicoes        IS 'Regras de cancelamento e notas gerais';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ENRICHMENT: tabela financial_transactions
--    Campos necessários para Inadimplência + controle de fluxo de caixa
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS vencimento DATE,
  ADD COLUMN IF NOT EXISTS tipo       TEXT DEFAULT 'receita'
    CHECK (tipo IN ('receita', 'despesa')),
  ADD COLUMN IF NOT EXISTS status     TEXT DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'pago', 'cancelado')),
  ADD COLUMN IF NOT EXISTS pago_em    TIMESTAMPTZ;

COMMENT ON COLUMN public.financial_transactions.vencimento IS 'Data de vencimento da parcela/boleto';
COMMENT ON COLUMN public.financial_transactions.tipo       IS 'receita ou despesa';
COMMENT ON COLUMN public.financial_transactions.status     IS 'pendente, pago ou cancelado';
COMMENT ON COLUMN public.financial_transactions.pago_em    IS 'Timestamp de quando foi marcado como pago';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ENRICHMENT: tabela trips
--    Campos extras do TripDossier e KanbanSales do aiturisagente
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS companions    TEXT,     -- Acompanhantes separados por vírgula
  ADD COLUMN IF NOT EXISTS receipt_url   TEXT,     -- Comprovante/contrato da operadora
  ADD COLUMN IF NOT EXISTS receipt_name  TEXT,     -- Nome do arquivo do comprovante
  ADD COLUMN IF NOT EXISTS kanban_status TEXT DEFAULT 'novo_lead';  -- Status no funil de vendas

COMMENT ON COLUMN public.trips.companions    IS 'Acompanhantes separados por vírgula';
COMMENT ON COLUMN public.trips.receipt_url   IS 'URL do comprovante ou contrato da operadora';
COMMENT ON COLUMN public.trips.receipt_name  IS 'Nome do arquivo anexado';
COMMENT ON COLUMN public.trips.kanban_status IS 'Status no funil: novo_lead|em_cotacao|enviado|negociacao|fechado|perdido';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. NOVA TABELA: contracts
--    Contratos jurídicos gerados (OCR de recibos + edição manual)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id    UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id      UUID        REFERENCES public.trips(id) ON DELETE SET NULL,
  template_id  UUID        REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  -- Identificação
  numero       TEXT,
  status       TEXT        NOT NULL DEFAULT 'emitido'
    CHECK (status IN ('rascunho','emitido','assinado','cancelado')),
  titular      TEXT,
  pacote       TEXT,
  destino      TEXT,
  data_inicio  DATE,
  data_fim     DATE,
  valor_total  NUMERIC(12,2),
  -- Dados estruturados extraídos pelo OCR (schema flexível JSONB)
  contratante  JSONB       DEFAULT '{}'::jsonb,  -- {nome, cpf, rg, email, telefone, endereco}
  pagantes     JSONB       DEFAULT '[]'::jsonb,  -- [{nome, cpf, valor, parcelas, formaPagamento}]
  passageiros  JSONB       DEFAULT '[]'::jsonb,  -- [{nome, cpf, nascimento, tipo}]
  voos         JSONB       DEFAULT '[]'::jsonb,  -- [{companhia, origem, destino, dataPartida, localizador}]
  hospedagem   JSONB       DEFAULT '[]'::jsonb,  -- [{nome, checkin, checkout, localizador, regime}]
  financeiro   JSONB       DEFAULT '{}'::jsonb,  -- {valorTotal, ...}
  -- Artefatos
  pdf_url      TEXT,
  ocr_raw_text TEXT,
  -- Auditoria
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_org_id    ON public.contracts(org_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status    ON public.contracts(status);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Política: todos os membros da org podem ler seus contratos
CREATE POLICY "contracts_org_select"
  ON public.contracts FOR SELECT
  TO authenticated
  USING (org_id = public.get_my_org_id());

-- Política: org_admin e acima podem criar/editar/deletar
CREATE POLICY "contracts_org_write"
  ON public.contracts FOR ALL
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'agent')
    )
  )
  WITH CHECK (
    org_id = public.get_my_org_id()
  );

-- Trigger para updated_at (usa a função moddatetime nativa do Postgres/Supabase)
-- Se a função ainda não existir, criamos a versão simples inline:
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.contracts IS
  'Contratos jurídicos de prestação de serviços turísticos. Gerados via OCR de recibos ou manualmente.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. NOVA TABELA: vouchers
--    Boarding pass e resumo de viagem para entrega ao passageiro
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vouchers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id    UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  trip_id      UUID        REFERENCES public.trips(id) ON DELETE SET NULL,
  -- Dados do voucher
  destino      TEXT,
  localizador  TEXT,
  passageiros  TEXT,
  data_checkin DATE,
  data_checkout DATE,
  hotel        TEXT,
  voos         TEXT,
  transfer     TEXT,
  emergencia   TEXT,
  -- Arquivos
  media_url    TEXT,
  media_name   TEXT,
  pdf_url      TEXT,
  ocr_raw_text TEXT,
  -- Auditoria
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_org_id    ON public.vouchers(org_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_client_id ON public.vouchers(client_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_trip_id   ON public.vouchers(trip_id);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouchers_org_select"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (org_id = public.get_my_org_id());

CREATE POLICY "vouchers_org_write"
  ON public.vouchers FOR ALL
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    AND (
      public.has_role(auth.uid(), 'org_admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'agent')
    )
  )
  WITH CHECK (org_id = public.get_my_org_id());

CREATE OR REPLACE TRIGGER vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.vouchers IS
  'Vouchers/Boarding Pass gerados para entrega ao passageiro, com OCR multi-arquivo e geração de PDF.';
