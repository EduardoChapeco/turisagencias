-- Fix missing org_id in kanban_columns insertion during onboarding

CREATE OR REPLACE FUNCTION public.ensure_default_kanban_boards(_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
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
$function$;
