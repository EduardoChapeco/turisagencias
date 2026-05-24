-- ============================================================
-- Migration: 20260524000001_normalize_duplicate_columns.sql
-- Objetivo: P1-2, P1-3 — Unificar colunas duplicadas em quotations
--           e garantir consistência de dados via triggers
-- ============================================================

-- 1. BACKFILL: Unificar dados das colunas duplicadas de pax em quotations
--    Estratégia: prioridade pax_adultos > num_adults > adults (mais específico primeiro)
UPDATE quotations SET
  pax_adultos = COALESCE(pax_adultos, num_adults, adults, 1),
  pax_criancas = COALESCE(pax_criancas, num_children, children, 0)
WHERE pax_adultos IS NULL OR pax_criancas IS NULL;

-- Backfill as colunas legadas com os valores canônicos para consistência atual
UPDATE quotations SET
  num_adults = pax_adultos,
  adults = pax_adultos,
  num_children = pax_criancas,
  children = pax_criancas
WHERE num_adults IS NULL OR adults IS NULL OR num_children IS NULL OR children IS NULL;

-- Calcular total_pax onde está NULL
UPDATE quotations SET
  total_pax = COALESCE(pax_adultos, 0) + COALESCE(pax_seniores, 0) + 
              COALESCE(pax_criancas, 0) + COALESCE(pax_infantil, 0)
WHERE total_pax IS NULL OR total_pax = 0;

-- 2. BACKFILL: Unificar markup (markup_pct é o canônico)
UPDATE quotations SET
  markup_pct = COALESCE(markup_pct, markup_percent)
WHERE markup_pct IS NULL AND markup_percent IS NOT NULL;

UPDATE quotations SET
  markup_percent = markup_pct
WHERE markup_percent IS NULL AND markup_pct IS NOT NULL;

-- 3. TRIGGER: Manter colunas PAX sincronizadas em INSERT e UPDATE
CREATE OR REPLACE FUNCTION sync_quotation_pax_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- pax_adultos é o canônico — sincroniza legados
  IF NEW.pax_adultos IS NOT NULL THEN
    NEW.num_adults := NEW.pax_adultos;
    NEW.adults := NEW.pax_adultos;
  ELSIF NEW.num_adults IS NOT NULL THEN
    NEW.pax_adultos := NEW.num_adults;
    NEW.adults := NEW.num_adults;
  ELSIF NEW.adults IS NOT NULL THEN
    NEW.pax_adultos := NEW.adults;
    NEW.num_adults := NEW.adults;
  END IF;

  IF NEW.pax_criancas IS NOT NULL THEN
    NEW.num_children := NEW.pax_criancas;
    NEW.children := NEW.pax_criancas;
  ELSIF NEW.num_children IS NOT NULL THEN
    NEW.pax_criancas := NEW.num_children;
    NEW.children := NEW.num_children;
  ELSIF NEW.children IS NOT NULL THEN
    NEW.pax_criancas := NEW.children;
    NEW.num_children := NEW.children;
  END IF;

  -- markup_pct é o canônico
  IF NEW.markup_pct IS NOT NULL THEN
    NEW.markup_percent := NEW.markup_pct;
  ELSIF NEW.markup_percent IS NOT NULL THEN
    NEW.markup_pct := NEW.markup_percent;
  END IF;

  -- Recalcula total_pax
  NEW.total_pax := COALESCE(NEW.pax_adultos, 0) + COALESCE(NEW.pax_seniores, 0) + 
                   COALESCE(NEW.pax_criancas, 0) + COALESCE(NEW.pax_infantil, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_quotation_pax ON quotations;
CREATE TRIGGER trg_sync_quotation_pax
  BEFORE INSERT OR UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION sync_quotation_pax_columns();

-- 4. TRIGGER: Manter ticket assigned_agent_id e subject_line sincronizados
CREATE OR REPLACE FUNCTION sync_ticket_agent_and_subject()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Sincroniza assigned_agent_id com assigned_to (ambos apontam para o agente designado)
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_agent_id IS NULL THEN
    NEW.assigned_agent_id := NEW.assigned_to;
  END IF;
  IF NEW.assigned_agent_id IS NOT NULL AND NEW.assigned_to IS NULL THEN
    NEW.assigned_to := NEW.assigned_agent_id;
  END IF;

  -- subject_line fallback para title
  IF NEW.subject_line IS NULL AND NEW.title IS NOT NULL THEN
    NEW.subject_line := NEW.title;
  END IF;

  -- created_by_id fallback para created_by
  IF NEW.created_by_id IS NULL AND NEW.created_by IS NOT NULL THEN
    NEW.created_by_id := NEW.created_by;
  END IF;

  -- created_by_type default
  IF NEW.created_by_type IS NULL THEN
    NEW.created_by_type := 'agent';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_ticket_agent ON tickets;
CREATE TRIGGER trg_sync_ticket_agent
  BEFORE INSERT OR UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION sync_ticket_agent_and_subject();

-- 5. Backfill tickets existentes
UPDATE tickets SET
  assigned_agent_id = COALESCE(assigned_agent_id, assigned_to),
  assigned_to = COALESCE(assigned_to, assigned_agent_id),
  subject_line = COALESCE(subject_line, title),
  created_by_id = COALESCE(created_by_id, created_by),
  created_by_type = COALESCE(created_by_type, 'agent')
WHERE assigned_agent_id IS NULL 
   OR subject_line IS NULL 
   OR created_by_id IS NULL 
   OR created_by_type IS NULL;

-- 6. INDEX: Melhorar busca por passaporte vencido (nova feature possível)
CREATE INDEX IF NOT EXISTS idx_clients_passport_expiry 
  ON clients (passport_expiry) 
  WHERE passport_expiry IS NOT NULL;

-- 7. INDEX: Melhorar busca por membro ativo
CREATE INDEX IF NOT EXISTS idx_clients_is_member 
  ON clients (org_id, is_member) 
  WHERE is_member = true;

-- 8. INDEX: ticket_code único
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_ticket_code 
  ON tickets (ticket_code)
  WHERE ticket_code IS NOT NULL;
