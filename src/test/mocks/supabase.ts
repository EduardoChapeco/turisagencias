import { vi } from 'vitest';

// Mock data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { first_name: 'João', last_name: 'Silva' },
  created_at: '2026-01-01T00:00:00Z',
};

export const mockProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  org_id: 'org-1',
  first_name: 'João',
  last_name: 'Silva',
  avatar_url: null,
  phone: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockOrganization = {
  id: 'org-1',
  name: 'Viagens Fantásticas',
  slug: 'viagens-fantasticas',
  logo_url: null,
  primary_color: '#1E3A5F',
  whatsapp: '11999999999',
  plan: 'free',
  settings: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockClient = {
  id: 'client-1',
  org_id: 'org-1',
  created_by: 'user-1',
  name: 'Maria Santos',
  email: 'maria@test.com',
  phone: '11988888888',
  cpf: '12345678900',
  birth_date: '1990-01-15',
  address: 'Rua A',
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01000-000',
  country: 'Brasil',
  origin: 'Instagram',
  tags: ['VIP'],
  notes: 'Cliente fiel',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockTraveler = {
  id: 'traveler-1',
  org_id: 'org-1',
  client_id: 'client-1',
  full_name: 'Maria Santos',
  cpf: '12345678900',
  birth_date: '1990-01-15',
  gender: 'feminino',
  nationality: 'Brasileira',
  email: 'maria@test.com',
  phone: '11988888888',
  relation: null,
  form_token: 'token-abc-123',
  form_completed_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const mockQuotation = {
  id: 'quot-1',
  org_id: 'org-1',
  client_id: 'client-1',
  agent_id: 'user-1',
  destination: 'Cancún, México',
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
  installments: [
    { type: 'pix', value: 15000, installment_count: 1 },
    { type: 'credit_12x', value: 1250, installment_count: 12 },
  ],
  status: 'draft',
  whatsapp_text: 'Olá! Cotação para Cancún...',
  share_token: 'share-token-123',
  viewed_at: null,
  source_file_url: null,
  ai_extracted: false,
  ai_raw_response: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  clients: { name: 'Maria Santos', phone: '11988888888', email: 'maria@test.com' },
};

// Helper to build chainable query mock
export function createQueryMock(returnData: unknown = null, returnError: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'ilike', 'neq', 'order', 'limit', 'range', 'in', 'is'];

  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue({ data: returnData, error: returnError });
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: returnData, error: returnError });
  chain.then = vi.fn().mockImplementation((cb) => cb({ data: Array.isArray(returnData) ? returnData : returnData ? [returnData] : [], error: returnError }));

  // Make it thenable for await without .single()/.maybeSingle()
  const proxy = new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve({ data: Array.isArray(returnData) ? returnData : returnData ? [returnData] : [], error: returnError });
      }
      return target[prop as string] ?? vi.fn().mockReturnValue(proxy);
    },
  });

  return proxy;
}

export function createSupabaseMock() {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(),
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.jpg' } }),
      }),
    },
  };
}
