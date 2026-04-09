import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock supabase
const mockRpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

import PublicTravelerForm from '@/pages/PublicTravelerForm';
import PublicQuotation from '@/pages/PublicQuotation';

function renderWithRoute(ui: React.ReactElement, path: string, route: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
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
    expect(screen.getByRole('button', { name: /enviar dados/i })).toBeInTheDocument();
  });

  it('has nationality field with default value', () => {
    renderWithRoute(<PublicTravelerForm />, '/f/:token', '/f/test-token');
    const nationalityInput = screen.getByDisplayValue('Brasileira');
    expect(nationalityInput).toBeInTheDocument();
  });
});

describe('Public Quotation Page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state initially', () => {
    mockRpc.mockReturnValue({
      then: () => {},
    });
    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/test-token');
    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows not found for invalid token', async () => {
    mockRpc.mockReturnValue({
      then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
    });
    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/invalid-token');

    // Wait for the component to process the response
    await screen.findByText(/cotação não encontrada/i);
    expect(screen.getByText(/cotação não encontrada/i)).toBeInTheDocument();
  });

  it('renders quotation data when found', async () => {
    const quotationData = {
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
      org_name: 'Viagens Fantásticas',
      org_logo: null,
      org_whatsapp: '11999999999',
      org_primary_color: '#1E3A5F',
    };

    mockRpc.mockReturnValue({
      then: (cb: (v: unknown) => void) => cb({ data: [quotationData], error: null }),
    });

    renderWithRoute(<PublicQuotation />, '/q/:token', '/q/valid-token');

    await screen.findByText('Cancún');
    expect(screen.getByText('Cancún')).toBeInTheDocument();
    expect(screen.getByText(/grand oasis/i)).toBeInTheDocument();
    expect(screen.getByText(/viagens fantásticas/i)).toBeInTheDocument();
    expect(screen.getByText(/quero reservar/i)).toBeInTheDocument();
  });
});
