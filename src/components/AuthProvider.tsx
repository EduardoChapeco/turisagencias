import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setOrganization, setRoles, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Defer data fetching to avoid Supabase deadlock
        setTimeout(async () => {
          await fetchUserData(session.user.id);
          setLoading(false);
        }, 0);
      } else {
        reset();
      }
    });

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
      setProfile(profileRes.data as any);
      if (profileRes.data.org_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileRes.data.org_id)
          .single();
        if (org) setOrganization(org as any);
      }
    }

    if (rolesRes.data) {
      setRoles(rolesRes.data.map((r: any) => r.role as AppRole));
    }
  }

  return <>{children}</>;
}
