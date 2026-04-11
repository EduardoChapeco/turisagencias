-- Migration: kanban_crm_expansion
-- Criada em: 2026-04-11
-- Propósito: Adicionar tabelas para notas, checklists e tags do Kanban CRM
-- Dependências: kanban_cards, organizations, profiles

-- ─────────────────────────────────────────────
-- 1. kanban_notes — Notas por card
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_notes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id     UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kanban_notes_card_id ON kanban_notes(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_notes_org_id  ON kanban_notes(org_id);

ALTER TABLE kanban_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org gerenciam kanban_notes" ON kanban_notes FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

CREATE TRIGGER trg_updated_at_kanban_notes
BEFORE UPDATE ON kanban_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- 2. kanban_checklists — Checklists por card
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_checklists (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id     UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Checklist',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS kanban_checklist_items (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id   UUID NOT NULL REFERENCES kanban_checklists(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  is_checked     BOOLEAN NOT NULL DEFAULT FALSE,
  position       INT NOT NULL DEFAULT 0,
  checked_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kanban_checklists_card_id     ON kanban_checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_checklist_items_list    ON kanban_checklist_items(checklist_id);

ALTER TABLE kanban_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org gerenciam kanban_checklists" ON kanban_checklists FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE kanban_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org gerenciam kanban_checklist_items" ON kanban_checklist_items FOR ALL
  TO authenticated
  USING (
    checklist_id IN (
      SELECT id FROM kanban_checklists WHERE org_id = get_my_org_id()
    )
  )
  WITH CHECK (
    checklist_id IN (
      SELECT id FROM kanban_checklists WHERE org_id = get_my_org_id()
    )
  );

-- ─────────────────────────────────────────────
-- 3. kanban_tags — Tags por org + link com cards
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kanban_tags (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  color     TEXT NOT NULL DEFAULT '#2E86AB',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, name)
);

CREATE TABLE IF NOT EXISTS kanban_card_tags (
  card_id  UUID NOT NULL REFERENCES kanban_cards(id)  ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES kanban_tags(id)   ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_kanban_tags_org_id      ON kanban_tags(org_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_tags_card   ON kanban_card_tags(card_id);
CREATE INDEX IF NOT EXISTS idx_kanban_card_tags_tag    ON kanban_card_tags(tag_id);

ALTER TABLE kanban_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org gerenciam kanban_tags" ON kanban_tags FOR ALL
  TO authenticated
  USING (org_id = get_my_org_id())
  WITH CHECK (org_id = get_my_org_id());

ALTER TABLE kanban_card_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Membros da org gerenciam kanban_card_tags" ON kanban_card_tags FOR ALL
  TO authenticated
  USING (
    card_id IN (
      SELECT id FROM kanban_cards WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE org_id = get_my_org_id()
      )
    )
  )
  WITH CHECK (
    card_id IN (
      SELECT id FROM kanban_cards WHERE board_id IN (
        SELECT id FROM kanban_boards WHERE org_id = get_my_org_id()
      )
    )
  );

-- ─────────────────────────────────────────────
-- 4. Adicionar colunas extras em kanban_cards
-- ─────────────────────────────────────────────
ALTER TABLE kanban_cards
  ADD COLUMN IF NOT EXISTS estimated_value   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS whatsapp          TEXT,
  ADD COLUMN IF NOT EXISTS email             TEXT,
  ADD COLUMN IF NOT EXISTS tags              TEXT[] DEFAULT '{}';

-- ─────────────────────────────────────────────
-- 5. Trigger updated_at em kanban_cards
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_updated_at_kanban_cards'
  ) THEN
    CREATE TRIGGER trg_updated_at_kanban_cards
    BEFORE UPDATE ON kanban_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
