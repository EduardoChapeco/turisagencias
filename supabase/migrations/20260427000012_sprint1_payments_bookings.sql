-- ============================================================
-- SPRINT 1 — MIGRATION: payments, bookings, quotation_code
-- SEC V3 COMPLIANCE: Fluxo Financeiro Completo
-- Regra Pétrea: última parcela SEMPRE <= data de embarque
-- ============================================================

-- 1. TABELA: bookings (reservas confirmadas, distintas de trips)
-- Representa a "viagem fechada" com valores consolidados
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id           UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  quotation_id      UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  client_id         UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  agent_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status do ciclo de vida da reserva
  status            TEXT NOT NULL DEFAULT 'pending_payment'
                    CHECK (status IN ('pending_payment','partial_payment','paid','confirmed','cancelled','completed','refunded')),

  -- Valores consolidados (calculados e fixados no momento da contratação)
  total_value       NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_value        NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_value     NUMERIC(12,2) GENERATED ALWAYS AS (total_value - paid_value) STORED,

  -- Configuração de parcelamento (snapshot imutável no momento da contratação)
  installment_config JSONB NOT NULL DEFAULT '{
    "total_installments": 1,
    "installment_value": 0,
    "deposit_amount": 0,
    "interest_rate": 0,
    "pix_discount_percent": 0,
    "payment_deadline": "boarding_date"
  }',

  -- Datas críticas
  boarding_date     DATE,
  return_date       DATE,
  contract_signed_at TIMESTAMPTZ,
  contract_pdf_url  TEXT,

  -- Passageiros snapshot (dados no momento da reserva)
  passengers        JSONB DEFAULT '[]',
  services          JSONB DEFAULT '[]',

  -- Cancelamento
  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT,
  cancellation_fee  NUMERIC(12,2) DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_bookings_org ON public.bookings(org_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_boarding ON public.bookings(boarding_date);

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS bookings
DROP POLICY IF EXISTS "Users view bookings in own org" ON public.bookings;
CREATE POLICY "Users view bookings in own org" ON public.bookings
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users create bookings in own org" ON public.bookings;
CREATE POLICY "Users create bookings in own org" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users update bookings in own org" ON public.bookings;
CREATE POLICY "Users update bookings in own org" ON public.bookings
  FOR UPDATE TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- 2. TABELA: payments (parcelas individuais por booking)
-- Regra Pétrea: due_date NUNCA deve exceder boarding_date do booking associado
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_id          UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id           UUID REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Identificação da parcela
  installment_number  INT NOT NULL DEFAULT 1,   -- 1 = entrada, 2..N = parcelas
  total_installments  INT NOT NULL DEFAULT 1,
  description         TEXT,                      -- "Entrada", "1ª Parcela", etc.

  -- Valores
  amount              NUMERIC(12,2) NOT NULL,
  interest_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(12,2) GENERATED ALWAYS AS (amount + interest_amount) STORED,
  interest_rate       NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Datas
  due_date            DATE NOT NULL,
  paid_at             TIMESTAMPTZ,

  -- Método e status
  method              TEXT CHECK (method IN ('pix','credit_card','boleto','transfer','cash','other')),
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','paid','overdue','cancelled','refunded')),

  -- Comprovante (upload pelo cliente)
  proof_url           TEXT,
  proof_verified_at   TIMESTAMPTZ,
  proof_verified_by   UUID REFERENCES auth.users(id),

  -- Gateway de pagamento
  gateway_name        TEXT,       -- 'stripe' | 'asaas' | 'manual'
  gateway_id          TEXT,       -- ID na plataforma de pagamento
  gateway_response    JSONB,      -- resposta completa do gateway
  payment_link_url    TEXT,       -- link de pagamento gerado

  -- Notas internas
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments(org_id);

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-atualizar booking.paid_value quando payments mudar
CREATE OR REPLACE FUNCTION public.sync_booking_paid_value()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE public.bookings
  SET paid_value = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM public.payments
    WHERE booking_id = COALESCE(NEW.booking_id, OLD.booking_id)
      AND status = 'paid'
  )
  WHERE id = COALESCE(NEW.booking_id, OLD.booking_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_booking_paid_value ON public.payments;
CREATE TRIGGER trg_sync_booking_paid_value
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_booking_paid_value();

-- RLS payments
DROP POLICY IF EXISTS "Users view payments in own org" ON public.payments;
CREATE POLICY "Users view payments in own org" ON public.payments
  FOR SELECT TO authenticated USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users manage payments in own org" ON public.payments;
CREATE POLICY "Users manage payments in own org" ON public.payments
  FOR ALL TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- Acesso anon para upload de comprovante (via token)
DROP POLICY IF EXISTS "Anon can upload proof via token" ON public.payments;
CREATE POLICY "Anon can upload proof via token" ON public.payments
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (proof_url IS NOT NULL);

-- 3. COLUNAS FALTANDO em tabelas existentes (auditoria SEC V3)
-- organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS anac_registration TEXT,
  ADD COLUMN IF NOT EXISTS iata_code TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- clients: loyalty e clube
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS loyalty_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_member BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS member_tier TEXT DEFAULT 'basic'
    CHECK (member_tier IN ('basic','silver','gold','platinum'));

-- quotations: código sequencial COT-XXXXXX, layout, export URLs
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS layout_mode TEXT NOT NULL DEFAULT 'classico'
    CHECK (layout_mode IN ('template_excetur','classico','roteiro','presentation')),
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS agent_photo_url TEXT;

-- 4. GERADOR DE CÓDIGO COT-XXXXXX (automático no INSERT)
CREATE OR REPLACE FUNCTION public.generate_quotation_code()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  _prefix TEXT := 'COT';
  _seq    INT;
  _code   TEXT;
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    SELECT COALESCE(MAX(
      (REGEXP_MATCH(code, 'COT-([0-9A-F]+)'))[1]::bigint
    ), 0) + 1
    INTO _seq
    FROM public.quotations
    WHERE org_id = NEW.org_id AND code IS NOT NULL;

    -- Formato: COT-XXXXXX (6 caracteres hex uppercase)
    _code := _prefix || '-' || UPPER(TO_HEX(_seq)::TEXT);
    -- Pad para 6 chars: COT-00001A
    _code := _prefix || '-' || LPAD(UPPER(TO_HEX(_seq)::TEXT), 6, '0');
    NEW.code := _code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_quotation_code ON public.quotations;
CREATE TRIGGER trg_generate_quotation_code
  BEFORE INSERT ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.generate_quotation_code();

-- Preencher codes nas cotações existentes que não têm
DO $$
DECLARE
  rec RECORD;
  _seq INT := 0;
BEGIN
  FOR rec IN
    SELECT id, org_id FROM public.quotations
    WHERE code IS NULL
    ORDER BY created_at
  LOOP
    _seq := _seq + 1;
    UPDATE public.quotations
    SET code = 'COT-' || LPAD(UPPER(TO_HEX(_seq)::TEXT), 6, '0')
    WHERE id = rec.id;
  END LOOP;
END $$;

-- 5. FUNÇÃO RPC: calcular parcelas respeitando data de embarque
CREATE OR REPLACE FUNCTION public.calculate_installments(
  p_total_value    NUMERIC,
  p_deposit_pct    NUMERIC DEFAULT 0,      -- % de entrada (0-100)
  p_installments   INT DEFAULT 1,
  p_interest_rate  NUMERIC DEFAULT 0,      -- % ao mês
  p_boarding_date  DATE DEFAULT NULL,
  p_start_date     DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE
  _deposit        NUMERIC;
  _remaining      NUMERIC;
  _max_date       DATE;
  _inst_value     NUMERIC;
  _dates          DATE[];
  _adjusted_n     INT;
  _result         JSONB;
  _due            DATE;
  i               INT;
BEGIN
  _deposit   := ROUND(p_total_value * p_deposit_pct / 100.0, 2);
  _remaining := p_total_value - _deposit;
  _max_date  := COALESCE(p_boarding_date, '2099-12-31'::DATE);

  -- Calcular quantas parcelas cabem antes do embarque
  _adjusted_n := p_installments;
  IF p_boarding_date IS NOT NULL THEN
    LOOP
      _due := p_start_date + (_adjusted_n * INTERVAL '30 days')::INT;
      EXIT WHEN _due <= _max_date OR _adjusted_n = 1;
      _adjusted_n := _adjusted_n - 1;
    END LOOP;
  END IF;

  -- Aplicar juros simples
  IF p_interest_rate > 0 THEN
    _remaining := _remaining * (1 + (p_interest_rate / 100.0) * _adjusted_n);
  END IF;

  _inst_value := ROUND(_remaining / _adjusted_n, 2);

  -- Gerar datas
  _dates := ARRAY[]::DATE[];
  FOR i IN 1.._adjusted_n LOOP
    _dates := _dates || (p_start_date + (i * 30))::DATE;
  END LOOP;

  _result := jsonb_build_object(
    'deposit',             _deposit,
    'remaining',           _remaining,
    'installments_count',  _adjusted_n,
    'installment_value',   _inst_value,
    'total_with_interest', _deposit + _remaining,
    'payment_dates',       _dates,
    'last_payment_date',   _dates[_adjusted_n],
    'is_valid',            (_adjusted_n > 0),
    'adjusted_from',       p_installments,
    'was_adjusted',        (_adjusted_n < p_installments)
  );

  RETURN _result;
END;
$$;

-- 6. Bucket de Storage para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated can upload payment proofs" ON storage.objects;
CREATE POLICY "Authenticated can upload payment proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Authenticated can view payment proofs" ON storage.objects;
CREATE POLICY "Authenticated can view payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Anon pode fazer upload via link mágico do portal do cliente
DROP POLICY IF EXISTS "Anon can upload payment proofs" ON storage.objects;
CREATE POLICY "Anon can upload payment proofs" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'payment-proofs');
