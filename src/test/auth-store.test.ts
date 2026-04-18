import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      profile: null,
      organization: null,
      roles: [],
      isLoading: true,
    });
  });

  it('initializes with loading state', () => {
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.organization).toBeNull();
    expect(state.roles).toEqual([]);
  });

  it('sets user correctly', () => {
    const mockUser = { id: 'user-1', email: 'test@test.com' } as Record<string, any>;
    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('sets profile correctly', () => {
    const mockProfile = { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'Test', last_name: 'User', avatar_url: null, phone: null, bio: null, email: null, is_active: true, last_seen_at: null, notification_prefs: {}, whatsapp: null, created_at: '', updated_at: '' } as Record<string, any>;
    useAuthStore.getState().setProfile(mockProfile);
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  it('sets organization correctly', () => {
    const mockOrg = { id: 'org-1', name: 'Test Org' } as Record<string, any>;
    useAuthStore.getState().setOrganization(mockOrg);
    expect(useAuthStore.getState().organization).toEqual(mockOrg);
  });

  it('sets roles correctly', () => {
    useAuthStore.getState().setRoles(['org_admin', 'agent']);
    expect(useAuthStore.getState().roles).toEqual(['org_admin', 'agent']);
  });

  it('resets state completely', () => {
    useAuthStore.getState().setUser({ id: 'x' } as Record<string, any>);
    useAuthStore.getState().setRoles(['agent']);
    useAuthStore.getState().setLoading(false);

    useAuthStore.getState().reset();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.organization).toBeNull();
    expect(state.roles).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('toggles loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
