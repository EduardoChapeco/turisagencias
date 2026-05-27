import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Mail, Phone, MapPin, Globe, Compass, ArrowRight, ShieldCheck, Camera, Share2, Calendar } from 'lucide-react';
import { logger } from '@/utils/logger';
import { BlockRegistry } from '@/components/builder/core/registry';
import { registerAllBlocks } from '@/components/builder/blocks';
import { useBuilderStore } from '@/components/builder/core/useBuilderStore';
import { useB2CTracker } from '@/hooks/useB2CTracker';
import { PublicB2CChat } from '@/components/ai/PublicB2CChat';
import { GlobalAnalytics } from '@/components/analytics/GlobalAnalytics';

registerAllBlocks();

const sanitizeHref = (url: string | undefined): string => {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith('javascript:')) {
    logger.warn(`[SECURITY] Blocked javascript: XSS attempt in public render: ${url}`);
    return '#';
  }
  return url;
};

const getButtonProps = (style: string | undefined, primaryColor: string) => {
  if (style === 'outline') {
    return {
      className: 'border bg-transparent hover:bg-white/5 font-bold text-xs transition-all duration-300',
      style: { borderColor: primaryColor, color: primaryColor }
    };
  }
  if (style === 'glass') {
    return {
      className: 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all duration-300',
      style: {}
    };
  }
  // solid
  return {
    className: 'text-zinc-950 hover:opacity-90 font-bold text-xs transition-all duration-300',
    style: { backgroundColor: primaryColor }
  };
};

interface BuilderBlock {
  id: string;
  kind: 'hero' | 'features' | 'contact' | 'text' | 'testimonials' | 'faq' | 'pricing' | 'gallery' | 'packages';
  title?: string;
  subtitle?: string;
  items?: string[];
  email?: string;
  phone?: string;
  content?: string;
  testimonials?: { quote: string; author: string; role?: string }[];
  faqItems?: { question: string; answer: string }[];
  pricingItems?: { title: string; price: string; description?: string; features?: string[] }[];
  images?: string[];
  layoutVariant?: string;
  align?: 'left' | 'center' | 'right';
  paddingY?: 'compact' | 'normal' | 'cozy' | 'heroic';
  bgPattern?: 'flat' | 'gradient' | 'glass' | 'border';
  buttonStyle?: 'solid' | 'outline' | 'glass';
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export default function PublicSiteView() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [organization, setOrganization] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [designTokens, setDesignTokens] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<Record<string, number>>({});

  // Initialize Shadow Tracker
  useB2CTracker({ orgId: organization?.id, enabled: !!organization?.id && !loading });

  // Detect project type based on sub-route
  const projectType = location.pathname.endsWith('/bio') 
    ? 'linkbio' 
    : location.pathname.endsWith('/blog') 
    ? 'blog' 
    : 'website';

  const loadDefaultTemplate = (orgData: any) => {
    let initialBlocks: BuilderBlock[] = [];
    if (projectType === 'website') {
      initialBlocks = [
        {
          id: 'hero',
          kind: 'hero',
          title: `Bem-vindo à ${orgData.name}`,
          subtitle: (orgData.brand_kit as any)?.slogan || 'Sua agência de viagens com curadoria exclusiva e suporte personalizado.'
        },
        {
          id: 'features',
          kind: 'features',
          items: [
            'Emissão e Suporte 24h',
            `Foco em Viagens de ${(orgData.brand_kit as any)?.focus || 'Lazer'}`,
            orgData.settings?.hours || 'Atendimento Boutique'
          ]
        },
        {
          id: 'contact',
          kind: 'contact',
          email: orgData.email || 'contato@agencia.com',
          phone: orgData.whatsapp || orgData.phone || '(11) 99999-9999'
        }
      ];
    } else if (projectType === 'linkbio') {
      initialBlocks = [
        {
          id: 'hero',
          kind: 'hero',
          title: orgData.name,
          subtitle: (orgData.brand_kit as any)?.slogan || 'Conectando você às melhores viagens. Fale conosco abaixo!'
        },
        {
          id: 'contact',
          kind: 'contact',
          email: orgData.email || 'contato@agencia.com',
          phone: orgData.whatsapp || orgData.phone || '(11) 99999-9999'
        }
      ];
    } else if (projectType === 'blog') {
      initialBlocks = [
        {
          id: 'hero',
          kind: 'hero',
          title: `Blog de Viagens · ${orgData.name}`,
          subtitle: 'Dicas, guias e novidades para inspirar sua próxima aventura pelo mundo.'
        },
        {
          id: 'text',
          kind: 'text',
          content: 'Em breve, traremos artigos completos sobre roteiros boutique, tendências e consultoria de viagens exclusivas!'
        }
      ];
    }
    setBlocks(initialBlocks);
  };

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        // 1. Fetch organization by slug
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (orgError) throw orgError;
        if (!orgData) {
          setNotFound(true);
          return;
        }

