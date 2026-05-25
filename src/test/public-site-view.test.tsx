import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import PublicSiteView from '@/pages/PublicSiteView';

const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

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
      primary_color: '#00D37B',
      whatsapp: '48999999999',
      brand_kit: { slogan: 'Sua melhor experiência de viagem.' },
      settings: { hours: 'Atendimento 24/7' },
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'organizations') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
        };
      }
      // Return null for builder_projects (meaning no custom site is configured yet)
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
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
          maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
        };
      }
      if (table === 'builder_projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        };
      }
      if (table === 'builder_versions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
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
          maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
        };
      }
      if (table === 'builder_projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        };
      }
      if (table === 'builder_versions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
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
          maybeSingle: vi.fn().mockResolvedValue({ data: mockOrg, error: null }),
        };
      }
      if (table === 'builder_projects') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
        };
      }
      if (table === 'builder_versions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockVersion, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    renderPublicSiteView('/site/agencia-filtro-segura');

    // Valid hero is rendered
    expect(await screen.findByText('Título Válido')).toBeInTheDocument();
    
    // Invalid/malicious blocks are safely skipped and do not appear or break the page
    expect(screen.queryByText('<script>alert(1)</script>')).not.toBeInTheDocument();
  });
});
