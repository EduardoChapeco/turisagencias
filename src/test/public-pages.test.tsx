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
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockImplementation((rpcName) => {
      if (rpcName === 'get_traveler_by_token') {
        return Promise.resolve({
          data: [{
            id: 'traveler-123',
            full_name: 'Fulano de Tal',
            email: 'fulano@example.com',
            phone: '48999999999',
            nationality: 'Brasileira',
            form_completed_at: null,
          }],
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
  });

  it('renders traveler form with required fields', async () => {
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/test-token');
    expect(await screen.findByText(/ficha do viajante/i)).toBeInTheDocument();
    expect(await screen.findByText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima etapa/i })).toBeInTheDocument();
  });

  it('has nationality field with default value', async () => {
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/test-token');
    expect(await screen.findByDisplayValue('Brasileira')).toBeInTheDocument();
  });

  it('shows error state when token is invalid', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Invalid token' } });
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/invalid-token');
    expect(await screen.findByText(/link inválido ou expirado/i)).toBeInTheDocument();
  });

  it('shows friendly already completed message with update option', async () => {
    mockRpc.mockImplementation((rpcName) => {
      if (rpcName === 'get_traveler_by_token') {
        return Promise.resolve({
          data: [{
            id: 'traveler-123',
            full_name: 'Fulano de Tal',
            email: 'fulano@example.com',
            phone: '48999999999',
            nationality: 'Brasileira',
            form_completed_at: '2026-05-24T18:00:00Z',
          }],
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/completed-token');
    expect(await screen.findByText(/ficha já preenchida!/i)).toBeInTheDocument();
    expect(screen.getByText(/fulano de tal/i)).toBeInTheDocument();
    
    // Clicking update button should reveal the form
    const updateButton = screen.getByRole('button', { name: /atualizar meus dados/i });
    updateButton.click();
    
    expect(await screen.findByText(/ficha do viajante/i)).toBeInTheDocument();
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
