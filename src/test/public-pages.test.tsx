import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

const mockRpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import PublicQuotation from '@/pages/PublicQuotation';
import PublicTravelerForm from '@/pages/PublicTravelerForm';

function renderWithRoute(ui: React.ReactElement, path: string, route: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Public Traveler Form', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders traveler form with required fields', () => {
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/test-token');
    expect(screen.getByText(/ficha do viajante/i)).toBeInTheDocument();
    expect(screen.getByText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima etapa/i })).toBeInTheDocument();
  });

  it('has nationality field with default value', () => {
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/test-token');
    expect(screen.getByDisplayValue('Brasileira')).toBeInTheDocument();
  });
});

describe('Public Quotation Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state initially', () => {
    mockRpc.mockReturnValue({ then: () => undefined });
    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/test-token');
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows not found for invalid token', async () => {
    mockRpc.mockReturnValue({
      then: (cb: (value: unknown) => void) => cb({ data: null, error: null }),
    });
    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/invalid-token');
    expect(await screen.findByText(/proposta indisponível/i)).toBeInTheDocument();
  });

  it('renders quotation data when found', async () => {
    mockRpc.mockReturnValue({
      then: (cb: (value: unknown) => void) => cb({
        data: {
          destination: 'Cancún',
          hotel_name: 'Grand Oasis',
          hotel_stars: 5,
          hotel_photo_url: null,
          check_in: '2026-06-01',
          check_out: '2026-06-08',
          num_nights: 7,
          meal_plan: 'all_inclusive',
          room_type: 'Superior',
          total_value: 15000,
          currency: 'BRL',
          installments: [],
          organizations: {
            name: 'Viagens Fantásticas',
            logo_url: null,
            whatsapp: '11999999999',
            primary_color: '#1E3A5F',
          },
          itinerary_days: [],
          flights: [],
          quote_transfers: [],
          quote_price_items: [],
          quote_includes: [],
          quote_experiences: [],
        },
        error: null,
      }),
    });

    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/valid-token');
    expect((await screen.findAllByText('Cancún')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/grand oasis/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /confirmar proposta/i }).length).toBeGreaterThan(0);
  });
});
