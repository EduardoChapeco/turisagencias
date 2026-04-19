-- ═══════════════════════════════════════════════════════════════
-- Migration: kanban_fix_and_schema_expansion
-- Data: 2026-04-11
-- Propósito: Corrigir Kanban + Expandir Cotações, Clientes, Hotels
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. KANBAN FIX: Garantir UNIQUE constraint
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_kanban_boards_org_slug'
  ) THEN
    ALTER TABLE kanban_boards
      ADD CONSTRAINT uq_kanban_boards_org_slug UNIQUE (org_id, slug);
  END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- 2. KANBAN FIX: RPC ensure_default_kanban_boards
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ensure_default_kanban_boards(_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _sales_board_id UUID;
  _dep_board_id   UUID;
BEGIN
  -- ── Sales Board ──
  INSERT INTO kanban_boards (org_id, name, slug)
  VALUES (_org_id, 'Vendas', 'sales')
  ON CONFLICT (org_id, slug) DO NOTHING
  RETURNING id INTO _sales_board_id;

  IF _sales_board_id IS NOT NULL THEN
    INSERT INTO kanban_columns (board_id, name, color, position) VALUES
      (_sales_board_id, 'Leads',        '#94a3b8', 0),
      (_sales_board_id, 'Qualificado',  '#60a5fa', 1),
      (_sales_board_id, 'Proposta',     '#a78bfa', 2),
      (_sales_board_id, 'Negociação',   '#fb923c', 3),
      (_sales_board_id, 'Fechado ✅',   '#34d399', 4),
      (_sales_board_id, 'Perdido ❌',   '#f87171', 5);
  END IF;

  -- ── Departures Board ──
  INSERT INTO kanban_boards (org_id, name, slug)
  VALUES (_org_id, 'Embarques', 'departures')
  ON CONFLICT (org_id, slug) DO NOTHING
  RETURNING id INTO _dep_board_id;

  IF _dep_board_id IS NOT NULL THEN
    INSERT INTO kanban_columns (board_id, name, color, position) VALUES
      (_dep_board_id, 'Confirmado',      '#60a5fa', 0),
      (_dep_board_id, 'Docs Pendentes',  '#fb923c', 1),
      (_dep_board_id, 'Pronto para IR',  '#34d399', 2),
      (_dep_board_id, 'Em Viagem ✈️',   '#a78bfa', 3),
      (_dep_board_id, 'Retornou',        '#94a3b8', 4);
  END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. COTAÇÕES: Expansão para multi-dia e personalização
-- ─────────────────────────────────────────────
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS cover_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS itinerary        JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS transports       JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS excursions       JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS pricing_mode     TEXT DEFAULT 'per_person',
  ADD COLUMN IF NOT EXISTS notes_internal   TEXT,
  ADD COLUMN IF NOT EXISTS valid_until      DATE,
  ADD COLUMN IF NOT EXISTS included_items   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_items   TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS media_urls       TEXT[] DEFAULT '{}';

-- ─────────────────────────────────────────────
-- 4. CLIENTES: Suporte a documentos uploadados
-- ─────────────────────────────────────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS passport_url     TEXT,
  ADD COLUMN IF NOT EXISTS documents        JSONB DEFAULT '[]';

-- ─────────────────────────────────────────────
-- 5. HOTÉIS: Avaliações
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotel_reviews (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id      UUID NOT NULL REFERENCES hotels_bank(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_name   TEXT NOT NULL,
  rating        INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  photo_url     TEXT,
  travel_date   DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hotel_reviews_hotel_id ON hotel_reviews(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_org_id   ON hotel_reviews(org_id);

ALTER TABLE hotel_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Membros gerenciam hotel_reviews" ON hotel_reviews;
DROP POLICY IF EXISTS "Membros gerenciam hotel_reviews" ON hotel_reviews;
CREATE POLICY "Membros gerenciam hotel_reviews" ON hotel_reviews FOR ALL
  TO authenticated
  USING  (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

-- ─────────────────────────────────────────────
-- 6. GUIAS: Roteiro dia-a-dia
-- ─────────────────────────────────────────────
ALTER TABLE destination_guides
  ADD COLUMN IF NOT EXISTS itinerary        JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS points_of_interest JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS quick_facts      JSONB DEFAULT '[]';

-- ─────────────────────────────────────────────
-- 7. VIAGENS: Campos avançados
-- ─────────────────────────────────────────────
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS itinerary        JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS attachments      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS quotation_id     UUID REFERENCES quotations(id) ON DELETE SET NULL;
