-- Migration: Sistema de Bloqueios de Assentos e Precificação de Grupos
-- Versão: 20260511000015
-- Propósito: Novo módulo para gestão de bloqueios aéreos (GOL/LATAM/AZUL),
--            calculadora de precificação com margem de inadimplência,
--            CRM especial para clientes sem crédito e parcelas do grupo.

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Garante função set_updated_at (pode já existir da migration anterior)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enriquecimento da tabela group_trips (campos para o módulo de bloqueios)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.group_trips
  ADD COLUMN IF NOT EXISTS tipo_comercial TEXT DEFAULT 'regular'
    CHECK (tipo_comercial IN ('regular','sem_spc','bloqueio','corporativo')),
  ADD COLUMN IF NOT EXISTS produto_viagem_flexivel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS produto_cancelamento_credito BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS prazo_nominacao DATE,
  ADD COLUMN IF NOT EXISTS d_menos_70 DATE,
  ADD COLUMN IF NOT EXISTS d_menos_65 DATE,
  ADD COLUMN IF NOT EXISTS reserva_inadimplencia NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS status_comercial TEXT DEFAULT 'em_vendas'
    CHECK (status_comercial IN ('planejamento','em_vendas','fechado','confirmado','cancelado'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tabela seat_blocks — Bloqueios de Assentos Aéreos
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seat_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  group_trip_id   UUID REFERENCES public.group_trips(id) ON DELETE SET NULL,

  -- Dados da cia aérea
  companhia       TEXT NOT NULL CHECK (companhia IN ('GOL','LATAM','AZUL','OUTROS')),
  codigo_voo      TEXT,
  origem          TEXT,
  destino         TEXT,
  data_ida        DATE,
  data_volta      DATE,
  classe          TEXT DEFAULT 'Y',

  -- Bloco negociado
  total_assentos  INT NOT NULL DEFAULT 0,
  assentos_vendidos INT NOT NULL DEFAULT 0,

  -- Custos
  custo_passagem_unit NUMERIC(10,2),

  -- Condições do bloqueio
  prazo_nominacao DATE,
  prazo_pagamento DATE,
  localizador_bloco TEXT,
  condicoes_bloco TEXT,

  -- Arquivo da proposta original (OCR)
  proposta_url    TEXT,
  proposta_nome   TEXT,
  ocr_raw_text    TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho','confirmado','em_vendas','nominado','encerrado','cancelado')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seat_blocks_org_id
  ON public.seat_blocks(org_id);
CREATE INDEX IF NOT EXISTS idx_seat_blocks_group_trip_id
  ON public.seat_blocks(group_trip_id);
CREATE INDEX IF NOT EXISTS idx_seat_blocks_status
  ON public.seat_blocks(status);
CREATE INDEX IF NOT EXISTS idx_seat_blocks_companhia
  ON public.seat_blocks(companhia);

-- RLS
ALTER TABLE public.seat_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seat_blocks_select" ON public.seat_blocks
  FOR SELECT USING (org_id = public.get_my_org_id());

CREATE POLICY "seat_blocks_all" ON public.seat_blocks
  FOR ALL USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

-- Trigger updated_at
CREATE TRIGGER trg_seat_blocks_updated_at
  BEFORE UPDATE ON public.seat_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Tabela group_pricing — Calculadora de Precificação
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  group_trip_id   UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  seat_block_id   UUID REFERENCES public.seat_blocks(id) ON DELETE SET NULL,

  -- Custos por pessoa (inputs)
  custo_passagem          NUMERIC(10,2) DEFAULT 0,
  taxa_embarque           NUMERIC(10,2) DEFAULT 0,
  custo_hotel_unit        NUMERIC(10,2) DEFAULT 0,
  total_diarias           INT DEFAULT 1,
  custo_transfer          NUMERIC(10,2) DEFAULT 0,
  custo_passeios          NUMERIC(10,2) DEFAULT 0,
  custo_seguro            NUMERIC(10,2) DEFAULT 0,
  custo_outros            NUMERIC(10,2) DEFAULT 0,

  -- Markup e reservas (%)
  markup_percent                  NUMERIC(5,2) DEFAULT 25.00,
  reserva_inadimplencia_percent   NUMERIC(5,2) DEFAULT 15.00,
  taxa_admin_parcelamento         NUMERIC(5,2) DEFAULT 0.00,
  taxa_viagem_flexivel_percent    NUMERIC(5,2) DEFAULT 15.00,

  -- Preços calculados (por pessoa) — salvos no save
  custo_total_pax         NUMERIC(12,2),
  preco_base              NUMERIC(12,2),
  preco_com_reserva       NUMERIC(12,2),
  preco_final             NUMERIC(12,2),
  preco_com_flexivel      NUMERIC(12,2),

  -- Parcelamento
  max_parcelas            INT DEFAULT 8,
  valor_entrada_percent   NUMERIC(5,2) DEFAULT 15.00,
  entrada_valor           NUMERIC(10,2),

  -- Meta do grupo
  meta_pax                INT DEFAULT 20,
  pax_minimo              INT DEFAULT 15,

  -- Análise de viabilidade (calculados)
  receita_projetada       NUMERIC(14,2),
  custo_total_grupo       NUMERIC(14,2),
  lucro_projetado         NUMERIC(14,2),
  margem_percentual       NUMERIC(5,2),

  notas TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_pricing_org_id
  ON public.group_pricing(org_id);
CREATE INDEX IF NOT EXISTS idx_group_pricing_group_trip_id
  ON public.group_pricing(group_trip_id);

-- RLS
ALTER TABLE public.group_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_pricing_select" ON public.group_pricing
  FOR SELECT USING (org_id = public.get_my_org_id());

CREATE POLICY "group_pricing_all" ON public.group_pricing
  FOR ALL USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TRIGGER trg_group_pricing_updated_at
  BEFORE UPDATE ON public.group_pricing
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Tabela group_clients — CRM Especial do Grupo (clientes sem crédito)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  group_trip_id   UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Dados do cliente neste grupo
  nome_completo   TEXT NOT NULL,
  cpf             TEXT,
  rg              TEXT,
  nascimento      DATE,
  telefone        TEXT,
  email           TEXT,

  -- Situação no grupo
  assento_numero  INT,
  status_pagamento TEXT DEFAULT 'pendente'
    CHECK (status_pagamento IN ('pendente','em_dia','atrasado','quitado','cancelado')),
  status_nominacao TEXT DEFAULT 'nao_nominado'
    CHECK (status_nominacao IN ('nao_nominado','nominado','embarcado')),

  -- Produto vendido
  valor_total         NUMERIC(12,2),
  valor_entrada       NUMERIC(10,2),
  max_parcelas        INT DEFAULT 8,
  produto_flexivel    BOOLEAN DEFAULT false,

  -- Documentação
  doc_identidade_url  TEXT,
  doc_contrato_url    TEXT,

  -- Controle de inadimplência
  parcelas_atrasadas  INT DEFAULT 0,
  dias_atraso         INT DEFAULT 0,
  ultima_cobranca_at  TIMESTAMPTZ,

  notas TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_clients_org_id
  ON public.group_clients(org_id);
CREATE INDEX IF NOT EXISTS idx_group_clients_group_trip
  ON public.group_clients(group_trip_id);
CREATE INDEX IF NOT EXISTS idx_group_clients_status_pag
  ON public.group_clients(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_group_clients_client_id
  ON public.group_clients(client_id);

-- RLS
ALTER TABLE public.group_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_clients_select" ON public.group_clients
  FOR SELECT USING (org_id = public.get_my_org_id());

CREATE POLICY "group_clients_all" ON public.group_clients
  FOR ALL USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TRIGGER trg_group_clients_updated_at
  BEFORE UPDATE ON public.group_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Tabela group_installments — Parcelas individuais de cada cliente no grupo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.group_installments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  group_client_id  UUID NOT NULL REFERENCES public.group_clients(id) ON DELETE CASCADE,
  group_trip_id    UUID NOT NULL REFERENCES public.group_trips(id) ON DELETE CASCADE,

  numero_parcela   INT NOT NULL,
  valor            NUMERIC(10,2) NOT NULL,
  data_vencimento  DATE NOT NULL,
  data_pagamento   DATE,
  status           TEXT DEFAULT 'pendente'
    CHECK (status IN ('pendente','pago','atrasado','cancelado')),
  metodo_pagamento TEXT
    CHECK (metodo_pagamento IN ('pix','cartao','boleto','transferencia','dinheiro')),
  comprovante_url  TEXT,
  notas            TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_installments_org_id
  ON public.group_installments(org_id);
CREATE INDEX IF NOT EXISTS idx_group_installments_group_client
  ON public.group_installments(group_client_id);
CREATE INDEX IF NOT EXISTS idx_group_installments_status
  ON public.group_installments(status);
CREATE INDEX IF NOT EXISTS idx_group_installments_vencimento
  ON public.group_installments(data_vencimento);

-- RLS
ALTER TABLE public.group_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_installments_select" ON public.group_installments
  FOR SELECT USING (org_id = public.get_my_org_id());

CREATE POLICY "group_installments_all" ON public.group_installments
  FOR ALL USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

CREATE TRIGGER trg_group_installments_updated_at
  BEFORE UPDATE ON public.group_installments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. View auxiliar: resumo de saúde financeira do grupo
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.group_trip_health AS
SELECT
  gt.id                   AS group_trip_id,
  gt.org_id,
  gt.title,
  gt.departure_date,
  gt.status_comercial,
  gt.tipo_comercial,
  gt.prazo_nominacao,
  gt.d_menos_70,
  gt.d_menos_65,

  -- Assentos
  sb.total_assentos,
  sb.assentos_vendidos,
  (sb.total_assentos - sb.assentos_vendidos) AS assentos_disponiveis,
  CASE WHEN sb.total_assentos > 0
    THEN ROUND((sb.assentos_vendidos::NUMERIC / sb.total_assentos) * 100, 1)
    ELSE 0 END            AS percentual_vendido,

  -- Clientes e inadimplência
  COUNT(gc.id)            AS total_clientes,
  SUM(CASE WHEN gc.status_pagamento = 'quitado' THEN 1 ELSE 0 END)  AS clientes_quitados,
  SUM(CASE WHEN gc.status_pagamento = 'atrasado' THEN 1 ELSE 0 END) AS clientes_inadimplentes,
  CASE WHEN COUNT(gc.id) > 0
    THEN ROUND(
      (SUM(CASE WHEN gc.status_pagamento = 'atrasado' THEN 1 ELSE 0 END)::NUMERIC / COUNT(gc.id)) * 100,
      1
    )
    ELSE 0 END            AS taxa_inadimplencia,

  -- Financeiro (parcelas)
  SUM(CASE WHEN gi.status = 'pago' THEN gi.valor ELSE 0 END)     AS receita_realizada,
  SUM(CASE WHEN gi.status = 'pendente' THEN gi.valor ELSE 0 END) AS receita_pendente,
  SUM(CASE WHEN gi.status = 'atrasado' THEN gi.valor ELSE 0 END) AS receita_atrasada,

  -- Precificação
  gp.preco_final          AS preco_por_pax,
  gp.markup_percent,
  gp.receita_projetada,
  gp.lucro_projetado

FROM public.group_trips gt
LEFT JOIN public.seat_blocks sb ON sb.group_trip_id = gt.id AND sb.status NOT IN ('cancelado')
LEFT JOIN public.group_clients gc ON gc.group_trip_id = gt.id
LEFT JOIN public.group_installments gi ON gi.group_trip_id = gt.id
LEFT JOIN public.group_pricing gp ON gp.group_trip_id = gt.id
GROUP BY
  gt.id, gt.org_id, gt.title, gt.departure_date, gt.status_comercial,
  gt.tipo_comercial, gt.prazo_nominacao, gt.d_menos_70, gt.d_menos_65,
  sb.total_assentos, sb.assentos_vendidos,
  gp.preco_final, gp.markup_percent, gp.receita_projetada, gp.lucro_projetado;
