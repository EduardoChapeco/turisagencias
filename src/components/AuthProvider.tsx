import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';
import { logger } from '@/utils/logger';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setLoading, setOrganization, setProfile, setRoles, setUser, reset } = useAuthStore();
  const activeUserIdRef = useRef<string | null>(null);

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
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          activeUserIdRef.current = session.user.id;
          setUser(session.user);
          await fetchUserData(session.user.id);
        } else {
          activeUserIdRef.current = null;
          reset();
        }
      } catch (error) {
        logger.error('Failed to load authenticated user context', error);
        activeUserIdRef.current = null;
        reset();
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        activeUserIdRef.current = null;
        reset();
        return;
      }

      setUser(session.user);

      if (event === 'TOKEN_REFRESHED') return;

      const isNewUser = activeUserIdRef.current !== session.user.id;
      activeUserIdRef.current = session.user.id;

      if (event === 'SIGNED_IN' && !isNewUser) return;

      setLoading(isNewUser);

      setTimeout(() => {
        fetchUserData(session.user.id)
          .catch((error) => {
            logger.error('Failed to sync authenticated user context', error);
            activeUserIdRef.current = null;
            reset();
          })
          .finally(() => setLoading(false));
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, reset, setLoading, setUser]);

  return <>{children}</>;
}
