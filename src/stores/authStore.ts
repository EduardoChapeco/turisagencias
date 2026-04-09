import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Profile, Organization, AppRole } from '@/types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  roles: AppRole[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOrganization: (org: Organization | null) => void;
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
