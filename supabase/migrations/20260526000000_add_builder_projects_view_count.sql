-- Migration: 20260526000000_add_builder_projects_view_count.sql
-- Descrição: Adiciona a coluna view_count à tabela builder_projects e cria a função RPC para incremento seguro.

ALTER TABLE public.builder_projects ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- Criar função RPC para incremento seguro de visualizações (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.increment_project_view(p_project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.builder_projects
  SET view_count = view_count + 1
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permissão de execução para anon, authenticated e service_role
GRANT EXECUTE ON FUNCTION public.increment_project_view(UUID) TO anon, authenticated, service_role;