        setOrganization(orgData);

        // Fetch public group trips for this organization
        const { data: tripsData, error: tripsError } = await supabase
          .from('group_trips')
          .select('*')
          .eq('org_id', orgData.id)
          .eq('is_public', true)
          .eq('status', 'published')
          .order('departure_date', { ascending: true });

        if (tripsError) {
          logger.error('Error fetching public group trips:', tripsError);
        } else {
          setTrips(tripsData || []);
        }

        // 2. Fetch new architecture first (VisualBuilder)
        // NOTE: builder_sites / builder_pages / builder_page_versions tables are real in DB
        // but not yet reflected in generated types.ts — cast to any until next type regen.
        const db = supabase as any;
        const { data: siteData } = await db
          .from('builder_sites')
          .select('id')
          .eq('org_id', orgData.id)
          .eq('type', projectType)
          .maybeSingle();

        if (siteData) {
          const { data: pageData } = await db
            .from('builder_pages')
            .select('*')
            .eq('site_id', siteData.id)
            .eq('slug', 'home')
            .maybeSingle();

          if (pageData && pageData.published_version_id) {
            const { data: versionData } = await db
              .from('builder_page_versions')
              .select('*')
              .eq('id', pageData.published_version_id)
              .maybeSingle();

            if (versionData && versionData.status === 'published') {
              const contentJson = typeof versionData.content_json === 'string'
                ? JSON.parse(versionData.content_json)
                : versionData.content_json;

              if (Array.isArray(contentJson) && contentJson.length > 0) {
                setBlocks(contentJson as any);
                if (versionData.seo_json && (versionData.seo_json as any).design_tokens) {
                  setDesignTokens((versionData.seo_json as any).design_tokens);
                }
                setLoading(false);
                return; // Early return to skip legacy fallback
              }
            }
          }
        }

        // 3. Fallback to legacy project type (Old Builder)
        const { data: projectData, error: projectError } = await supabase
          .from('builder_projects')
          .select('*')
          .eq('org_id', orgData.id)
          .eq('project_type', projectType)
          .maybeSingle();

        if (projectError) throw projectError;

        if (projectData) {
          // Fire-and-forget analytics — use any cast since rpc type list is auto-generated
          db.rpc('increment_project_view', { p_project_id: projectData.id })
            .then(() => { logger.info(`[ANALYTICS] Project view incremented: ${projectData.id}`); })
            .catch((err: unknown) => { logger.error('Error incrementing project view:', err); });
        }

