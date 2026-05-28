import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import PublicSiteView from '@/pages/PublicSiteView';

const mockFrom = vi.fn();
const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

vi.mock('@/integrations/supabase/client', () => {
  const createMockBuilder = () => {
    const builder: any = {
      select: vi.fn().mockImplementation(() => builder),
      insert: vi.fn().mockImplementation(() => builder),
      update: vi.fn().mockImplementation(() => builder),
      eq: vi.fn().mockImplementation(() => builder),
      order: vi.fn().mockImplementation(() => builder),
      limit: vi.fn().mockImplementation(() => builder),
      maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
      then: vi.fn().mockImplementation((onfulfilled) => {
        if (onfulfilled) onfulfilled({ data: null, error: null });
        return Promise.resolve({ data: null, error: null });
      }),
    };
    return builder;
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'b2c__profiles' || table === 'b2c_tracking_events') {
          return createMockBuilder();
        }
        return mockFrom(table);
      },
      rpc: (name: string, args: any) => mockRpc(name, args),
    },
  };
});

function renderPublicSiteView(route: string, path = '/site/:slug') {
 const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
 return render(
 <QueryClientProvider client={queryClient}>
 <TooltipProvider>
 <MemoryRouter initialEntries={[route]}>
 <Routes>
 <Route path={path} element={<PublicSiteView />} />
 <Route path="/site/:slug/bio" element={<PublicSiteView />} />
 <Route path="/site/:slug/blog" element={<PublicSiteView />} />
 </Routes>
 </MemoryRouter>
 </TooltipProvider>
 </QueryClientProvider>
 );
}

