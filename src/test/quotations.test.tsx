import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import { mockOrganization, mockProfile } from './mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          ilike: vi.fn().mockResolvedValue({ data: [], error: null }),
          then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
        }),
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
          }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'q-1' }, error: null }),
        }),
      }),
    }),
    rpc: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}));

import Quotations from '@/pages/Quotations';

function renderWithProviders(ui: React.ReactElement, route = '/quotations') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useAuthStore.setState({
    user: { id: 'user-1', email: 'test@test.com' } as Record<string, any>,
    profile: mockProfile as Record<string, any>,
    organization: mockOrganization as Record<string, any>,
    roles: ['org_admin'],
    isLoading: false,
  });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Quotations Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders quotations list with title', () => {
    renderWithProviders(<Quotations />);
    expect(screen.getByRole('heading', { name: /propostas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nova cotação/i })).toBeInTheDocument();
  });

  it('opens quotation creation in a SheetPage instead of a route page', () => {
    renderWithProviders(<Quotations />);
    fireEvent.click(screen.getByRole('button', { name: /nova cotação/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/construtor de cota/i);
    expect(dialog).toHaveClass('fixed', 'inset-0', 'overflow-hidden');
    expect(dialog.querySelector('.right-0')).toHaveClass('fixed', 'right-0');
    expect(screen.getAllByText(/hospedagem/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/upload ia/i)).toBeInTheDocument();
    expect(screen.queryByText(/m.gica da ia/i)).not.toBeInTheDocument();
  });
});
