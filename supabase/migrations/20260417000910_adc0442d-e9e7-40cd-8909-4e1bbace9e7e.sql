-- Atualizar função para semear todos os 3 boards padrão (sales, departures, tasks)
CREATE OR REPLACE FUNCTION public.ensure_default_kanban_boards(_org_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _board_id uuid;
BEGIN
  -- Sales board (CRM Pipeline)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'sales') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'CRM — Pipeline de Vendas', 'sales', 'sales')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (board_id, name, "position", color) VALUES
      (_board_id, 'Novo Lead', 0, '#94a3b8'),
      (_board_id, 'Em Contato', 1, '#60a5fa'),
      (_board_id, 'Proposta Enviada', 2, '#fbbf24'),
      (_board_id, 'Negociando', 3, '#f97316'),
      (_board_id, 'Fechado', 4, '#22c55e'),
      (_board_id, 'Perdido', 5, '#ef4444');
  END IF;

  -- Departures board (Embarques)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'departures') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'Embarques', 'departures', 'departures')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (board_id, name, "position", color) VALUES
      (_board_id, 'Documentação Pendente', 0, '#F59E0B'),
      (_board_id, 'Check-in Aberto', 1, '#3B82F6'),
      (_board_id, 'Prontos para Embarcar', 2, '#10B981'),
      (_board_id, 'Em Viagem', 3, '#8B5CF6'),
      (_board_id, 'Retornaram', 4, '#94a3b8');
  END IF;

  -- Tasks board (Tarefas do Dia)
  IF NOT EXISTS (SELECT 1 FROM public.kanban_boards WHERE org_id = _org_id AND slug = 'tasks') THEN
    INSERT INTO public.kanban_boards (org_id, name, slug, board_type)
    VALUES (_org_id, 'Tarefas do Dia', 'tasks', 'tasks')
    RETURNING id INTO _board_id;

    INSERT INTO public.kanban_columns (board_id, name, "position", color) VALUES
      (_board_id, 'A Fazer', 0, '#6B7280'),
      (_board_id, 'Em Progresso', 1, '#3B82F6'),
      (_board_id, 'Revisão', 2, '#F59E0B'),
      (_board_id, 'Concluído', 3, '#10B981');
  END IF;
END;
$function$;

-- Remover board duplicado "vendas" (legacy) se "sales" já existir para a mesma org
DELETE FROM public.kanban_boards
WHERE slug = 'vendas'
  AND EXISTS (
    SELECT 1 FROM public.kanban_boards kb2
    WHERE kb2.org_id = kanban_boards.org_id AND kb2.slug = 'sales'
  );

-- Garantir que toda org existente tenha os 3 boards
DO $$
DECLARE
  _org RECORD;
BEGIN
  FOR _org IN SELECT id FROM public.organizations LOOP
    PERFORM public.ensure_default_kanban_boards(_org.id);
  END LOOP;
END $$;

-- Trigger: ao criar uma nova org, semear automaticamente os boards
CREATE OR REPLACE FUNCTION public.seed_kanban_for_new_org()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.ensure_default_kanban_boards(NEW.id);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_seed_kanban_for_new_org ON public.organizations;
CREATE TRIGGER trg_seed_kanban_for_new_org
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_kanban_for_new_org();