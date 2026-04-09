import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setOrganization, setRoles, setLoading, reset } = useAuthStore();

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Defer to avoid Supabase deadlock on simultaneous requests
        setTimeout(() => {
          fetchUserData(session.user.id).then(() => setLoading(false));
        }, 0);
      } else {
        reset();
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserData(userId: string) {
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId),
    ]);

    if (profileRes.data) {
      const profile = profileRes.data as Tables<'profiles'>;
      setProfile(profile);
      if (profile.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.org_id)
          .single();
        if (org) setOrganization(org as Tables<'organizations'>);
      }
    }

    if (rolesRes.data) {
      setRoles(rolesRes.data.map((r) => r.role as AppRole));
    }
  }

  return <>{children}</>;
}
