import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
import QuotationNew from '@/pages/QuotationNew';

function renderWithProviders(ui: React.ReactElement, route = '/quotations') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  useAuthStore.setState({
    user: { id: 'user-1', email: 'test@test.com' } as any,
    profile: mockProfile as any,
    organization: mockOrganization as any,
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
    expect(screen.getByRole('heading', { name: 'Cotações' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nova cotação/i })).toBeInTheDocument();
  });
});

describe('Quotation New Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders quotation creation form with AI upload', () => {
    renderWithProviders(<QuotationNew />, '/quotations/new');
    expect(screen.getByRole('heading', { name: /nova cotação/i })).toBeInTheDocument();
    expect(screen.getByText(/extração por ia/i)).toBeInTheDocument();
  });
});