        if (projectData && projectData.current_version_id) {
          // 4. Fetch legacy version snapshot
          const { data: versionData, error: versionError } = await supabase
            .from('builder_versions')
            .select('*')
            .eq('id', projectData.current_version_id)
            .maybeSingle();

          if (versionError) throw versionError;

          // Garantir que a versão recuperada está de fato publicada
          if (versionData && versionData.status === 'published') {
            if (Array.isArray(versionData.content_schema)) {
              setBlocks(versionData.content_schema as any);
            }
            if (versionData.design_tokens) {
              setDesignTokens(versionData.design_tokens);
            }
          } else {
            loadDefaultTemplate(orgData);
          }
        } else {
          loadDefaultTemplate(orgData);
        }
      } catch (err: any) {
        logger.error('Error fetching public site view data:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
  }, [slug, projectType]);

  // Force isPreview to true so EditableText works correctly in readonly mode
  useEffect(() => {
    useBuilderStore.getState().setIsPreview(true);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-vj-green mb-4" />
        <p className="text-sm text-zinc-500 font-semibold tracking-wider uppercase">Carregando portal institucional...</p>
      </div>
    );
  }

  if (notFound || !organization) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 items-center justify-center text-white px-6 font-sans text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vj-green/5 blur-[120px] rounded-full pointer-events-none" />
        <Compass className="w-16 h-16 text-zinc-700 mb-6 animate-pulse" />
        <h1 className="text-3xl font-black mb-2">Destino Não Encontrado</h1>
        <p className="text-zinc-400 text-sm max-w-md mb-8">
          A agência que você está procurando não existe ou ainda não configurou seu espaço na plataforma.
        </p>
        <Link to="/">
          <Button className="bg-vj-green text-zinc-950 hover:bg-green-600 font-bold rounded-xl h-11 px-6">
            Voltar para o Início
          </Button>
        </Link>
      </div>
    );
  }

  const primaryColor = designTokens.primary_color || organization.primary_color || '#2563EB';

  // Render for Link-Bio (Special super clean Mobile layout)
  if (projectType === 'linkbio') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center py-12 px-4 relative overflow-x-hidden">
        {/* Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] blur-[100px] rounded-full pointer-events-none opacity-20"
          style={{ backgroundColor: `${primaryColor}25` }}
        />

        <div className="w-full max-w-md space-y-8 relative z-10 text-center">
          {/* Brand Profile */}
          <div className="flex flex-col items-center space-y-4">
            {organization.logo_url ? (
              <img src={organization.logo_url} alt={organization.name} className="h-20 w-20 rounded-full object-cover border-2 border-zinc-800 p-1 bg-zinc-900" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-vj-green text-zinc-950 flex items-center justify-center font-black text-3xl">
                {organization.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-tight">{organization.name}</h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {(organization.brand_kit as any)?.slogan || 'Sua agência de viagens sob medida.'}
              </p>
            </div>
          </div>

          {/* Render Link-Bio Buttons */}
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="w-full">
                {block.kind === 'hero' && block.title && (
                  <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl text-xs text-zinc-400">
                    <p className="font-bold text-white mb-1">{block.title}</p>
                    <p>{block.subtitle}</p>
                  </div>
                )}

                {block.kind === 'contact' && (
                  <div className="space-y-3">
                    {block.phone && (
                      <a 
                        href={`https://wa.me/${block.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-14 bg-zinc-900 border border-zinc-800 hover:border-vj-green/60 rounded-2xl flex items-center justify-between px-6 font-bold text-sm transition-all group hover:scale-[1.01]"
                      >
                        <span className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-400" />
                          Falar no WhatsApp
                        </span>
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-vj-green transition-colors" />
                      </a>
                    )}
                    {block.email && (
                      <a 
                        href={`mailto:${block.email}`}
                        className="w-full h-14 bg-zinc-900 border border-zinc-800 hover:border-vj-green/60 rounded-2xl flex items-center justify-between px-6 font-bold text-sm transition-all group hover:scale-[1.01]"
                      >
                        <span className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-400" />
                          Enviar E-mail
                        </span>
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-vj-green transition-colors" />
                      </a>
                    )}
                  </div>
                )}

                {block.kind === 'text' && (
                  <div className="py-2 text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                    <p>{block.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Default Social Buttons if available */}
            {organization.instagram_url && (
              <a 
                href={`https://${organization.instagram_url.replace(/https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 bg-zinc-900 border border-zinc-800 hover:border-vj-green/60 rounded-2xl flex items-center justify-between px-6 font-bold text-sm transition-all group hover:scale-[1.01]"
              >
                <span className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-pink-500" />
                  Siga no Instagram
                </span>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-vj-green transition-colors" />
              </a>
            )}

            {organization.website_url && (
              <Link 
                to={`/site/${organization.slug}`}
                className="w-full h-14 bg-zinc-900 border border-zinc-800 hover:border-vj-green/60 rounded-2xl flex items-center justify-between px-6 font-bold text-sm transition-all group hover:scale-[1.01]"
              >
                <span className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Visitar Nosso Site Oficial
                </span>
                <ArrowRight size={14} className="text-zinc-500 group-hover:text-vj-green transition-colors" />
              </Link>
            )}
          </div>

          <footer className="pt-8 text-center text-[10px] text-zinc-600 flex flex-col items-center gap-2">
            <div className="flex gap-2 items-center justify-center">
              <Share2 size={12} style={{ color: primaryColor }} />
              <span>Link-Bio Homologado Turis Agências</span>
            </div>
            <p>© 2026 {organization.name}.</p>
          </footer>
        </div>
      </div>
    );
  }

  // Render for Website & Blog
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden relative">
      {/* Background glow effects */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none opacity-20"
        style={{ backgroundColor: `${primaryColor}20` }}
      />

      {/* Header */}
      <header className="h-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {organization.logo_url ? (
            <img src={organization.logo_url} alt={organization.name} className="max-h-12 max-w-[160px] object-contain rounded-lg" />
          ) : (
            <div className="h-10 w-10 bg-vj-green rounded-xl flex items-center justify-center font-black text-zinc-950 text-lg">
              {organization.name.charAt(0)}
            </div>
          )}
          <span className="font-black text-lg tracking-tight">{organization.name}</span>
          {projectType === 'blog' && (
            <span className="bg-zinc-800 text-[10px] font-bold text-zinc-400 px-2 py-0.5 rounded-lg border border-zinc-700">BLOG</span>
          )}
        </div>

        <div className="flex items-center gap-6 text-sm font-semibold text-zinc-400">
          {projectType === 'website' ? (
            <>
              <a href="#about" className="hover:text-white transition-colors">Sobre</a>
              <a href="#contact" className="hover:text-white transition-colors">Contato</a>
            </>
          ) : (
            <Link to={`/site/${organization.slug}`} className="hover:text-white transition-colors">Site Oficial</Link>
          )}
          <Link to={`/portal/${organization.slug}`}>
            <Button className="font-bold text-xs gap-2 rounded-xl h-9" style={{ backgroundColor: primaryColor, color: '#09090b' }}>
              Portal do Cliente <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Blocks Render */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-20 relative z-10">
        
        {blocks.map((block: any) => {
          // NEW ARCHITECTURE: Render block via BlockRegistry if it has a valid 'type'
          if (block.type && BlockRegistry.get(block.type)) {
            const blockDef = BlockRegistry.get(block.type);
            if (blockDef) {
              const RenderComponent = blockDef.renderComponent;
              return <RenderComponent key={block.id} node={block} />;
            }
          }

          // Fallback defensivo para blocos desconhecidos ou inválidos (Legacy)
          if (!block || !['hero', 'features', 'contact', 'text', 'testimonials', 'faq', 'pricing', 'gallery', 'packages'].includes(block.kind)) {
            logger.warn(`PublicSiteView: Bloco desconhecido ou nulo ignorado no renderizador público: ${block?.kind || 'undefined'}`);
            return null;
          }

          // Resolve style properties dynamically for OMEGA v6.5
          const alignClass = 
            block.align === 'left' ? 'text-left' :
            block.align === 'right' ? 'text-right' :
            'text-center';
            
          const paddingClass =
            block.paddingY === 'compact' ? 'py-4 px-4' :
            block.paddingY === 'cozy' ? 'py-16 px-6' :
            block.paddingY === 'heroic' ? 'py-24 px-8' :
            'py-10 px-4'; // normal
            
          const bgClass =
            block.bgPattern === 'gradient' ? 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800' :
            block.bgPattern === 'glass' ? 'bg-zinc-900/40 backdrop-blur-md border border-white/5' :
            block.bgPattern === 'border' ? 'bg-transparent border border-zinc-800' :
            'bg-zinc-900/20 border border-transparent'; // flat

          return (
            <section 
              key={block.id} 
              className={cn(
                "animate-in fade-in slide-in-from-bottom-6 duration-700 rounded-2xl border",
                paddingClass,
                bgClass,
                alignClass
              )}
            >
              {block.kind === 'hero' && (
                <>
                  {block.layoutVariant === 'split' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                      <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                          {block.title}
                        </h2>
                        <p className="text-sm md:text-base text-zinc-400">
                          {block.subtitle}
                        </p>
                        <a href={sanitizeHref(block.ctaUrl || '#contact')}>
                          <Button 
                            className={cn("rounded-xl h-10 px-6", getButtonProps(block.buttonStyle, primaryColor).className)} 
                            style={getButtonProps(block.buttonStyle, primaryColor).style}
                          >
                            {block.ctaText || 'Falar Conosco'}
                          </Button>
                        </a>
                      </div>
                      <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                        <img src={block.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60'} alt="Hero" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : block.layoutVariant === 'fullscreen' ? (
                    <div className="relative rounded-2xl overflow-hidden py-16 px-6 bg-cover bg-center text-center" style={{ backgroundImage: block.videoUrl ? 'none' : `url(${block.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80'})` }}>
                      {block.videoUrl && (
                        <video src={block.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
                      )}
                      <div className="absolute inset-0 bg-black/60 z-10" />
                      <div className="relative z-20 max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4">
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{block.title}</h2>
                        <p className="text-xs text-zinc-300">{block.subtitle}</p>
                        <a href={sanitizeHref(block.ctaUrl || '#contact')}>
                          <Button 
                            className={cn("rounded-xl h-9 px-5", getButtonProps(block.buttonStyle, primaryColor).className)} 
                            style={getButtonProps(block.buttonStyle, primaryColor).style}
                          >
                            {block.ctaText || 'Falar Conosco'}
                          </Button>
                        </a>
                      </div>
                    </div>
                  ) : block.layoutVariant === 'glass' ? (
                    <div className="max-w-xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl space-y-4">
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{block.title}</h2>
                      <p className="text-sm text-zinc-300">{block.subtitle}</p>
                      <a href={sanitizeHref(block.ctaUrl || '#contact')}>
                        <Button 
                          className={cn("rounded-xl h-10 px-6", getButtonProps(block.buttonStyle, primaryColor).className)} 
                          style={getButtonProps(block.buttonStyle, primaryColor).style}
                        >
                          {block.ctaText || 'Falar Conosco'}
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-none text-white">
                        {block.title}
                      </h2>
                      <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        {block.subtitle}
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-4">
                        <a href={sanitizeHref(block.ctaUrl || '#contact')}>
                          <Button 
                            className={cn("font-bold text-sm px-8 h-12 rounded-xl", getButtonProps(block.buttonStyle, primaryColor).className)}
                            style={getButtonProps(block.buttonStyle, primaryColor).style}
                          >
                            {block.ctaText || (projectType === 'blog' ? 'Acompanhar Blog' : 'Solicitar Roteiro')}
                          </Button>
                        </a>
                        <Link to={`/portal/${organization.slug}`}>
                          <Button variant="outline" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 rounded-xl h-12 px-6">
                            Acessar Minha Viagem
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {block.kind === 'features' && (
                <>
                  {block.layoutVariant === 'list' ? (
                    <div className="space-y-3 max-w-md mx-auto text-left">
                      {block.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                          <div className="h-5 w-5 bg-vj-green/20 rounded-full flex items-center justify-center text-vj-green shrink-0 font-bold">✓</div>
                          <p className="text-xs font-semibold text-zinc-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : block.layoutVariant === 'timeline' ? (
                    <div className="flex flex-col md:flex-row items-center gap-4 text-left">
                      {block.items?.map((item, i) => (
                        <div key={i} className="flex-1 p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl relative">
                          <span className="absolute -top-3 left-4 bg-zinc-850 text-vj-green text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-800">Passo {i+1}</span>
                          <p className="text-xs font-semibold text-zinc-300 mt-1">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : block.layoutVariant === 'bento' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {block.items?.map((item, i) => {
                        const colSpan = i === 0 ? "md:col-span-2" : i === 3 ? "md:col-span-2" : "md:col-span-1";
                        const presetImages = [
                          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
                          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60',
                          'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&auto=format&fit=crop&q=60'
                        ];
                        const bgImg = presetImages[i % presetImages.length];

                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "p-6 bg-zinc-950/40 border border-zinc-800 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-all duration-300 min-h-[160px] flex flex-col justify-end text-left",
                              colSpan
                            )}
                          >
                            <div className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-30" style={{ backgroundImage: `url(${bgImg})` }} />
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                            <div className="relative z-20 space-y-1">
                              <span className="text-[8px] font-mono text-vj-green uppercase tracking-widest font-black" style={{ color: primaryColor }}>Destaque {i+1}</span>
                              <h4 className="text-sm font-bold text-white leading-tight">{item}</h4>
                              <p className="text-[10px] text-zinc-400 font-medium">Curadoria premium com hotéis parceiros e passeios guiados exclusivos.</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {block.items?.map((item, idx) => (
                        <div key={idx} className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors text-center">
                          <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
                          <Compass className="w-8 h-8 mb-4 mx-auto" style={{ color: primaryColor }} />
                          <p className="text-sm font-bold text-white mb-2">{item}</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            Compromisso com excelência, segurança, pontualidade e experiências inesquecíveis.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {block.kind === 'contact' && (
                <>
                  {block.layoutVariant === 'footer' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 w-full font-mono border-t border-zinc-900 pt-4">
                      <span>© {organization?.name || 'Agência'} · Todos os direitos reservados.</span>
                      <div className="flex gap-4">
                        {block.email && <span>✉ <a href={sanitizeHref(`mailto:${block.email}`)} className="hover:underline">{block.email}</a></span>}
                        {block.phone && <span>☏ <a href={sanitizeHref(`https://wa.me/${block.phone.replace(/\D/g, '')}`)} target="_blank" rel="noopener noreferrer" className="hover:underline">{block.phone}</a></span>}
                      </div>
                    </div>
                  ) : (
                    <div id="contact" className="p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden text-left w-full">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Pronto para a sua próxima aventura?</h3>
                        <p className="text-xs text-zinc-500 max-w-md">
                          Fale diretamente com nossa equipe e desenhe sua viagem com quem entende do assunto.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 shrink-0 font-mono text-xs w-full md:w-auto">
                        {block.email && (
                          <a href={sanitizeHref(`mailto:${block.email}`)} className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl justify-center transition-colors">
                            <Mail size={16} style={{ color: primaryColor }} />
                            <span>{block.email}</span>
                          </a>
                        )}
                        {block.phone && (
                          <a href={sanitizeHref(`https://wa.me/${block.phone.replace(/\D/g, '')}`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl justify-center transition-colors">
                            <Phone size={16} className="text-green-400" />
                            <span>{block.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {block.kind === 'text' && (
                <>
                  {block.layoutVariant === 'twocol' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-zinc-300 text-xs md:text-sm">
                      <p className="whitespace-pre-line">{block.content}</p>
                      <p className="text-zinc-400 border-l border-zinc-800 pl-4 italic">Descubra novos destinos com suporte total de ponta a ponta feito por especialistas que amam o que fazem.</p>
                    </div>
                  ) : block.layoutVariant === 'blockquote' ? (
                    <div className="border-l-4 border-vj-green pl-6 py-2 text-left italic">
                      <p className="text-sm md:text-base text-zinc-200 max-w-xl font-serif">"{block.content}"</p>
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto text-zinc-300 text-sm md:text-base leading-relaxed">
                      <p className="whitespace-pre-line">{block.content}</p>
                    </div>
                  )}
                </>
              )}

              {block.kind === 'testimonials' && (
                <>
                  {block.layoutVariant === 'carousel' ? (
                    <div className="relative max-w-md mx-auto p-8 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl text-center space-y-6 min-h-[160px]">
                      {(() => {
                        const list = block.testimonials || [];
                        if (list.length === 0) return <p className="text-xs text-zinc-500 italic">Sem depoimentos cadastrados.</p>;
                        const currentIdx = activeTestimonialIdx[block.id] || 0;
                        const t = list[currentIdx % list.length];
                        return (
                          <>
                            <p className="text-sm text-zinc-300 italic">"{t.quote}"</p>
                            <div>
                              <p className="text-xs font-bold text-white">{t.author}</p>
                              {t.role && <p className="text-[10px] text-zinc-500">{t.role}</p>}
                            </div>
                            <div className="flex items-center justify-center gap-4 pt-2">
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTestimonialIdx(prev => ({
                                    ...prev,
                                    [block.id]: (currentIdx - 1 + list.length) % list.length
                                  }));
                                }}
                                className="text-[10px] text-zinc-400 hover:text-white font-bold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg"
                              >
                                ← Anterior
                              </button>
                              <span className="text-xs text-zinc-600 font-mono font-bold">{currentIdx + 1} / {list.length}</span>
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTestimonialIdx(prev => ({
                                    ...prev,
                                    [block.id]: (currentIdx + 1) % list.length
                                  }));
                                }}
                                className="text-[10px] text-zinc-400 hover:text-white font-bold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg"
                              >
                                Próximo →
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className={block.layoutVariant === 'list' ? 'space-y-4 max-w-xl mx-auto animate-in fade-in' : 'grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in'}>
                      {(block.testimonials || []).map((t, idx) => (
                        <div key={idx} className="p-6 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl space-y-4">
                          <p className="text-sm text-zinc-300 italic">"{t.quote}"</p>
                          <div>
                            <p className="text-xs font-bold text-white">{t.author}</p>
                            {t.role && <p className="text-[10px] text-zinc-500">{t.role}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {block.kind === 'faq' && (
                <div className="space-y-6 text-left">
                  <h3 className="text-lg font-bold text-white border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Compass size={18} style={{ color: primaryColor }} /> Perguntas Frequentes
                  </h3>
                  <div className={block.layoutVariant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                    {(block.faqItems || []).map((faq, idx) => (
                      <div key={idx} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                        <h4 className="text-sm font-bold text-white mb-2">Q: {faq.question}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.kind === 'pricing' && (
                <>
                  {block.layoutVariant === 'vip' ? (
                    <div className="max-w-sm mx-auto p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/25 rounded-2xl relative text-center">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/20">Destaque VIP</div>
                      {block.pricingItems?.[1] && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white">{block.pricingItems[1].title}</h4>
                          <p className="text-[10px] text-zinc-400">{block.pricingItems[1].description}</p>
                          <div className="text-2xl font-black text-amber-400">{block.pricingItems[1].price}</div>
                          {block.ctaUrl ? (
                            <a href={sanitizeHref(block.ctaUrl)}>
                              <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-9 rounded-xl">
                                {block.ctaText || 'Reservar Agora'}
                              </Button>
                            </a>
                          ) : (
                            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-9 rounded-xl">
                              {block.ctaText || 'Reservar Agora'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {(block.pricingItems || []).map((p, idx) => (
                        <div key={idx} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-colors">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-2">{p.title}</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-4">{p.description}</p>
                          </div>
                          <div className="pt-4 border-t border-zinc-850 flex justify-between items-baseline mt-4">
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">Valor Estimado</span>
                            <span className="text-lg font-black text-white" style={{ color: primaryColor }}>{p.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {block.kind === 'gallery' && (
                <div className={block.layoutVariant === 'masonry' ? 'columns-2 md:columns-3 gap-2 space-y-2' : 'grid grid-cols-1 sm:grid-cols-3 gap-4'}>
                  {(block.images || []).map((img, idx) => (
                    <div key={idx} className={cn("rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group", block.layoutVariant === 'masonry' && "break-inside-avoid mb-2")}>
                      <img 
                        src={img} 
                        alt="Galeria de Viagem" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60'; }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {block.kind === 'packages' && (
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Compass size={18} style={{ color: primaryColor }} /> Nossos Pacotes de Viagem
                    </h3>
                  </div>
                  {trips && trips.length > 0 ? (
                    <div className={block.layoutVariant === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
                      {trips.map((trip) => (
                        <Link 
                          key={trip.id} 
                          to={sanitizeHref(`/g/${trip.slug || trip.id}`)}
                          className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all group duration-300"
                        >
                          <div>
                            {trip.cover_image_url && (
                              <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-zinc-950 border border-zinc-800/80">
                                <img 
                                  src={trip.cover_image_url} 
                                  alt={trip.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <h4 className="text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-vj-green transition-colors">{trip.title}</h4>
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin size={12} /> {trip.destination || 'A definir'}
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-zinc-850 flex justify-between items-baseline mt-4">
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Calendar size={12} /> {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : 'A definir'}
                            </span>
                            <span className="text-base font-black text-vj-green">
                              {trip.currency || 'R$'} {(trip.price_per_pax || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl text-center text-sm text-zinc-500 italic">
                      Nenhum pacote de viagem ativo no momento.
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* About Agency details */}
        {projectType === 'website' && (
          <section id="about" className="py-12 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Sobre a Agência</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {(organization.brand_kit as any)?.bioCurta || 'Somos uma consultoria de viagens de alto padrão dedicada a transformar sonhos em roteiros estruturados de ponta a ponta.'}
              </p>
              <div className="space-y-2 pt-2 text-xs text-zinc-500">
                {organization.address?.street && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{organization.address.street}, {organization.address.city} - {organization.address.uf}</span>
                  </div>
                )}
                {organization.settings?.hours && (
                  <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <span>Atendimento: {organization.settings.hours}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-zinc-900/20 border border-zinc-900 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vj-green" />
                Operação Fiscal Regular
              </h4>
              <div className="space-y-1 text-[11px] text-zinc-500 font-mono">
                {organization.settings?.razaoSocial && (
                  <p><span className="text-zinc-600">Razão Social:</span> {organization.settings.razaoSocial}</p>
                )}
                {organization.settings?.cnpjCpf && (
                  <p><span className="text-zinc-600">Documento:</span> {organization.settings.cnpjCpf}</p>
                )}
                <p><span className="text-zinc-600">Plataforma Homologada:</span> Turis Agências SaaS v6.0</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-center text-xs text-zinc-600">
        <p>© 2026 {organization.name}. Desenvolvido com segurança técnica e integridade no Turis Agências.</p>
      </footer>
      
      {/* AI Public Agent Chat Widget */}
      {organization?.id && <PublicB2CChat orgId={organization.id} />}
      
      {/* Global Analytics Script Injection */}
      {organization?.settings?.tracking_pixels && (
        <GlobalAnalytics 
          facebookPixelId={organization.settings.tracking_pixels.facebook}
          googleAnalyticsId={organization.settings.tracking_pixels.google_analytics}
          gtmId={organization.settings.tracking_pixels.gtm}
        />
      )}
    </div>
  );
}
