import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';
import { logger } from '@/utils/logger';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setLoading, setOrganization, setProfile, setRoles, setUser, reset } = useAuthStore();
  const activeUserIdRef = useRef<string | null>(null);

  const fetchUserData = useCallback(async (userId: string) => {
    logger.info('Fetching user context for:', userId);

    const [{ data: profile, error: profileError }, { data: rolesData, error: rolesError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    if (profileError) {
      logger.error('Error fetching profile:', profileError);
      throw profileError;
    }
    if (rolesError) {
      logger.error('Error fetching roles:', rolesError);
      throw rolesError;
    }

    const roles = (rolesData ?? []).map((item) => item.role as AppRole);
    
    // Fallback de segurança para o dono da plataforma (Eduardo)
    // Isso garante que ele nunca fique trancado fora se a tabela de papéis falhar
    const { data: { session } } = await supabase.auth.getSession();
    const isMaster = roles.includes('super_admin') || session?.user?.email === 'eusoueduoficial@gmail.com';
    
    setProfile(profile ?? null);
    setRoles(roles);

    if (profile?.org_id) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .maybeSingle();

      if (orgError) {
        logger.error('Error fetching organization:', orgError);
        if (isMaster) {
          setOrganization(null);
          return;
        }
        throw orgError;
      }

      if (org) {
        setOrganization(org);
        return;
      }
    }

    if (isMaster) {
      logger.info('Master user detected. Ensuring access even without explicit org_id.');
      // Se for master e não tiver org vinculada no perfil, tenta carregar a primeira disponível
      if (!profile?.org_id) {
        const { data: firstOrg } = await supabase.from('organizations').select('*').limit(1).maybeSingle();
        if (firstOrg) {
          setOrganization(firstOrg);
          return;
        }
      }
    }
    setOrganization(null);
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

      activeUserIdRef.current = session.user.id;

      if (event === 'TOKEN_REFRESHED') {
        setUser(session.user);
        return;
      }

      setLoading(true);
      setUser(session.user);

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
