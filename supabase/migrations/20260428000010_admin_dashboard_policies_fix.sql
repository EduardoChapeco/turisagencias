-- SPRINT 2 / MASTER SAAS ADMIN FIX
-- Corrige as políticas RLS para permitir que o Dashboard Master (Super Admin) 
-- gerencie todas as agências, perfis e veja tarefas globais de IA.

-- 1. PROFILES: Permitir que super_admin liste todos os perfis
DROP POLICY IF EXISTS "profiles_own_select" ON public.profiles;

CREATE POLICY "profiles_own_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- 2. ORGANIZATIONS: Permitir que super_admin atualize QUALQUER organização
DROP POLICY IF EXISTS "orgs_admin_update" ON public.organizations;

CREATE POLICY "orgs_admin_update"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    (id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- 3. AI_TASKS: Permitir que super_admin veja todas as tarefas
DROP POLICY IF EXISTS "Users view tasks in own org" ON public.ai_tasks;

CREATE POLICY "Users view tasks in own org" 
  ON public.ai_tasks
  FOR SELECT 
  TO authenticated 
  USING (
    org_id = public.get_my_org_id()
    OR public.has_role(auth.uid(), 'super_admin')
  );
