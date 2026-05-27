import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/integrations/supabase/client', () => ({
 supabase: {
 auth: {
 getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
 onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
 },
 from: vi.fn().mockReturnValue({
 insert: vi.fn().mockReturnValue({ error: null }),
 update: vi.fn().mockReturnValue({
 eq: vi.fn().mockReturnValue({
 select: vi.fn().mockReturnValue({
 maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'p-1', user_id: 'user-1', org_id: 'org-1', first_name: 'Test', last_name: 'User' }, error: null }),
 }),
 }),
 }),
 select: vi.fn().mockReturnValue({
 eq: vi.fn().mockReturnValue({
 maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'org-1', name: 'Test' }, error: null }),
 single: vi.fn().mockResolvedValue({ data: { id: 'org-1', name: 'Test' }, error: null }),
 }),
 }),
 }),
 rpc: vi.fn().mockResolvedValue({ error: null }),
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
 useAuthStore.setState({
 user: { id: 'user-1', email: 'test@test.com' } as Record<string, any>,
 profile: { id: 'p-1', user_id: 'user-1', org_id: null, first_name: 'Test', last_name: 'User', avatar_url: null, phone: null, bio: null, email: null, is_active: true, last_seen_at: null, notification_prefs: {}, whatsapp: null, created_at: '', updated_at: '' } as Record<string, any>,
 organization: null,
 roles: ['agent'],
 isLoading: false,
 });
 });

 it('renders onboarding form', () => {
 renderOnboarding();
 expect(screen.getByText(/como devemos chamar/i)).toBeInTheDocument();
 expect(screen.getByLabelText(/nome da agência/i)).toBeInTheDocument();
 expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
 });

 it('redirects if organization exists', () => {
 useAuthStore.setState({ organization: { id: 'org-1', name: 'Existing', slug: 'existing' } as Record<string, any> });
 renderOnboarding();
 expect(screen.queryByText(/configure sua agência/i)).not.toBeInTheDocument();
 });
});
