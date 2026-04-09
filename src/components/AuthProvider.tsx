import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setOrganization, setRoles, setLoading, reset } = useAuthStore();

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (rolesRes.error) throw rolesRes.error;

      setProfile(profileRes.data ?? null);
      setOrganization(null);

      if (profileRes.data?.org_id) {
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileRes.data.org_id)
          .maybeSingle();

        if (orgError) throw orgError;
        setOrganization(org ?? null);
      }

      setRoles((rolesRes.data ?? []).map((item) => item.role as AppRole));
    } catch (error) {
      console.error('Erro ao carregar contexto do usuário', error);
      setProfile(null);
      setOrganization(null);
      setRoles([]);
    }
  }, [setOrganization, setProfile, setRoles]);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(true);
        // Defer to avoid Supabase deadlock on simultaneous requests
        setTimeout(() => {
          fetchUserData(session.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        reset();
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, reset, setLoading, setUser]);

  return <>{children}</>;
}
