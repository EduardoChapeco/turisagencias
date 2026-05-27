import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { builderRepository } from '../repositories/builderRepository';
import { Database } from '@/integrations/supabase/types';
import { logError } from '@/shared/lib/logger';
import { toast } from '@/hooks/use-toast';

type BuilderProjectInsert = Database['public']['Tables']['builder_projects']['Insert'];

const QUERY_KEY = 'builder-projects';

export function useBuilderProjects() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => builderRepository.listProjects(),
    staleTime: 60 * 1000,
  });
}

export function useBuilderProject(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => builderRepository.getProject(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useBuilderVersions(projectId: string | undefined) {
  return useQuery({
    queryKey: ['builder-versions', projectId],
    queryFn: () => builderRepository.listVersions(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateBuilderProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<BuilderProjectInsert, 'org_id' | 'id' | 'created_at' | 'updated_at'>) =>
      builderRepository.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: 'Projeto criado com sucesso!' });
    },
    onError: (error) => {
      logError({ module: 'builder', action: 'createProject', error });
      toast({ title: 'Erro ao criar projeto', variant: 'destructive' });
    },
  });
}

export function useUpdateBuilderProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BuilderProjectInsert> }) =>
      builderRepository.updateProject(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.setQueryData([QUERY_KEY, data.id], data);
    },
    onError: (error) => {
      logError({ module: 'builder', action: 'updateProject', error });
      toast({ title: 'Erro ao salvar projeto', variant: 'destructive' });
    },
  });
}

export function useSaveBuilderVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: builderRepository.saveVersion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['builder-versions', variables.project_id] });
      toast({ title: 'Versão salva!' });
    },
    onError: (error) => {
      logError({ module: 'builder', action: 'saveVersion', error });
      toast({ title: 'Erro ao salvar versão', variant: 'destructive' });
    },
  });
}
