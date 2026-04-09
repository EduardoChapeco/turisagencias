import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLoading, setOrganization, setProfile, setRoles, setUser, reset } = useAuthStore();

  const fetchUserData = useCallback(async (userId: string) => {
    const [{ data: profile, error: profileError }, { data: rolesData, error: rolesError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    if (profileError) throw profileError;
    if (rolesError) throw rolesError;

    setProfile(profile ?? null);
    setRoles((rolesData ?? []).map((item) => item.role as AppRole));

    if (profile?.org_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .maybeSingle();

      if (orgError) throw orgError;
      setOrganization(org ?? null);
    } else {
      setOrganization(null);
    }
  }, [setOrganization, setProfile, setRoles]);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        try {
          await fetchUserData(session.user.id);
        } catch (error) {
          console.error('Erro ao carregar contexto do usuário', error);
          reset();
        }
      } else {
        reset();
      }

      setLoading(false);
    };

    void bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        reset();
        return;
      }

      setUser(session.user);
      setLoading(true);

      queueMicrotask(() => {
        fetchUserData(session.user.id)
          .catch((error) => {
            console.error('Erro ao sincronizar sessão', error);
            reset();
          })
          .finally(() => setLoading(false));
      });
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, reset, setLoading, setUser]);

  return <>{children}</>;
}
