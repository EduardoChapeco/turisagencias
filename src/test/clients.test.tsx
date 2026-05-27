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
 ilike: vi.fn().mockResolvedValue({ data: [], error: null }),
 then: (cb: (v: unknown) => void) => cb({ data: [], error: null }),
 }),
 eq: vi.fn().mockReturnValue({
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 }),
 }),
 insert: vi.fn().mockReturnValue({
 select: vi.fn().mockReturnValue({
 single: vi.fn().mockResolvedValue({ data: { id: 'c-1' }, error: null }),
 }),
 }),
 delete: vi.fn().mockReturnValue({
 eq: vi.fn().mockResolvedValue({ error: null }),
 }),
 }),
 rpc: vi.fn(),
 channel: vi.fn().mockReturnValue({
 on: vi.fn().mockReturnThis(),
 subscribe: vi.fn(),
 }),
 removeChannel: vi.fn().mockResolvedValue(null),
 },
}));

import ClientsPage from '@/pages/Clients';

function renderWithProviders(ui: React.ReactElement, route = '/clients') {
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

describe('Clients Page', () => {
 beforeEach(() => vi.clearAllMocks());

 it('renders clients list page with title and new button', async () => {
 renderWithProviders(<ClientsPage />);
 expect(screen.getAllByText(/Base de Clientes/i).length).toBeGreaterThan(0);
 expect(screen.getByPlaceholderText(/buscar cliente/i)).toBeInTheDocument();
 expect(screen.getByRole('button', { name: /novo cliente/i })).toBeInTheDocument();
 });

 it('opens client creation in a SheetPage instead of a route page', () => {
 renderWithProviders(<ClientsPage />);
 fireEvent.click(screen.getByRole('button', { name: /novo cliente/i }));
 expect(screen.getByRole('dialog')).toHaveTextContent(/Ficha de Clientes/i);
 expect(screen.getByText(/Viajantes Adicionais/i)).toBeInTheDocument();
 });
});
