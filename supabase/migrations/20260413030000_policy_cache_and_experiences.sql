-- Migration: policy_cache_and_experiences
-- Fase 2: Motor de Cache de Políticas de Operadoras
-- Fase 3: Banco de Passeios e Experiências

-- ── Policy Cache Engine ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.policy_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  operadora TEXT NOT NULL,          -- Ex: 'orinter', 'cvc', 'decolar'
  operadora_display TEXT,           -- Ex: 'Orinter Tour'
  tipo TEXT NOT NULL DEFAULT 'condicoes_gerais',
  -- Tipos: condicoes_gerais, cancelamento_hotel, cancelamento_aereo,
  --        taxas_locais, regras_tarifa, condicoes_seguro
  versao INT NOT NULL DEFAULT 1,
  hash_conteudo TEXT,               -- SHA256 para detectar mudanças
  ativa BOOLEAN NOT NULL DEFAULT true,
  conteudo JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Conteúdo estruturado:
  -- { pagamento_cartao: {...}, pagamento_boleto: {...}, regras_tarifa: {...},
  --   taxas_locais_aviso: "...", condicoes_gerais_texto: "...", 
  --   cancelamento_padrao: {...} }
  notas_internas TEXT,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_cache_operadora_tipo_ativa
  ON public.policy_cache(org_id, operadora, tipo) WHERE ativa = true;

CREATE INDEX IF NOT EXISTS idx_policy_cache_org ON public.policy_cache(org_id);

ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage policy cache in own org"
  ON public.policy_cache FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- ── Experience Registry (Banco de Passeios e Serviços) ──────────────────────
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'passeio',
  -- tipos: transfer, passeio_nautico, city_tour, parque, ingresso, seguro,
  --         chip_internacional, sala_vip, outro
  fornecedor TEXT,
  cidade_base TEXT,
  estado TEXT,
  pais TEXT NOT NULL DEFAULT 'Brasil',
  descricao TEXT,
  instrucoes_operacionais TEXT,
  duracao_horas NUMERIC(5,1),
  inclui_transporte BOOLEAN DEFAULT false,
  inclui_alimentacao BOOLEAN DEFAULT false,
  idioma_guia TEXT[],
  capacidade_max INT,
  preco_adulto NUMERIC(12,2),
  preco_crianca NUMERIC(12,2),
  preco_infantil NUMERIC(12,2),
  moeda TEXT NOT NULL DEFAULT 'BRL',
  fotos TEXT[] NOT NULL DEFAULT '{}'::text[],
  cover_photo_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_org ON public.experiences(org_id, is_active);
CREATE INDEX IF NOT EXISTS idx_experiences_tipo ON public.experiences(tipo);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage experiences in own org"
  ON public.experiences FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vinculação de experiências com cotações
CREATE TABLE IF NOT EXISTS public.quote_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,             -- Desnormalizado para exibição
  tipo TEXT NOT NULL DEFAULT 'passeio',
  fornecedor TEXT,
  data_inicio DATE,
  data_fim DATE,
  adultos INT DEFAULT 1,
  criancas INT DEFAULT 0,
  infantil INT DEFAULT 0,
  instrucoes TEXT,
  valor_total NUMERIC(12,2),
  order_position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_experiences_quote ON public.quote_experiences(quote_id);
ALTER TABLE public.quote_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage quote experiences in own org"
  ON public.quote_experiences FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = get_my_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotations q WHERE q.id = quote_id AND q.org_id = get_my_org_id()));
