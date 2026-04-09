import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import { mockOrganization, mockProfile, mockQuotation, mockClient } from './mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'quotations') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockResolvedValue({ data: [mockQuotation], error: null }),
                then: (cb: (v: unknown) => void) => cb({ data: [mockQuotation], error: null }),
              }),
              ilike: vi.fn().mockResolvedValue({ data: [mockQuotation], error: null }),
              then: (cb: (v: unknown) => void) => cb({ data: [mockQuotation], error: null }),
            }),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockQuotation, error: null }),
              single: vi.fn().mockResolvedValue({ data: mockQuotation, error: null }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockQuotation, error: null }),
            }),
          }),
        };
      }
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockClient], error: null }),
            then: (cb: (v: unknown) => void) => cb({ data: [mockClient], error: null }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    }),
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
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

  it('renders quotations list with title and search', () => {
    renderWithProviders(<Quotations />);
    expect(screen.getByText('Cotações')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar por destino/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nova cotação/i })).toBeInTheDocument();
  });

  it('renders status filter', () => {
    renderWithProviders(<Quotations />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
  });
});

describe('Quotation New Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders quotation creation form', () => {
    renderWithProviders(<QuotationNew />, '/quotations/new');
    expect(screen.getByText(/nova cotação/i)).toBeInTheDocument();
    expect(screen.getByText(/extração por ia/i)).toBeInTheDocument();
    expect(screen.getByText(/destino/i)).toBeInTheDocument();
  });

  it('renders AI extraction upload area', () => {
    renderWithProviders(<QuotationNew />, '/quotations/new');
    expect(screen.getByText(/clique para enviar imagem ou pdf/i)).toBeInTheDocument();
  });

  it('has currency selection with BRL default', () => {
    renderWithProviders(<QuotationNew />, '/quotations/new');
    expect(screen.getByText('BRL (R$)')).toBeInTheDocument();
  });
});
