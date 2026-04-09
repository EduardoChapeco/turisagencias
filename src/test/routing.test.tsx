import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

function createFromMock() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      order: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  };
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => createFromMock()),
    rpc: vi.fn().mockReturnValue({
      then: (cb: (value: unknown) => void) => cb({ data: [], error: null }),
    }),
    functions: { invoke: vi.fn() },
  },
}));

import Dashboard from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function renderInRouter(ui: React.ReactElement, route = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Route Guards', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ProtectedRoute redirects unauthenticated user to /login', () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderInRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('ProtectedRoute shows loading spinner while loading', () => {
    useAuthStore.setState({ user: null, isLoading: true, profile: null, organization: null, roles: [] });
    renderInRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('ProtectedRoute renders children for authenticated user', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as never,
      isLoading: false,
      profile: null,
      organization: null,
      roles: [],
    });
    renderInRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('Login page renders correctly', () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderInRouter(<Login />, '/login');
    expect(screen.getByText(/voyageos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('Login page redirects authenticated user away', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as never,
      isLoading: false,
      profile: null,
      organization: null,
      roles: [],
    });
    renderInRouter(<Login />, '/login');
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
  });

  it('Signup page renders correctly', () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderInRouter(<Signup />, '/signup');
    expect(screen.getByRole('heading', { name: /criar sua conta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('NotFound page shows 404', () => {
    renderInRouter(<NotFound />, '/unknown');
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
  });

  it('Onboarding redirects if organization exists', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as never,
      profile: { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'T', last_name: 'U', avatar_url: null, email: null, whatsapp: null, bio: null, is_active: true, last_seen_at: null, notification_prefs: {}, phone: null, created_at: '', updated_at: '' },
      organization: { id: 'org-1', name: 'Test', slug: 'test', address: {}, ai_keys_config: {}, email: null, is_active: true, phone: null } as never,
      roles: ['org_admin'],
      isLoading: false,
    });
    renderInRouter(<Onboarding />, '/onboarding');
    expect(screen.queryByText(/configure sua agência/i)).not.toBeInTheDocument();
  });

  it('Dashboard renders for authenticated user with org', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as never,
      profile: { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'Test', last_name: 'User', avatar_url: null, email: 'test@test.com', whatsapp: null, bio: null, is_active: true, last_seen_at: null, notification_prefs: {}, phone: null, created_at: '', updated_at: '' },
      organization: { id: 'org-1', name: 'Test Org', slug: 'test', logo_url: null, primary_color: null, whatsapp: null, plan: 'free', settings: {}, created_at: '', updated_at: '', address: {}, ai_keys_config: {}, email: null, is_active: true, phone: null } as never,
      roles: ['org_admin'],
      isLoading: false,
    });
    renderInRouter(<Dashboard />, '/');
    expect(screen.getByText(/olá, test/i)).toBeInTheDocument();
  });
});
