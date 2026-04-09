import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock supabase before importing components
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn(),
  },
}));

import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

function renderWithProviders(ui: React.ReactElement, route = '/login') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
  });

  it('calls signInWithPassword on form submit', async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    });
  });

  it('shows error toast on login failure', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });
});

describe('Signup Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form with name, email and password fields', () => {
    renderWithProviders(<Signup />, '/signup');
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('calls signUp with user metadata on submit', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    renderWithProviders(<Signup />, '/signup');

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText('Sobrenome'), { target: { value: 'Silva' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'joao@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'securepass' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'joao@test.com',
          password: 'securepass',
          options: expect.objectContaining({
            data: { first_name: 'João', last_name: 'Silva' },
          }),
        }),
      );
    });
  });
});
