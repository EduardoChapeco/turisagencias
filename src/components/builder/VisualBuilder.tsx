import { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Eye, Save, Settings, Layers, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface VisualBuilderProps {
  onBack?: () => void;
  projectName?: string;
  initialProjectType?: 'website' | 'linkbio' | 'blog';
}

interface BuilderBlock {
  id: string;
  kind: 'hero' | 'features' | 'contact' | 'text' | 'testimonials' | 'faq' | 'pricing' | 'gallery';
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
}

export default function VisualBuilder({ onBack, projectName = 'Website Principal', initialProjectType }: VisualBuilderProps) {
  const { organization, user } = useAuthStore();
  const { toast } = useToast();
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'edit'>('blocks');

  // Multiproject support: website | linkbio | blog
  const [projectType, setProjectType] = useState<'website' | 'linkbio' | 'blog'>(initialProjectType || 'website');

  useEffect(() => {
    if (initialProjectType) {
      setProjectType(initialProjectType);
    }
  }, [initialProjectType]);

  // Supabase state
  const [projectId, setProjectId] = useState<string | null>(null);
  const [versionNumber, setVersionNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // SEO/Frame values
  const [slug, setSlug] = useState('home');
  const [metaTitle, setMetaTitle] = useState('Minha Agência - Home');
  const [metaDescription, setMetaDescription] = useState('Roteiros personalizados e exclusivos.');

  // Blocks source of truth
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);

  // Editing state
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Dirty state & Draft control
  const [isDirty, setIsDirty] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Fetch initial project and version from Supabase whenever active project type changes
  useEffect(() => {
    const loadProject = async () => {
      if (!organization?.id) return;
      try {
        setLoading(true);
        setSelectedBlockId(null); // Clear selected block
        
        // 1. Fetch project corresponding to selected type
        const { data: projectData, error: projectError } = await supabase
          .from('builder_projects')
          .select('*')
          .eq('org_id', organization.id)
          .eq('project_type', projectType)
          .maybeSingle();

        if (projectError) throw projectError;

        if (projectData) {
          setProjectId(projectData.id);
          
          // 2. Fetch latest version snapshot
          const { data: versionData, error: versionError } = await supabase
            .from('builder_versions')
            .select('*')
            .eq('project_id', projectData.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (versionError) throw versionError;

          if (versionData) {
            setVersionNumber(versionData.version_number);
            if (Array.isArray(versionData.content_schema)) {
              setBlocks(versionData.content_schema as any);
            } else {
              setBlocks([]);
            }
            if (versionData.frame_schema && typeof versionData.frame_schema === 'object') {
              const frame = versionData.frame_schema as any;
              setSlug(frame.slug || (projectType === 'website' ? 'home' : projectType));
              setMetaTitle(frame.metaTitle || `${organization.name} - ${projectType}`);
              setMetaDescription(frame.metaDescription || `Página de ${projectType} da agência.`);
            }
          }
        } else {
          // Defaults if no project exists in the DB for this project_type
          setProjectId(null);
          setVersionNumber(1);
          setSlug(projectType === 'website' ? 'home' : projectType);
          setMetaTitle(`${organization.name} - ${projectType === 'website' ? 'Home' : projectType === 'linkbio' ? 'Link Bio' : 'Blog'}`);
          setMetaDescription(`Página de ${projectType} da agência ${organization.name}.`);

          if (projectType === 'website') {
            setViewport('desktop');
            setBlocks([
              { 
                id: 'hero', 
                kind: 'hero', 
                title: `Bem-vindo à ${organization.name}`, 
                subtitle: (organization.brand_kit as any)?.slogan || 'Roteiros de viagem personalizados com suporte boutique.' 
              },
              { 
                id: 'features', 
                kind: 'features', 
                items: ['Suporte Especializado 24h', 'Upgrade de Categoria Grátis', 'Curadoria de Luxo'] 
              },
              { 
                id: 'contact', 
                kind: 'contact', 
                email: organization.email || 'contato@agencia.com', 
                phone: organization.whatsapp || organization.phone || '(11) 99999-9999' 
              }
            ]);
          } else if (projectType === 'linkbio') {
            setViewport('mobile'); // Lock mobile for Link-Bio
            setBlocks([
              {
                id: 'hero',
                kind: 'hero',
                title: organization.name,
                subtitle: (organization.brand_kit as any)?.slogan || 'Conectando você ao seu próximo destino. Acesse nossos canais abaixo!'
              },
              {
                id: 'contact',
                kind: 'contact',
                email: organization.email || 'contato@agencia.com',
                phone: organization.whatsapp || organization.phone || '(11) 99999-9999'
              }
            ]);
          } else if (projectType === 'blog') {
            setViewport('desktop');
            setBlocks([
              {
                id: 'hero',
                kind: 'hero',
                title: `Blog de Viagens · ${organization.name}`,
                subtitle: 'Explore o mundo com dicas, tendências de turismo e guias exclusivos escritos por especialistas.'
              },
              {
                id: 'text',
                kind: 'text',
                content: 'Em breve, publicaremos aqui artigos incríveis sobre ecoturismo, resorts boutique, roteiros exóticos na Ásia e muito mais!'
              }
            ]);
          }
        }

        // 3. Verificar rascunho no localStorage
        if (user?.id) {
          const key = `turisagencias:builder:draft:${user.id}:${projectType}`;
          const rawDraft = localStorage.getItem(key);
          if (rawDraft) {
            try {
              const parsed = JSON.parse(rawDraft);
              if (parsed && (Array.isArray(parsed.blocks) && parsed.blocks.length > 0)) {
                setHasDraft(true);
              } else {
                setHasDraft(false);
              }
            } catch (e) {
              logger.error('Error parsing draft:', e);
              setHasDraft(false);
            }
          } else {
            setHasDraft(false);
          }
        }
        setIsDirty(false); // Reset dirty ao carregar com sucesso do banco
      } catch (err: any) {
        logger.error('Error loading site builder project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [organization?.id, projectType]);

  const draftKey = user?.id ? `turisagencias:builder:draft:${user.id}:${projectType}` : null;

  // Autosave Draft in LocalStorage (Debounced 1s)
  useEffect(() => {
    if (!isDirty || !draftKey) return;

    const saveDraft = () => {
      const draftData = {
        projectId,
        projectType,
        updatedAt: Date.now(),
        blocks,
        slug,
        metaTitle,
        metaDescription,
        isDirty: true
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      logger.debug(`[DRAFT_SAVE] Auto-saved draft for ${projectType}`);
    };

    const timeoutId = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timeoutId);
  }, [blocks, slug, metaTitle, metaDescription, isDirty, draftKey, projectId, projectType]);

  // Protect unsaved changes on window unload
  useUnsavedChangesGuard(isDirty, 'Você possui alterações não salvas no editor. Tem certeza que deseja sair?');

  const handleRestoreDraft = () => {
    if (!draftKey) return;
    const rawDraft = localStorage.getItem(draftKey);
    if (!rawDraft) return;

    try {
      const parsed = JSON.parse(rawDraft);
      if (parsed) {
        if (Array.isArray(parsed.blocks)) {
          setBlocks(parsed.blocks);
        }
        if (parsed.slug) setSlug(parsed.slug);
        if (parsed.metaTitle) setMetaTitle(parsed.metaTitle);
        if (parsed.metaDescription) setMetaDescription(parsed.metaDescription);
        
        setIsDirty(true);
        setHasDraft(false);
        toast({
          title: 'Rascunho restaurado!',
          description: 'Suas alterações não salvas foram recuperadas com sucesso.',
        });
      }
    } catch (e) {
      logger.error('Error restoring draft:', e);
      toast({
        title: 'Erro ao restaurar',
        description: 'Não foi possível recuperar o rascunho.',
        variant: 'destructive'
      });
    }
  };

  const handleDiscardDraft = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
    setHasDraft(false);
    setIsDirty(false);
    toast({
      title: 'Rascunho descartado',
      description: 'As alterações locais pendentes foram excluídas.',
    });
  };

  // Publish / Save Mutation
  const handlePublish = async () => {
    if (!organization?.id || !user?.id) return;
    try {
      setSaving(true);
      let currentProjId = projectId;

      // 1. Ensure project exists in builder_projects
      if (!currentProjId) {
        const newProjId = crypto.randomUUID();
        const { error: projErr } = await supabase.from('builder_projects').insert({
          id: newProjId,
          org_id: organization.id,
          site_id: null,
          project_type: projectType,
          title: projectType === 'website' ? projectName : projectType === 'linkbio' ? 'Link Bio' : 'Blog Oficial'
        });
        if (projErr) throw projErr;
        currentProjId = newProjId;
        setProjectId(newProjId);
      }

      // 2. Insert new version snapshot
      const nextVer = versionNumber + 1;
      const versionId = crypto.randomUUID();
      const { error: verErr } = await supabase.from('builder_versions').insert({
        id: versionId,
        project_id: currentProjId,
        version_number: nextVer,
        frame_schema: { slug, metaTitle, metaDescription },
        content_schema: blocks as any,
        design_tokens: { primary_color: organization.primary_color || '#2563EB', secondary_color: organization.secondary_color || '#18181B' },
        render_snapshot: blocks as any,
        status: 'published',
        created_by: user.id
      });

      if (verErr) throw verErr;

      // 3. Update current_version_id in project
      const { error: updateErr } = await supabase
        .from('builder_projects')
        .update({ current_version_id: versionId })
        .eq('id', currentProjId);

      if (updateErr) throw updateErr;

      setVersionNumber(nextVer);
      
      const linkPath = projectType === 'website' 
        ? `/site/${organization.slug}` 
        : projectType === 'linkbio' 
        ? `/site/${organization.slug}/bio` 
        : `/site/${organization.slug}/blog`;

      // Limpar rascunho local após publicação com sucesso
      if (user?.id) {
        const key = `turisagencias:builder:draft:${user.id}:${projectType}`;
        localStorage.removeItem(key);
      }
      setIsDirty(false);
      setHasDraft(false);

      toast({
        title: 'Canal Publicado com Sucesso!',
        description: `Seu canal de ${projectType} está ativo de verdade no link: ${linkPath}`,
      });
    } catch (err: any) {
      logger.error('Error publishing site version:', err);
      toast({
        title: 'Erro ao publicar',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBlock = (updatedBlock: BuilderBlock) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    setIsDirty(true);
  };

  const handleAddBlock = (kind: 'hero' | 'features' | 'contact' | 'text' | 'testimonials' | 'faq' | 'pricing' | 'gallery') => {
    const id = `${kind}-${Date.now()}`;
    let newBlock: BuilderBlock = { id, kind };
    if (kind === 'hero') {
      newBlock = { id, kind, title: 'Nova Seção Hero', subtitle: 'Clique aqui para editar este texto.' };
    } else if (kind === 'features') {
      newBlock = { id, kind, items: ['Recurso Extra 1', 'Recurso Extra 2', 'Recurso Extra 3'] };
    } else if (kind === 'contact') {
      newBlock = { id, kind, email: organization?.email || 'contato@agencia.com', phone: organization?.whatsapp || '(11) 99999-9999' };
    } else if (kind === 'text') {
      newBlock = { id, kind, content: 'Insira aqui um parágrafo personalizado sobre a agência ou destinos recomendados.' };
    } else if (kind === 'testimonials') {
      newBlock = {
        id,
        kind,
        testimonials: [
          { quote: 'Viagem sensacional! O suporte da agência durante a estadia foi impecável.', author: 'Mariana Costa', role: 'Cliente Jalapão 2025' },
          { quote: 'Melhor consultoria que já contratei. Roteiro personalizado e hotéis de altíssimo nível.', author: 'Rodrigo Mello', role: 'Cliente Europa Premium' }
        ]
      };
    } else if (kind === 'faq') {
      newBlock = {
        id,
        kind,
        faqItems: [
          { question: 'Quais as formas de pagamento disponíveis?', answer: 'Trabalhamos com boleto parcelado sem juros, PIX com desconto ou cartão de crédito em até 10x.' },
          { question: 'A viagem possui seguro incluso?', answer: 'Sim, todas as nossas viagens contratadas acompanham seguro viagem internacional ou nacional completo.' }
        ]
      };
    } else if (kind === 'pricing') {
      newBlock = {
        id,
        kind,
        pricingItems: [
          { title: 'Roteiro Essencial', price: 'R$ 2.400', description: 'Pacote com hospedagem, transfer e 3 passeios principais.', features: ['Hospedagem 3 estrelas', 'Transfer aeroporto', 'Suporte digital'] },
          { title: 'Experiência Premium', price: 'R$ 4.900', description: 'Curadoria completa com resorts de luxo, guias privativos e gastronomia inclusa.', features: ['Hospedagem 5 estrelas', 'Transfer privativo', 'Acompanhamento de guia', 'Seguro viagem VIP'] }
        ]
      };
    } else if (kind === 'gallery') {
      newBlock = {
        id,
        kind,
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60'
        ]
      };
    }

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(id);
    setActiveTab('edit');
    setIsDirty(true);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    setIsDirty(true);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      {/* Top control bar */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="text-zinc-400 hover:text-white rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">{projectName}</h1>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as any)}
                className="bg-zinc-800 border border-zinc-700 text-white rounded-lg text-[10px] px-2 py-0.5 font-bold focus:border-vj-green focus:ring-0 cursor-pointer"
              >
                <option value="website">💻 Site Principal</option>
                <option value="linkbio">📱 Link Bio (Mobile)</option>
                <option value="blog">✍️ Blog / CMS</option>
              </select>
            </div>
            <p className="text-[10px] text-zinc-500">Versão v1.0.{versionNumber} (Snapshot JSON)</p>
          </div>
        </div>

        {/* Viewport controls */}
        {projectType !== 'linkbio' ? (
          <div className="flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewport === 'desktop' ? "bg-vj-green text-zinc-950" : "text-zinc-400 hover:text-white"
              )}
              title="Desktop Viewport"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewport === 'tablet' ? "bg-vj-green text-zinc-950" : "text-zinc-400 hover:text-white"
              )}
              title="Tablet Viewport"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewport === 'mobile' ? "bg-vj-green text-zinc-950" : "text-zinc-400 hover:text-white"
              )}
              title="Mobile Viewport"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-[10px] bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl font-bold text-zinc-400">
            Viewport Mobile Travada para Link-Bio
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl gap-2 h-9 text-xs"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? 'Editar' : 'Visualizar'}
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={saving || loading}
            className="bg-vj-green text-zinc-950 hover:bg-green-600 font-bold rounded-xl gap-2 h-9 text-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publicar
          </Button>
        </div>
      </header>

      {/* Main Builder layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidepanel - Property Manager */}
        {!isPreview && (
          <aside className="w-[300px] border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex flex-col shrink-0">
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setActiveTab('blocks')}
                className={cn(
                  "flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-2",
                  activeTab === 'blocks' ? "border-vj-green text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Blocos
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={cn(
                  "flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-2",
                  activeTab === 'edit' ? "border-vj-green text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Editar Bloco
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "flex-1 py-3 text-xs font-semibold border-b-2 transition-all flex items-center justify-center gap-2",
                  activeTab === 'settings' ? "border-vj-green text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeTab === 'blocks' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Adicionar Seções</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Hero Banner', kind: 'hero' },
                      { label: 'Recursos', kind: 'features' },
                      { label: 'Contato', kind: 'contact' },
                      { label: 'Texto Simples', kind: 'text' },
                      { label: 'Depoimentos', kind: 'testimonials' },
                      { label: 'Perguntas Freq.', kind: 'faq' },
                      { label: 'Catálogo/Preços', kind: 'pricing' },
                      { label: 'Galeria Fotos', kind: 'gallery' }
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleAddBlock(btn.kind as any)}
                        className="p-3 bg-zinc-950 border border-zinc-800 hover:border-vj-green rounded-xl text-[10px] font-semibold text-zinc-300 text-left transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3 text-vj-green" />
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-zinc-800">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Seções Ativas</h4>
                    <div className="space-y-2">
                      {blocks.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs">
                          <span onClick={() => { setSelectedBlockId(b.id); setActiveTab('edit'); }} className="cursor-pointer hover:text-vj-green transition-colors font-medium capitalize">
                            {b.kind} ({b.id.slice(0, 4)})
                          </span>
                          <button onClick={() => handleDeleteBlock(b.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'edit' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Editor do Bloco</h3>
                  {selectedBlock ? (
                    <div className="space-y-4">
                      {selectedBlock.kind === 'hero' && (
                        <>
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-semibold">Título Principal</label>
                            <input
                              type="text"
                              value={selectedBlock.title || ''}
                              onChange={(e) => handleUpdateBlock({ ...selectedBlock, title: e.target.value })}
                              className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-semibold">Subtítulo</label>
                            <textarea
                              value={selectedBlock.subtitle || ''}
                              onChange={(e) => handleUpdateBlock({ ...selectedBlock, subtitle: e.target.value })}
                              className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white h-20"
                            />
                          </div>
                        </>
                      )}

                      {selectedBlock.kind === 'features' && (
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Itens do Recurso</label>
                          <div className="space-y-2 mt-1">
                            {selectedBlock.items?.map((item, idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const nextItems = [...(selectedBlock.items || [])];
                                  nextItems[idx] = e.target.value;
                                  handleUpdateBlock({ ...selectedBlock, items: nextItems });
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedBlock.kind === 'contact' && (
                        <>
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-semibold">E-mail</label>
                            <input
                              type="text"
                              value={selectedBlock.email || ''}
                              onChange={(e) => handleUpdateBlock({ ...selectedBlock, email: e.target.value })}
                              className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-semibold">Telefone</label>
                            <input
                              type="text"
                              value={selectedBlock.phone || ''}
                              onChange={(e) => handleUpdateBlock({ ...selectedBlock, phone: e.target.value })}
                              className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                            />
                          </div>
                        </>
                      )}

                      {selectedBlock.kind === 'text' && (
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Conteúdo de Texto</label>
                          <textarea
                            value={selectedBlock.content || ''}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, content: e.target.value })}
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white h-32"
                          />
                        </div>
                      )}

                      {selectedBlock.kind === 'testimonials' && (
                        <div className="space-y-4">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Depoimentos dos Clientes</label>
                          {(selectedBlock.testimonials || []).map((t, idx) => (
                            <div key={idx} className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                              <label className="text-[9px] text-zinc-500 uppercase font-semibold">Citação #{idx + 1}</label>
                              <textarea
                                value={t.quote}
                                onChange={(e) => {
                                  const next = [...(selectedBlock.testimonials || [])];
                                  next[idx] = { ...next[idx], quote: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, testimonials: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white h-16 resize-none"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={t.author}
                                  placeholder="Autor"
                                  onChange={(e) => {
                                    const next = [...(selectedBlock.testimonials || [])];
                                    next[idx] = { ...next[idx], author: e.target.value };
                                    handleUpdateBlock({ ...selectedBlock, testimonials: next });
                                  }}
                                  className="w-1/2 bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white"
                                />
                                <input
                                  type="text"
                                  value={t.role || ''}
                                  placeholder="Cargo / Destino"
                                  onChange={(e) => {
                                    const next = [...(selectedBlock.testimonials || [])];
                                    next[idx] = { ...next[idx], role: e.target.value };
                                    handleUpdateBlock({ ...selectedBlock, testimonials: next });
                                  }}
                                  className="w-1/2 bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedBlock.kind === 'faq' && (
                        <div className="space-y-4">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Itens do FAQ</label>
                          {(selectedBlock.faqItems || []).map((faq, idx) => (
                            <div key={idx} className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                              <input
                                type="text"
                                value={faq.question}
                                placeholder="Pergunta"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.faqItems || [])];
                                  next[idx] = { ...next[idx], question: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, faqItems: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white font-bold"
                              />
                              <textarea
                                value={faq.answer}
                                placeholder="Resposta"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.faqItems || [])];
                                  next[idx] = { ...next[idx], answer: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, faqItems: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white h-16 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedBlock.kind === 'pricing' && (
                        <div className="space-y-4">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Opções de Pacote / Preços</label>
                          {(selectedBlock.pricingItems || []).map((p, idx) => (
                            <div key={idx} className="space-y-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                              <input
                                type="text"
                                value={p.title}
                                placeholder="Título do Plano"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.pricingItems || [])];
                                  next[idx] = { ...next[idx], title: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, pricingItems: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white font-bold"
                              />
                              <input
                                type="text"
                                value={p.price}
                                placeholder="Preço (ex: R$ 2.500)"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.pricingItems || [])];
                                  next[idx] = { ...next[idx], price: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, pricingItems: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white"
                              />
                              <input
                                type="text"
                                value={p.description || ''}
                                placeholder="Resumo curto"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.pricingItems || [])];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  handleUpdateBlock({ ...selectedBlock, pricingItems: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedBlock.kind === 'gallery' && (
                        <div className="space-y-4">
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Fotos da Galeria (URLs)</label>
                          {(selectedBlock.images || []).map((img, idx) => (
                            <div key={idx} className="space-y-2 p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                              <input
                                type="text"
                                value={img}
                                placeholder="URL da foto"
                                onChange={(e) => {
                                  const next = [...(selectedBlock.images || [])];
                                  next[idx] = e.target.value;
                                  handleUpdateBlock({ ...selectedBlock, images: next });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-850 text-[11px] rounded-lg p-2 focus:border-vj-green text-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-xs italic">Selecione um bloco no canvas ou no menu para editá-lo.</p>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">SEO Técnico</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Slug da Página</label>
                      <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => { setSlug(e.target.value); setIsDirty(true); }}
                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Meta Title</label>
                      <input 
                        type="text" 
                        value={metaTitle}
                        onChange={(e) => { setMetaTitle(e.target.value); setIsDirty(true); }}
                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Meta Description</label>
                      <textarea 
                        value={metaDescription}
                        onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 h-20 focus:border-vj-green text-white" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Infinite Canvas */}
        <main className="flex-1 bg-zinc-950 p-8 flex items-center justify-center overflow-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,211,123,0.04),rgba(255,255,255,0))]" />
          
          {hasDraft && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="mx-4 p-4 bg-zinc-900/95 border border-emerald-500/20 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Save className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Rascunho recuperado localmente!</h4>
                    <p className="text-[10px] text-zinc-400">Você possui alterações não salvas de uma edição anterior.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleDiscardDraft}
                    className="h-8 text-[10px] font-bold text-zinc-400 hover:text-white rounded-lg px-3"
                  >
                    Descartar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleRestoreDraft}
                    className="h-8 text-[10px] font-bold bg-vj-green text-zinc-950 hover:bg-emerald-400 rounded-lg px-4"
                  >
                    Restaurar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-vj-green" />
              <p className="text-xs text-zinc-500 font-semibold">Carregando canvas...</p>
            </div>
          ) : (
            /* Framed Viewport */
            <div
              className={cn(
                "bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-y-auto relative h-[80vh]",
                viewport === 'desktop' && "w-[1200px]",
                viewport === 'tablet' && "w-[768px]",
                viewport === 'mobile' && "w-[375px]"
              )}
            >
              {/* Header placeholder */}
              <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/60 sticky top-0 backdrop-blur-sm z-10">
                <span className="font-bold text-xs tracking-wider uppercase text-vj-green">
                  {organization?.name || 'Minha Agência'}
                </span>
                <div className="flex gap-4 text-[10px] font-semibold text-zinc-400">
                  <span>Início</span>
                  <span>Roteiros</span>
                  <span>Contato</span>
                </div>
              </div>

              {/* Dynamic visual preview based on state blocks */}
              <div className="p-8 space-y-12">
                {blocks.map((block) => (
                  <div 
                    key={block.id} 
                    onClick={() => { setSelectedBlockId(block.id); setActiveTab('edit'); }}
                    className={cn(
                      "relative group p-4 rounded-xl transition-all border border-transparent",
                      selectedBlockId === block.id 
                        ? "border-vj-green bg-zinc-800/30" 
                        : "border-dashed hover:border-vj-green/40 hover:bg-zinc-800/10 cursor-pointer"
                    )}
                  >
                    {block.kind === 'hero' && (
                      <div className="text-center py-10 space-y-4">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight max-w-xl mx-auto text-white">
                          {block.title}
                        </h2>
                        <p className="text-sm text-zinc-400 max-w-md mx-auto">
                          {block.subtitle}
                        </p>
                        <Button className="bg-vj-green text-zinc-950 hover:bg-green-600 rounded-xl h-10 px-6 font-bold text-xs">
                          Falar Conosco
                        </Button>
                      </div>
                    )}

                    {block.kind === 'features' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {block.items?.map((item, i) => (
                          <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-center">
                            <p className="text-xs font-semibold text-zinc-300">{item}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.kind === 'contact' && (
                      <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-white">Deseja falar com um especialista?</p>
                          <p className="text-[10px] text-zinc-500">Estamos de prontidão para desenhar a sua viagem.</p>
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-zinc-300">
                          <span>✉ {block.email}</span>
                          <span>☏ {block.phone}</span>
                        </div>
                      </div>
                    )}

                    {block.kind === 'text' && (
                      <div className="py-6 text-zinc-300 text-sm leading-relaxed text-center max-w-2xl mx-auto">
                        <p>{block.content}</p>
                      </div>
                    )}

                    {block.kind === 'testimonials' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(block.testimonials || []).map((t, i) => (
                          <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-left space-y-2">
                            <p className="text-xs text-zinc-400 italic">"{t.quote}"</p>
                            <div>
                              <p className="text-[10px] font-bold text-white">{t.author}</p>
                              {t.role && <p className="text-[8px] text-zinc-500">{t.role}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.kind === 'faq' && (
                      <div className="space-y-3 text-left">
                        <h4 className="text-xs font-bold text-vj-green uppercase tracking-wide">Dúvidas Frequentes</h4>
                        <div className="space-y-2">
                          {(block.faqItems || []).map((faq, i) => (
                            <div key={i} className="p-3 bg-zinc-950/20 border border-zinc-850 rounded-xl">
                              <p className="text-xs font-bold text-white mb-1">Q: {faq.question}</p>
                              <p className="text-[11px] text-zinc-400">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.kind === 'pricing' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {(block.pricingItems || []).map((p, i) => (
                          <div key={i} className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white mb-1">{p.title}</h4>
                              <p className="text-[10px] text-zinc-400 mb-2">{p.description}</p>
                            </div>
                            <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline mt-4">
                              <span className="text-[10px] text-zinc-500">Valor sugerido</span>
                              <span className="text-sm font-black text-vj-green">{p.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.kind === 'gallery' && (
                      <div className="grid grid-cols-3 gap-2">
                        {(block.images || []).map((img, i) => (
                          <div key={i} className="aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                            <img src={img} alt="Galeria" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
