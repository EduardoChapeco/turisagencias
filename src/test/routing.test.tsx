import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
    rpc: vi.fn().mockReturnValue({
      then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
    }),
    functions: { invoke: vi.fn() },
  },
}));

import App from '@/App';

function renderApp(route: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated user from / to /login', async () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderApp('/');
    // ProtectedRoute should redirect to login
    await screen.findByText(/voyageos/i);
    expect(screen.getByText(/entrar/i)).toBeInTheDocument();
  });

  it('shows login page for /login route', () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderApp('/login');
    expect(screen.getByText(/voyageos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('shows signup page for /signup route', () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderApp('/signup');
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
  });

  it('shows 404 for unknown routes', async () => {
    useAuthStore.setState({ user: null, isLoading: false, profile: null, organization: null, roles: [] });
    renderApp('/unknown-page');
    await screen.findByText('404');
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('redirects authenticated user without org to /onboarding', async () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as any,
      profile: { id: 'p-1', user_id: 'user-1', org_id: null, first_name: 'Test', last_name: 'User', avatar_url: null, phone: null, created_at: '', updated_at: '' },
      organization: null,
      roles: ['agent'],
      isLoading: false,
    });
    renderApp('/');
    // OnboardingGuard should redirect to /onboarding
    await screen.findByText(/configure sua agência/i);
  });

  it('shows dashboard for authenticated user with org', async () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as any,
      profile: { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'Test', last_name: 'User', avatar_url: null, phone: null, created_at: '', updated_at: '' },
      organization: { id: 'org-1', name: 'Test Org', slug: 'test', logo_url: null, primary_color: null, whatsapp: null, plan: 'free', settings: {}, created_at: '', updated_at: '' } as any,
      roles: ['org_admin'],
      isLoading: false,
    });
    renderApp('/');
    await screen.findByText(/olá, test/i);
  });
});
