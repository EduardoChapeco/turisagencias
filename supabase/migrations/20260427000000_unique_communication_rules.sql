-- Migration: add_unique_communication_rules
-- Propósito: Adicionar constraint UNIQUE(org_id, event_type) à tabela communication_rules
-- Necessário para que o upsert com onConflict funcione corretamente no seedCommunicationRules
-- Dependências: communication_rules (criada em 20260415191058)

-- A constraint é nomeada para poder ser referenciada de forma segura
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'communication_rules_org_event_unique'
      AND table_name = 'communication_rules'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.communication_rules
      ADD CONSTRAINT communication_rules_org_event_unique
      UNIQUE (org_id, event_type);
  END IF;
END $$;
