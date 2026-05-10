-- =====================================================================
-- MIGRAÇÃO: 20260428000011_restore_kanban_rls
-- Restaura as políticas de RLS para o módulo de Kanban (que foram removidas 
-- pela correção massiva de recursão mas não readicionadas) e altera a 
-- função RPC `ensure_default_kanban_boards` para usar SECURITY DEFINER 
-- contornando o RLS no momento da inserção (onboarding).
-- =====================================================================

-- 1. Fazer com que a função RPC bypass_rls (SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.ensure_default_kanban_boards(_org_id uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.ensure_default_kanban_boards(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _board_id uuid;
BEGIN
  -- Sales board (CRM Pipeline)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'sales') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'CRM — Pipeline de Vendas', 'sales', 'sales')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (org_id, board_id, name, "position", color) VALUES
      (_org_id, _board_id, 'Novo Lead', 0, '#94a3b8'),
      (_org_id, _board_id, 'Em Contato', 1, '#60a5fa'),
      (_org_id, _board_id, 'Proposta Enviada', 2, '#fbbf24'),
      (_org_id, _board_id, 'Negociando', 3, '#f97316'),
      (_org_id, _board_id, 'Fechado', 4, '#22c55e'),
      (_org_id, _board_id, 'Perdido', 5, '#ef4444');
  END IF;

  -- Departures board (Embarques)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'departures') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'Embarques', 'departures', 'departures')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (org_id, board_id, name, "position", color) VALUES
      (_org_id, _board_id, 'Documentação Pendente', 0, '#F59E0B'),
      (_org_id, _board_id, 'Check-in Aberto', 1, '#3B82F6'),
      (_org_id, _board_id, 'Prontos para Embarcar', 2, '#10B981'),
      (_org_id, _board_id, 'Em Viagem', 3, '#8B5CF6'),
      (_org_id, _board_id, 'Retornaram', 4, '#94a3b8');
  END IF;

  -- Tasks board (Tarefas do Dia)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'tasks') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'Tarefas do Dia', 'tasks', 'tasks')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (org_id, board_id, name, "position", color) VALUES
      (_org_id, _board_id, 'A Fazer', 0, '#6B7280'),
      (_org_id, _board_id, 'Em Progresso', 1, '#3B82F6'),
      (_org_id, _board_id, 'Revisão', 2, '#F59E0B'),
      (_org_id, _board_id, 'Concluído', 3, '#10B981');
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.ensure_default_kanban_boards(uuid) TO authenticated;

-- 2. Restaurar Políticas RLS nas tabelas do Kanban

-- ==================== TABELA: kanban_boards ====================
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_boards_select" ON public.kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_insert" ON public.kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_update" ON public.kanban_boards;
DROP POLICY IF EXISTS "kanban_boards_delete" ON public.kanban_boards;

CREATE POLICY "kanban_boards_select" ON public.kanban_boards FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_boards_insert" ON public.kanban_boards FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_boards_update" ON public.kanban_boards FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_boards_delete" ON public.kanban_boards FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- ==================== TABELA: kanban_columns ====================
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_columns_select" ON public.kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_insert" ON public.kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_update" ON public.kanban_columns;
DROP POLICY IF EXISTS "kanban_columns_delete" ON public.kanban_columns;

CREATE POLICY "kanban_columns_select" ON public.kanban_columns FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_columns_insert" ON public.kanban_columns FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_columns_update" ON public.kanban_columns FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_columns_delete" ON public.kanban_columns FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- ==================== TABELA: kanban_cards ====================
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_cards_select" ON public.kanban_cards;
DROP POLICY IF EXISTS "kanban_cards_insert" ON public.kanban_cards;
DROP POLICY IF EXISTS "kanban_cards_update" ON public.kanban_cards;
DROP POLICY IF EXISTS "kanban_cards_delete" ON public.kanban_cards;

CREATE POLICY "kanban_cards_select" ON public.kanban_cards FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_cards_insert" ON public.kanban_cards FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_cards_update" ON public.kanban_cards FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_cards_delete" ON public.kanban_cards FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- ==================== TABELA: kanban_notes ====================
ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_select" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_insert" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_update" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_delete" ON public.kanban_notes;

CREATE POLICY "kanban_notes_select" ON public.kanban_notes FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_notes_insert" ON public.kanban_notes FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_notes_update" ON public.kanban_notes FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_notes_delete" ON public.kanban_notes FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- ==================== TABELA: kanban_checklists ====================
ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_select" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_insert" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_update" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_delete" ON public.kanban_checklists;

CREATE POLICY "kanban_checklists_select" ON public.kanban_checklists FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_checklists_insert" ON public.kanban_checklists FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_checklists_update" ON public.kanban_checklists FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_checklists_delete" ON public.kanban_checklists FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- ==================== TABELA: kanban_checklist_items ====================
ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_select" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_insert" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_update" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_delete" ON public.kanban_checklist_items;

CREATE POLICY "kanban_checklist_items_select" ON public.kanban_checklist_items FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

CREATE POLICY "kanban_checklist_items_insert" ON public.kanban_checklist_items FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

CREATE POLICY "kanban_checklist_items_update" ON public.kanban_checklist_items FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()))
WITH CHECK (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

CREATE POLICY "kanban_checklist_items_delete" ON public.kanban_checklist_items FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.kanban_checklists kc WHERE kc.id = checklist_id AND kc.org_id = public.get_my_org_id()));

-- ==================== TABELA: kanban_tags ====================
ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_select" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_insert" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_update" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_delete" ON public.kanban_tags;

CREATE POLICY "kanban_tags_select" ON public.kanban_tags FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
CREATE POLICY "kanban_tags_insert" ON public.kanban_tags FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_tags_update" ON public.kanban_tags FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "kanban_tags_delete" ON public.kanban_tags FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());