describe('PublicSiteView - Dynamic Renderer OM-001', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 });

 it('renders loading state initially', () => {
 mockFrom.mockReturnValue({
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: () => new Promise(() => {}), // Never resolves to keep loading state active
 });

 renderPublicSiteView('/site/minha-agencia');
 expect(screen.getByText(/carregando portal institucional.../i)).toBeInTheDocument();
 });

 it('renders Destination Not Found when organization does not exist', async () => {
 // Mock organization query returning null (not found)
 mockFrom.mockReturnValue({
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 });

 renderPublicSiteView('/site/agencia-inexistente');
 expect(await screen.findByText(/destino não encontrado/i)).toBeInTheDocument();
 expect(screen.getByText(/a agência que você está procurando não existe/i)).toBeInTheDocument();
 });

 it('renders default fallback template for website when no published version is found', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Fallback',
 slug: 'agencia-fallback',
 primary_color: '#2563EB',
 whatsapp: '48999999999',
 brand_kit: { slogan: 'Sua melhor experiência de viagem.' },
 settings: { hours: 'Atendimento 24/7' },
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 // Return null for builder_sites (meaning no custom site is configured yet)
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-fallback');

 // Should render fallback hero, features, and contact blocks from default template
 expect(await screen.findByText(/bem-vindo à Agência Fallback/i)).toBeInTheDocument();
 expect(screen.getByText(/sua melhor experiência de viagem/i)).toBeInTheDocument();
 expect(screen.getByText(/Emissão e Suporte 24h/i)).toBeInTheDocument();
 expect(screen.getAllByText(/Atendimento 24\/7/i).length).toBeGreaterThan(0);
 });

 it('renders dynamic website blocks successfully from database snapshot', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Dinâmica',
 slug: 'agencia-dinamica',
 primary_color: '#FF0055',
 };

 const mockProject = {
 id: 'proj-123',
 org_id: 'org-123',
 project_type: 'website',
 current_version_id: 'ver-999',
 };

 const mockVersion = {
 id: 'ver-999',
 project_id: 'proj-123',
 status: 'published',
 design_tokens: { primary_color: '#FF0055' },
 content_schema: [
 {
 id: 'custom-hero',
 kind: 'hero',
 title: 'Viaje com a Elite',
 subtitle: 'Os melhores destinos de luxo no mundo.',
 },
 {
 id: 'custom-features',
 kind: 'features',
 items: ['Guia Privativo Incluso', 'Helicóptero de Suporte', 'Acesso VIP Lounge'],
 },
 {
 id: 'custom-contact',
 kind: 'contact',
 email: 'elite@agencia.com',
 phone: '(11) 98888-7777',
 },
 ],
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 if (table === 'builder_sites') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
 };
 }
 if (table === 'builder_pages') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
 };
 }
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-dinamica');

 // Verify it renders dynamic database content
 expect(await screen.findByText('Viaje com a Elite')).toBeInTheDocument();
 expect(screen.getByText('Os melhores destinos de luxo no mundo.')).toBeInTheDocument();
 expect(screen.getByText('Guia Privativo Incluso')).toBeInTheDocument();
 expect(screen.getByText('Helicóptero de Suporte')).toBeInTheDocument();
 expect(screen.getByText('elite@agencia.com')).toBeInTheDocument();
 expect(screen.getByText('(11) 98888-7777')).toBeInTheDocument();
 });

 it('reverts to default fallback template if the latest version is not published (draft status check)', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Draft Check',
 slug: 'agencia-draft-check',
 };

 const mockProject = {
 id: 'proj-123',
 org_id: 'org-123',
 project_type: 'website',
 current_version_id: 'ver-draft',
 };

 const mockVersion = {
 id: 'ver-draft',
 project_id: 'proj-123',
 status: 'draft', // Critical: This is a draft version!
 content_schema: [
 {
 id: 'custom-hero',
 kind: 'hero',
 title: 'Esse título de rascunho NUNCA deve aparecer publicamente',
 subtitle: 'Rascunho não publicado',
 },
 ],
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 if (table === 'builder_sites') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
 };
 }
 if (table === 'builder_pages') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
 };
 }
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-draft-check');

 // Should NOT render draft content, must revert to default template
 expect(await screen.findByText('Bem-vindo à Agência Draft Check')).toBeInTheDocument();
 expect(screen.queryByText('Esse título de rascunho NUNCA deve aparecer publicamente')).not.toBeInTheDocument();
 });

 it('safely filters and ignores invalid or unknown block types without breaking render', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Filtro Segura',
 slug: 'agencia-filtro-segura',
 };

 const mockProject = {
 id: 'proj-123',
 org_id: 'org-123',
 project_type: 'website',
 current_version_id: 'ver-999',
 };

 const mockVersion = {
 id: 'ver-999',
 project_id: 'proj-123',
 status: 'published',
 content_schema: [
 {
 id: 'valid-hero',
 kind: 'hero',
 title: 'Título Válido',
 },
 {
 id: 'malicious-block',
 kind: 'unknown_kind_vulnerability', // Invalid type
 title: '<script>alert(1)</script>',
 },
 null as any, // Null element check
 ],
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 if (table === 'builder_sites') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
 };
 }
 if (table === 'builder_pages') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
 };
 }
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-filtro-segura');

 // Valid hero is rendered
 expect(await screen.findByText('Título Válido')).toBeInTheDocument();
 
 // Invalid/malicious blocks are safely skipped and do not appear or break the page
 expect(screen.queryByText('<script>alert(1)</script>')).not.toBeInTheDocument();
 });

 it('applies custom buttonStyle, ctaText and ctaUrl properties to hero block buttons', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Custom CTA',
 slug: 'agencia-custom-cta',
 primary_color: '#10B981',
 };

 const mockProject = {
 id: 'proj-123',
 org_id: 'org-123',
 project_type: 'website',
 current_version_id: 'ver-888',
 };

 const mockVersion = {
 id: 'ver-888',
 project_id: 'proj-123',
 status: 'published',
 content_schema: [
 {
 id: 'custom-hero-cta',
 kind: 'hero',
 title: 'Conheça o Caribe',
 subtitle: 'Os melhores destinos caribenhos.',
 buttonStyle: 'outline',
 ctaText: 'Falar com Consultor no WhatsApp',
 ctaUrl: 'https://wa.me/5548999999999',
 },
 ],
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 if (table === 'builder_sites') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
 };
 }
 if (table === 'builder_pages') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
 };
 }
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-custom-cta');

 // Wait for render
 expect(await screen.findByText('Conheça o Caribe')).toBeInTheDocument();
 
 // Check that button text is applied
 const button = screen.getByText('Falar com Consultor no WhatsApp');
 expect(button).toBeInTheDocument();
 
 // Check that the link wraps it correctly with the ctaUrl
 const link = button.closest('a');
 expect(link).toHaveAttribute('href', 'https://wa.me/5548999999999');
 });

 it('renders bento features, fullscreen video hero, and testimonials carousel layouts successfully', async () => {
 const mockOrg = {
 id: 'org-123',
 name: 'Agência Layouts',
 slug: 'agencia-layouts',
 primary_color: '#3B82F6',
 };

 const mockProject = {
 id: 'proj-123',
 org_id: 'org-123',
 project_type: 'website',
 current_version_id: 'ver-777',
 };

 const mockVersion = {
 id: 'ver-777',
 project_id: 'proj-123',
 status: 'published',
 content_schema: [
 {
 id: 'video-hero',
 kind: 'hero',
 title: 'Viaje em Vídeo',
 subtitle: 'Assista a esta beleza.',
 layoutVariant: 'fullscreen',
 videoUrl: 'https://test-server.com/clip.mp4',
 },
 {
 id: 'bento-features',
 kind: 'features',
 layoutVariant: 'bento',
 items: ['Item Bento 1', 'Item Bento 2'],
 },
 {
 id: 'carousel-testimonials',
 kind: 'testimonials',
 layoutVariant: 'carousel',
 testimonials: [
 { quote: 'Slide Depoimento 1', author: 'Autor 1' },
 { quote: 'Slide Depoimento 2', author: 'Autor 2' },
 ],
 },
 ],
 };

 mockFrom.mockImplementation((table: string) => {
 if (table === 'organizations') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
 };
 }
 if (table === 'builder_sites') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
 };
 }
 if (table === 'builder_pages') {
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
 };
 }
 return {
 select: vi.fn().mockReturnThis(),
 eq: vi.fn().mockReturnThis(),
 order: vi.fn().mockReturnThis(),
 maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
 };
 });

 renderPublicSiteView('/site/agencia-layouts');

 // Fullscreen video rendering validation
 expect(await screen.findByText('Viaje em Vídeo')).toBeInTheDocument();
 const video = document.querySelector('video');
 expect(video).toBeInTheDocument();
 expect(video).toHaveAttribute('src', 'https://test-server.com/clip.mp4');

 // Bento grid feature rendering validation
 expect(screen.getByText('Item Bento 1')).toBeInTheDocument();
 expect(screen.getByText('Item Bento 2')).toBeInTheDocument();

 // Testimonials slider rendering validation
 expect(screen.getByText('"Slide Depoimento 1"')).toBeInTheDocument();
 expect(screen.getByText('Autor 1')).toBeInTheDocument();
 expect(screen.getByText('1 / 2')).toBeInTheDocument();
 });
});
