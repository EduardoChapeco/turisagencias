import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';
import type { AppRole } from '@/types';

interface AuthState {
  user: User | null;
  profile: Tables<'profiles'> | null;
  organization: Tables<'organizations'> | null;
  roles: AppRole[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Tables<'profiles'> | null) => void;
  setOrganization: (org: Tables<'organizations'> | null) => void;
  setRoles: (roles: AppRole[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  organization: null,
  roles: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (organization) => set({ organization }),
  setRoles: (roles) => set({ roles }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, profile: null, organization: null, roles: [], isLoading: false }),
}));
