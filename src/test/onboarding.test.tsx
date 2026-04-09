import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

// Mock supabase
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'organizations') {
        return {
          insert: mockInsert.mockReturnValue({
            error: null,
          }),
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle.mockResolvedValue({
                data: { id: 'org-1', name: 'Test Agency', slug: 'test-agency' },
                error: null,
              }),
              single: mockSingle.mockResolvedValue({
                data: { id: 'org-1', name: 'Test Agency', slug: 'test-agency' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'Test', last_name: 'User' },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'user_roles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ role: 'org_admin' }],
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
    }),
    rpc: mockRpc.mockResolvedValue({ error: null }),
  },
}));

import Onboarding from '@/pages/Onboarding';

function renderOnboarding() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/onboarding']}>
          <Onboarding />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Onboarding Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up auth store with a user but no organization
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@test.com' } as any,
      profile: { id: 'p-1', user_id: 'user-1', org_id: null, first_name: 'Test', last_name: 'User', avatar_url: null, phone: null, created_at: '', updated_at: '' },
      organization: null,
      roles: ['agent'],
      isLoading: false,
    });
  });

  it('renders onboarding form with agency name and whatsapp fields', () => {
    renderOnboarding();
    expect(screen.getByText(/configure sua agência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da agência/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar agência/i })).toBeInTheDocument();
  });

  it('validates empty agency name', () => {
    renderOnboarding();
    const nameInput = screen.getByLabelText(/nome da agência/i);
    expect(nameInput).toBeRequired();
  });

  it('redirects to home if organization already exists', () => {
    useAuthStore.setState({
      organization: { id: 'org-1', name: 'Existing', slug: 'existing' } as any,
    });
    renderOnboarding();
    // Should not render the form since Navigate will redirect
    expect(screen.queryByText(/configure sua agência/i)).not.toBeInTheDocument();
  });
});
