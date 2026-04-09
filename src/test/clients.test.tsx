import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';
import { mockOrganization, mockProfile, mockClient } from './mocks/supabase';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              ilike: vi.fn().mockResolvedValue({ data: [mockClient], error: null }),
              then: (cb: (v: unknown) => void) => cb({ data: [mockClient], error: null }),
            }),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
              single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockClient, error: null }),
              }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'travelers') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      };
    }),
    rpc: vi.fn(),
  },
}));

import ClientsPage from '@/pages/Clients';
import ClientNew from '@/pages/ClientNew';

function renderWithProviders(ui: React.ReactElement, route = '/clients') {
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

describe('Clients Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders clients list page with title and search', async () => {
    renderWithProviders(<ClientsPage />);
    expect(screen.getByText(/clientes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar clientes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novo cliente/i })).toBeInTheDocument();
  });
});

describe('Client New Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders client creation form with required fields', () => {
    renderWithProviders(<ClientNew />, '/clients/new');
    expect(screen.getByText(/novo cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByText(/cpf/i)).toBeInTheDocument();
  });

  it('has address section', () => {
    renderWithProviders(<ClientNew />, '/clients/new');
    expect(screen.getByText(/endereço/i)).toBeInTheDocument();
    expect(screen.getByText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByText(/estado/i)).toBeInTheDocument();
    expect(screen.getByText(/cep/i)).toBeInTheDocument();
  });
});
