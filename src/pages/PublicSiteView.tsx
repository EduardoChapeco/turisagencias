import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Phone, MapPin, Globe, Compass, ArrowRight, ShieldCheck, Camera, Share2 } from 'lucide-react';
import { logger } from '@/utils/logger';

interface BuilderBlock {
  id: string;
  kind: 'hero' | 'features' | 'contact' | 'text';
  title?: string;
  subtitle?: string;
  items?: string[];
  email?: string;
  phone?: string;
  content?: string;
}

export default function PublicSiteView() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [organization, setOrganization] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [designTokens, setDesignTokens] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

        // 2. Fetch project matching type
        const { data: projectData, error: projectError } = await supabase
          .from('builder_projects')
          .select('*')
          .eq('org_id', orgData.id)
          .eq('project_type', projectType)
          .maybeSingle();

        if (projectError) throw projectError;

        if (projectData && projectData.current_version_id) {
          // 3. Fetch version snapshot
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

  const primaryColor = designTokens.primary_color || organization.primary_color || '#00D37B';

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
        
        {blocks.map((block) => {
          // Fallback defensivo para blocos desconhecidos ou inválidos
          if (!block || !['hero', 'features', 'contact', 'text'].includes(block.kind)) {
            logger.warn(`PublicSiteView: Bloco desconhecido ou nulo ignorado no renderizador público: ${block?.kind || 'undefined'}`);
            return null;
          }

          return (
            <section key={block.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {block.kind === 'hero' && (
                <div className="text-center py-16 space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-none text-white">
                    {block.title}
                  </h1>
                  <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    {block.subtitle}
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <a href="#contact">
                      <Button 
                        className="font-bold text-sm px-8 h-12 rounded-xl"
                        style={{ backgroundColor: primaryColor, color: '#09090b' }}
                      >
                        {projectType === 'blog' ? 'Acompanhar Blog' : 'Solicitar Roteiro'}
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

              {block.kind === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {block.items?.map((item, idx) => (
                    <div key={idx} className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
                      <div className="absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
                      <Compass className="w-8 h-8 mb-4" style={{ color: primaryColor }} />
                      <p className="text-sm font-bold text-white mb-2">{item}</p>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Compromisso com excelência, segurança, pontualidade e experiências inesquecíveis.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {block.kind === 'contact' && (
                <div id="contact" className="p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white">Pronto para a sua próxima aventura?</h3>
                    <p className="text-xs text-zinc-500 max-w-md">
                      Fale diretamente com nossa equipe e desenhe sua viagem com quem entende do assunto.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 shrink-0 font-mono text-xs w-full md:w-auto">
                    {block.email && (
                      <a href={`mailto:${block.email}`} className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl justify-center transition-colors">
                        <Mail size={16} style={{ color: primaryColor }} />
                        <span>{block.email}</span>
                      </a>
                    )}
                    {block.phone && (
                      <a href={`https://wa.me/${block.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl justify-center transition-colors">
                        <Phone size={16} className="text-green-400" />
                        <span>{block.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {block.kind === 'text' && (
                <div className="py-8 text-zinc-300 text-sm md:text-base leading-relaxed text-center max-w-3xl mx-auto border-t border-zinc-900">
                  <p className="whitespace-pre-line">{block.content}</p>
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
    </div>
  );
}
