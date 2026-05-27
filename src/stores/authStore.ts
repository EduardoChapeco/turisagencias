import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';
import type { AppRole } from '@/types';

interface AuthState {
 user: User | null;
 profile: Tables<'profiles'> | null;
 organization: Tables<'organizations'> | null;
 roles: AppRole[];
 isMasterAuthenticated: boolean;
 isLoading: boolean;
 setUser: (user: User | null) => void;
 setProfile: (profile: Tables<'profiles'> | null) => void;
 setOrganization: (org: Tables<'organizations'> | null) => void;
 setRoles: (roles: AppRole[]) => void;
 setLoading: (loading: boolean) => void;
 setMasterAuthenticated: (auth: boolean) => void;
 reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
 user: null,
 profile: null,
 organization: null,
 roles: [],
 isMasterAuthenticated: false,
 isLoading: true,
 setUser: (user) => set({ user }),
 setProfile: (profile) => set({ profile }),
 setOrganization: (organization) => set({ organization }),
 setRoles: (roles) => set({ roles }),
 setLoading: (isLoading) => set({ isLoading }),
 setMasterAuthenticated: (isMasterAuthenticated) => set({ isMasterAuthenticated }),
 reset: () => set({ user: null, profile: null, organization: null, roles: [], isMasterAuthenticated: false, isLoading: false }),
}));
