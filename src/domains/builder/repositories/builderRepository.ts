import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logError } from '@/shared/lib/logger';

type BuilderProject = Database['public']['Tables']['builder_projects']['Row'];
type BuilderProjectInsert = Database['public']['Tables']['builder_projects']['Insert'];
type BuilderVersion = Database['public']['Tables']['builder_versions']['Row'];
type BuilderVersionInsert = Database['public']['Tables']['builder_versions']['Insert'];

export const builderRepository = {
 /**
 * Busca todos os projetos da organização do usuário autenticado.
 * RLS garante isolamento por org_id.
 */
 async listProjects(): Promise<BuilderProject[]> {
 const { data, error } = await supabase
 .from('builder_projects')
 .select('*')
 .is('deleted_at', null)
 .order('updated_at', { ascending: false });

 if (error) {
 logError({ module: 'builder', action: 'listProjects', error });
 throw error;
 }

 return data ?? [];
 },

 /**
 * Busca um projeto pelo ID.
 */
 async getProject(id: string): Promise<BuilderProject | null> {
 const { data, error } = await supabase
 .from('builder_projects')
 .select('*')
 .eq('id', id)
 .single();

 if (error) {
 if (error.code === 'PGRST116') return null; // Not found
 logError({ module: 'builder', action: 'getProject', error, context: { id } });
 throw error;
 }

 return data;
 },

 /**
 * Cria um novo projeto.
 * org_id é injetado pelo RLS — não aceitar do cliente.
 */
 async createProject(input: Omit<BuilderProjectInsert, 'org_id' | 'id' | 'created_at' | 'updated_at'>): Promise<BuilderProject> {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('Não autenticado');

 const { data: profile } = await supabase
 .from('profiles')
 .select('org_id')
 .eq('id', user.id)
 .single();

 if (!profile?.org_id) throw new Error('Organização não encontrada');

 const { data, error } = await supabase
 .from('builder_projects')
 .insert({ ...input, org_id: profile.org_id })
 .select()
 .single();

 if (error) {
 logError({ module: 'builder', action: 'createProject', error, context: { input } });
 throw error;
 }

 return data;
 },

 /**
 * Atualiza um projeto existente.
 */
 async updateProject(id: string, updates: Partial<BuilderProjectInsert>): Promise<BuilderProject> {
 const { data, error } = await supabase
 .from('builder_projects')
 .update({ ...updates, updated_at: new Date().toISOString() })
 .eq('id', id)
 .select()
 .single();

 if (error) {
 logError({ module: 'builder', action: 'updateProject', error, context: { id, updates } });
 throw error;
 }

 return data;
 },

 /**
 * Salva uma nova versão (draft) do projeto.
 */
 async saveVersion(input: Omit<BuilderVersionInsert, 'id' | 'created_at'>): Promise<BuilderVersion> {
 const { data, error } = await supabase
 .from('builder_versions')
 .insert(input)
 .select()
 .single();

 if (error) {
 logError({ module: 'builder', action: 'saveVersion', error, context: { project_id: input.project_id } });
 throw error;
 }

 return data;
 },

 /**
 * Lista versões de um projeto.
 */
 async listVersions(projectId: string): Promise<BuilderVersion[]> {
 const { data, error } = await supabase
 .from('builder_versions')
 .select('*')
 .eq('project_id', projectId)
 .order('version_number', { ascending: false });

 if (error) {
 logError({ module: 'builder', action: 'listVersions', error, context: { projectId } });
 throw error;
 }

 return data ?? [];
 },

 /**
 * Busca a versão publicada de um projeto.
 */
 async getPublishedVersion(projectId: string): Promise<BuilderVersion | null> {
 const { data, error } = await supabase
 .from('builder_versions')
 .select('*')
 .eq('project_id', projectId)
 .eq('status', 'published')
 .order('version_number', { ascending: false })
 .limit(1)
 .maybeSingle();

 if (error) {
 logError({ module: 'builder', action: 'getPublishedVersion', error, context: { projectId } });
 throw error;
 }

 return data;
 },
};
