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

import { useGroupTrips } from '@/hooks/useGroupTrips';
import { Compass, Calendar, MapPin, Sparkles } from 'lucide-react';
import { MediaPicker } from './MediaPicker';

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
  // Advanced styling customizer properties (OMEGA v6.5)
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

export default function VisualBuilder({ onBack, projectName = 'Website Principal', initialProjectType }: VisualBuilderProps) {
  const { organization, user } = useAuthStore();
  const { toast } = useToast();
  const { data: realTrips } = useGroupTrips();
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
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [viewCount, setViewCount] = useState(0);

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
          setViewCount(projectData.view_count || 0);
          
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

  const handleSuggestSEO = async () => {
    if (!organization) return;
    setGeneratingSeo(true);
    try {
      const name = organization.name || 'Minha Agência';
      const slogan = (organization.brand_kit as any)?.slogan || '';
      const focus = (organization.brand_kit as any)?.focus || 'Viagens boutique e personalizadas';
      const bio = (organization.brand_kit as any)?.bioCurta || '';

      let suggestedTitle = '';
      let suggestedDesc = '';

      if (projectType === 'website') {
        suggestedTitle = `${name} | ${slogan || 'Roteiros de Viagem Personalizados'}`;
        suggestedDesc = `Descubra os melhores destinos com a ${name}. ${bio || slogan || 'Oferecemos curadoria exclusiva, consultoria especializada e suporte completo para a viagem dos seus sonhos.'} Especialistas em viagens de ${focus}.`;
      } else if (projectType === 'linkbio') {
        suggestedTitle = `${name} | Links e Contato Oficial`;
        suggestedDesc = `Fale com a equipe da ${name} no WhatsApp, explore nosso site oficial, redes sociais e planeje sua próxima viagem de ${focus} conosco.`;
      } else {
        suggestedTitle = `Blog de Viagens | ${name}`;
        suggestedDesc = `Dicas de turismo, roteiros de luxo e guias de viagem exclusivos por ${name}. Encontre inspiração para sua próxima aventura de ${focus}.`;
      }

      // Try invoking Edge Function for AI refinement if configured
      try {
        const { data, error } = await supabase.functions.invoke('suggest-seo', {
          body: {
            name,
            slogan,
            focus,
            bio,
            projectType,
            currentTitle: metaTitle,
            currentDesc: metaDescription
          }
        });
        if (data && data.title && data.description) {
          suggestedTitle = data.title;
          suggestedDesc = data.description;
        }
      } catch (aiErr) {
        logger.warn('AI SEO generation bypassed or unavailable, using fallback parser:', aiErr);
      }

      setMetaTitle(suggestedTitle.slice(0, 60));
      setMetaDescription(suggestedDesc.slice(0, 160));
      setIsDirty(true);
      
      toast({
        title: "SEO Otimizado",
        description: "Metatags geradas com sucesso baseadas na identidade da sua agência!",
        variant: "default",
      });
    } catch (err) {
      logger.error('Error suggesting SEO tags:', err);
    } finally {
      setGeneratingSeo(false);
    }
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

  const handleAddBlock = (kind: 'hero' | 'features' | 'contact' | 'text' | 'testimonials' | 'faq' | 'pricing' | 'gallery' | 'packages') => {
    const id = `${kind}-${Date.now()}`;
    let newBlock: BuilderBlock = { 
      id, 
      kind,
      layoutVariant: 'default',
      align: 'center',
      paddingY: 'normal',
      bgPattern: 'flat',
      buttonStyle: 'solid'
    };
    
    if (kind === 'hero') {
      newBlock = { 
        ...newBlock,
        title: 'Nova Seção Hero', 
        subtitle: 'Clique aqui para editar este texto.',
        layoutVariant: 'centered',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80'
      };
    } else if (kind === 'features') {
      newBlock = { 
        ...newBlock,
        items: ['Recurso Extra 1', 'Recurso Extra 2', 'Recurso Extra 3'],
        layoutVariant: 'grid'
      };
    } else if (kind === 'contact') {
      newBlock = { 
        ...newBlock,
        email: organization?.email || 'contato@agencia.com', 
        phone: organization?.whatsapp || '(11) 99999-9999',
        layoutVariant: 'standard'
      };
    } else if (kind === 'text') {
      newBlock = { 
        ...newBlock,
        content: 'Insira aqui um parágrafo personalizado sobre a agência ou destinos recomendados.',
        layoutVariant: 'centered'
      };
    } else if (kind === 'testimonials') {
      newBlock = {
        ...newBlock,
        layoutVariant: 'grid',
        testimonials: [
          { quote: 'Viagem sensacional! O suporte da agência durante a estadia foi impecável.', author: 'Mariana Costa', role: 'Cliente Jalapão 2025' },
          { quote: 'Melhor consultoria que já contratei. Roteiro personalizado e hotéis de altíssimo nível.', author: 'Rodrigo Mello', role: 'Cliente Europa Premium' }
        ]
      };
    } else if (kind === 'faq') {
      newBlock = {
        ...newBlock,
        layoutVariant: 'accordion',
        faqItems: [
          { question: 'Quais as formas de pagamento disponíveis?', answer: 'Trabalhamos com boleto parcelado sem juros, PIX com desconto ou cartão de crédito em até 10x.' },
          { question: 'A viagem possui seguro incluso?', answer: 'Sim, todas as nossas viagens contratadas acompanham seguro viagem internacional ou nacional completo.' }
        ]
      };
    } else if (kind === 'pricing') {
      newBlock = {
        ...newBlock,
        layoutVariant: 'grid',
        pricingItems: [
          { title: 'Roteiro Essencial', price: 'R$ 2.400', description: 'Pacote com hospedagem, transfer e 3 passeios principais.', features: ['Hospedagem 3 estrelas', 'Transfer aeroporto', 'Suporte digital'] },
          { title: 'Experiência Premium', price: 'R$ 4.900', description: 'Curadoria completa com resorts de luxo, guias privativos e gastronomia inclusa.', features: ['Hospedagem 5 estrelas', 'Transfer privativo', 'Acompanhamento de guia', 'Seguro viagem VIP'] }
        ]
      };
    } else if (kind === 'gallery') {
      newBlock = {
        ...newBlock,
        layoutVariant: 'grid',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60'
        ]
      };
    } else if (kind === 'packages') {
      newBlock = {
        ...newBlock,
        layoutVariant: 'grid'
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
            <p className="text-[10px] text-zinc-500">Versão v1.0.{versionNumber} (Snapshot JSON) • {viewCount} visualizações</p>
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
                      { label: 'Galeria Fotos', kind: 'gallery' },
                      { label: 'Pacotes Reais', kind: 'packages' }
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
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Fotos da Galeria</label>
                          {(selectedBlock.images || []).map((img, idx) => (
                            <div key={idx} className="space-y-2 relative border border-zinc-800 rounded-2xl p-2 bg-zinc-950">
                              <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-[9px] text-zinc-400 font-bold uppercase">Foto #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextImages = (selectedBlock.images || []).filter((_, i) => i !== idx);
                                    handleUpdateBlock({ ...selectedBlock, images: nextImages });
                                  }}
                                  className="text-[9px] text-red-500 hover:text-red-400 font-semibold"
                                >
                                  Remover
                                </button>
                              </div>
                              <MediaPicker
                                label={`Selecionar Imagem`}
                                value={img}
                                onChange={(url) => {
                                  const nextImages = [...(selectedBlock.images || [])];
                                  nextImages[idx] = url;
                                  handleUpdateBlock({ ...selectedBlock, images: nextImages });
                                }}
                              />
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={() => {
                              const nextImages = [...(selectedBlock.images || []), ''];
                              handleUpdateBlock({ ...selectedBlock, images: nextImages });
                            }}
                            className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] uppercase font-bold tracking-wider h-8 rounded-lg"
                          >
                            Adicionar Foto
                          </Button>
                        </div>
                      )}
                      
                      {/* Advanced styling & layout section */}
                      <div className="pt-4 border-t border-zinc-800 space-y-4 text-left">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estilo & Layout</h4>
                        
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Variante de Layout</label>
                          <select
                            value={selectedBlock.layoutVariant || 'default'}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, layoutVariant: e.target.value })}
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          >
                            <option value="default">Padrão Limpo</option>
                            {selectedBlock.kind === 'hero' && (
                              <>
                                <option value="split">Imagem Dividida (Split)</option>
                                <option value="fullscreen">Tela Cheia (Fullscreen)</option>
                                <option value="glass">Card Moderno Flutuante</option>
                              </>
                            )}
                            {selectedBlock.kind === 'features' && (
                              <>
                                <option value="grid">Grade Simples (3 colunas)</option>
                                <option value="timeline">Timeline Horizontal</option>
                                <option value="list">Lista com Ícones</option>
                              </>
                            )}
                            {selectedBlock.kind === 'contact' && (
                              <>
                                <option value="standard">Fale Conosco (2 colunas)</option>
                                <option value="footer">Rodapé Minimalista</option>
                              </>
                            )}
                            {selectedBlock.kind === 'text' && (
                              <>
                                <option value="centered">Foco Centralizado</option>
                                <option value="twocol">Duas Colunas Editorial</option>
                                <option value="blockquote">Citação em Destaque</option>
                              </>
                            )}
                            {selectedBlock.kind === 'testimonials' && (
                              <>
                                <option value="grid">Grade de Cards</option>
                                <option value="list">Lista Linear</option>
                              </>
                            )}
                            {selectedBlock.kind === 'faq' && (
                              <>
                                <option value="accordion">Lista Sanfona (Accordion)</option>
                                <option value="grid">Grade (2 colunas)</option>
                              </>
                            )}
                            {selectedBlock.kind === 'pricing' && (
                              <>
                                <option value="grid">Grade de Planos</option>
                                <option value="vip">Card VIP Destacado</option>
                              </>
                            )}
                            {selectedBlock.kind === 'gallery' && (
                              <>
                                <option value="grid">Grade (3 colunas)</option>
                                <option value="masonry">Mosaico (Masonry)</option>
                              </>
                            )}
                            {selectedBlock.kind === 'packages' && (
                              <>
                                <option value="grid">Grade de Viagens</option>
                                <option value="list">Lista Vertical</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Alinhamento do Texto</label>
                          <div className="flex gap-2 mt-1">
                            {(['left', 'center', 'right'] as const).map((alignOpt) => (
                              <button
                                key={alignOpt}
                                type="button"
                                onClick={() => handleUpdateBlock({ ...selectedBlock, align: alignOpt })}
                                className={`flex-1 py-1 px-2 border rounded-md text-[10px] uppercase font-bold transition-colors ${
                                  (selectedBlock.align || 'center') === alignOpt 
                                    ? 'bg-zinc-800 border-vj-green text-white' 
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {alignOpt === 'left' ? 'Esquerda' : alignOpt === 'center' ? 'Centro' : 'Direita'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Espaçamento Vertical</label>
                          <select
                            value={selectedBlock.paddingY || 'normal'}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, paddingY: e.target.value as any })}
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          >
                            <option value="compact">Compacto (py-6)</option>
                            <option value="normal">Normal (py-12)</option>
                            <option value="cozy">Confortável (py-20)</option>
                            <option value="heroic">Heróico / Grande (py-28)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Estilo de Fundo</label>
                          <select
                            value={selectedBlock.bgPattern || 'flat'}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, bgPattern: e.target.value as any })}
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          >
                            <option value="flat">Plano / Sólido</option>
                            <option value="gradient">Gradiente Suave</option>
                            <option value="glass">Efeito Vidro (Glassmorphism)</option>
                            <option value="border">Com Borda Fina</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Estilo do Botão (CTA)</label>
                          <select
                            value={selectedBlock.buttonStyle || 'solid'}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, buttonStyle: e.target.value as any })}
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          >
                            <option value="solid">Preenchido (Solid)</option>
                            <option value="outline">Contorno (Outline)</option>
                            <option value="glass">Vidro / Translúcido (Glass)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Texto do Botão (CTA)</label>
                          <input
                            type="text"
                            value={selectedBlock.ctaText || ''}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, ctaText: e.target.value })}
                            placeholder="Ex: Falar Conosco"
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase font-semibold">Link do Botão / Destino (CTA)</label>
                          <input
                            type="text"
                            value={selectedBlock.ctaUrl || ''}
                            onChange={(e) => handleUpdateBlock({ ...selectedBlock, ctaUrl: e.target.value })}
                            placeholder="Ex: #contact ou https://wa.me/..."
                            className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs rounded-lg p-2 focus:border-vj-green text-white"
                          />
                        </div>

                        {(selectedBlock.kind === 'hero' || selectedBlock.kind === 'gallery') && (
                          <div className="pt-2">
                            <MediaPicker
                              label={selectedBlock.kind === 'hero' ? 'Imagem de Fundo / Split' : 'Adicionar Foto à Galeria'}
                              value={selectedBlock.imageUrl || (selectedBlock.kind === 'gallery' && selectedBlock.images?.[0]) || ''}
                              blockKind={selectedBlock.kind}
                              onChange={(url) => {
                                if (selectedBlock.kind === 'hero') {
                                  handleUpdateBlock({ ...selectedBlock, imageUrl: url });
                                } else if (selectedBlock.kind === 'gallery') {
                                  const nextImages = [...(selectedBlock.images || [])];
                                  if (nextImages.length > 0) {
                                    nextImages[0] = url;
                                  } else {
                                    nextImages.push(url);
                                  }
                                  handleUpdateBlock({ ...selectedBlock, images: nextImages, imageUrl: url });
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
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
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleSuggestSEO}
                      disabled={generatingSeo}
                      className="w-full text-xs font-semibold h-9 rounded-xl border-zinc-850 hover:bg-zinc-900 gap-1.5 flex items-center justify-center text-vj-green"
                    >
                      {generatingSeo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-vj-green" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-vj-green animate-pulse" />
                      )}
                      Sugerir SEO via IA
                    </Button>
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
                {blocks.map((block) => {
                  const isSelected = selectedBlockId === block.id;
                  
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
                    block.bgPattern === 'glass' ? 'bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl' :
                    block.bgPattern === 'border' ? 'bg-transparent border border-zinc-800' :
                    'bg-zinc-900/20 border border-transparent'; // flat
                  
                  const primaryColor = organization?.primary_color || '#2563EB';

                  return (
                    <div 
                      key={block.id} 
                      onClick={() => { setSelectedBlockId(block.id); setActiveTab('edit'); }}
                      className={cn(
                        "relative group rounded-2xl transition-all border",
                        isSelected 
                          ? "border-vj-green bg-zinc-800/30" 
                          : "border-dashed hover:border-vj-green/40 hover:bg-zinc-800/10 cursor-pointer",
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
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                                  {block.title}
                                </h2>
                                <p className="text-sm text-zinc-400">
                                  {block.subtitle}
                                </p>
                                <Button className={cn(
                                  block.buttonStyle === 'outline' ? 'border border-vj-green bg-transparent text-vj-green hover:bg-vj-green/10' :
                                  block.buttonStyle === 'glass' ? 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white' :
                                  'bg-vj-green text-zinc-950 hover:bg-green-600',
                                  "rounded-xl h-10 px-6 font-bold text-xs"
                                )}>
                                  {block.ctaText || 'Falar Conosco'}
                                </Button>
                              </div>
                              <div className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-lg">
                                <img src={block.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60'} alt="Hero" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          ) : block.layoutVariant === 'fullscreen' ? (
                            <div className="relative rounded-2xl overflow-hidden py-16 px-6 bg-cover bg-center text-center" style={{ backgroundImage: `url(${block.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80'})` }}>
                              <div className="absolute inset-0 bg-black/60 z-0" />
                              <div className="relative z-10 max-w-xl mx-auto bg-zinc-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4">
                                <h2 className="text-xl md:text-2xl font-black text-white leading-tight">{block.title}</h2>
                                <p className="text-xs text-zinc-300">{block.subtitle}</p>
                                <Button className={cn(
                                  block.buttonStyle === 'outline' ? 'border border-vj-green bg-transparent text-vj-green hover:bg-vj-green/10' :
                                  block.buttonStyle === 'glass' ? 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white' :
                                  'bg-vj-green text-zinc-950 hover:bg-green-600',
                                  "rounded-xl h-9 px-5 font-bold text-xs"
                                )}>
                                  {block.ctaText || 'Falar Conosco'}
                                </Button>
                              </div>
                            </div>
                          ) : block.layoutVariant === 'glass' ? (
                            <div className="max-w-xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl space-y-4 shadow-2xl">
                              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{block.title}</h2>
                              <p className="text-sm text-zinc-300">{block.subtitle}</p>
                              <Button className={cn(
                                block.buttonStyle === 'outline' ? 'border border-vj-green bg-transparent text-vj-green hover:bg-vj-green/10' :
                                block.buttonStyle === 'glass' ? 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white' :
                                'bg-vj-green text-zinc-950 hover:bg-green-600',
                                "rounded-xl h-10 px-6 font-bold text-xs"
                              )}>
                                {block.ctaText || 'Falar Conosco'}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h2 className="text-2xl md:text-3xl font-black tracking-tight max-w-xl mx-auto text-white leading-tight">
                                {block.title}
                              </h2>
                              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                                {block.subtitle}
                              </p>
                              <Button className={cn(
                                block.buttonStyle === 'outline' ? 'border border-vj-green bg-transparent text-vj-green hover:bg-vj-green/10' :
                                block.buttonStyle === 'glass' ? 'backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white' :
                                'bg-vj-green text-zinc-950 hover:bg-green-600',
                                "rounded-xl h-10 px-6 font-bold text-xs"
                              )}>
                                {block.ctaText || (projectType === 'blog' ? 'Acompanhar Blog' : 'Solicitar Roteiro')}
                              </Button>
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
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {block.items?.map((item, i) => (
                                <div key={i} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl text-center">
                                  <p className="text-xs font-semibold text-zinc-300">{item}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {block.kind === 'contact' && (
                        <>
                          {block.layoutVariant === 'footer' ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 w-full font-mono border-t border-zinc-800/80 pt-4">
                              <span>© {organization?.name || 'Agência'} · Todos os direitos reservados.</span>
                              <div className="flex gap-4">
                                <span>✉ {block.email}</span>
                                <span>☏ {block.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                              <div className="text-left">
                                <p className="text-xs font-bold text-white">Deseja falar com um especialista?</p>
                                <p className="text-[10px] text-zinc-500">Estamos de prontidão para desenhar a sua viagem.</p>
                              </div>
                              <div className="flex gap-4 text-xs font-mono text-zinc-300">
                                <span>✉ {block.email}</span>
                                <span>☏ {block.phone}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {block.kind === 'text' && (
                        <>
                          {block.layoutVariant === 'twocol' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-zinc-300 text-xs md:text-sm">
                              <p>{block.content}</p>
                              <p className="text-zinc-400 border-l border-zinc-800 pl-4 italic">Descubra novos destinos com suporte total de ponta a ponta feito por especialistas que amam o que fazem.</p>
                            </div>
                          ) : block.layoutVariant === 'blockquote' ? (
                            <div className="border-l-4 border-vj-green pl-6 py-2 text-left italic">
                              <p className="text-sm md:text-base text-zinc-200 max-w-xl font-serif">"{block.content}"</p>
                            </div>
                          ) : (
                            <div className="max-w-2xl mx-auto text-zinc-300 text-sm leading-relaxed">
                              <p>{block.content}</p>
                            </div>
                          )}
                        </>
                      )}

                      {block.kind === 'testimonials' && (
                        <div className={block.layoutVariant === 'list' ? 'space-y-4 max-w-xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
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
                          <div className={block.layoutVariant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2'}>
                            {(block.faqItems || []).map((faq, i) => (
                              <div key={i} className="p-3 bg-zinc-950/20 border border-zinc-850 rounded-xl">
                                <p className="text-xs font-bold text-white mb-1">Q: {faq.question}</p>
                                <p className="text-[11px] text-zinc-400 font-medium">A: {faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {block.kind === 'pricing' && (
                        <>
                          {block.layoutVariant === 'vip' ? (
                            <div className="max-w-sm mx-auto p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/25 rounded-2xl relative shadow-xl text-center">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/20">Destaque VIP</div>
                              {block.pricingItems?.[1] && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-bold text-white">{block.pricingItems[1].title}</h4>
                                  <p className="text-[10px] text-zinc-400">{block.pricingItems[1].description}</p>
                                  <div className="text-2xl font-black text-amber-400">{block.pricingItems[1].price}</div>
                                  <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-9 rounded-xl">
                                    {block.ctaText || 'Reservar Agora'}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
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
                        </>
                      )}

                      {block.kind === 'gallery' && (
                        <div className={block.layoutVariant === 'masonry' ? 'columns-2 md:columns-3 gap-2 space-y-2' : 'grid grid-cols-3 gap-2'}>
                          {(block.images || []).map((img, i) => (
                            <div key={i} className={cn("rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900", block.layoutVariant === 'masonry' && "break-inside-avoid mb-2")}>
                              <img src={img} alt="Galeria" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {block.kind === 'packages' && (
                        <div className="space-y-4 text-left">
                          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                            <h4 className="text-xs font-bold text-vj-green uppercase tracking-wide flex items-center gap-1.5">
                              <Compass size={14} /> Pacotes de Viagem Disponíveis
                            </h4>
                            <span className="text-[9px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              Banco de Dados Ativo
                            </span>
                          </div>
                          {realTrips && realTrips.length > 0 ? (
                            <div className={block.layoutVariant === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                              {realTrips.slice(0, 4).map((trip) => (
                                <div key={trip.id} className="p-4 bg-zinc-950/40 border border-zinc-850 rounded-xl flex flex-col justify-between hover:border-vj-green/40 transition-colors">
                                  <div>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                      <h5 className="text-xs font-bold text-white leading-tight line-clamp-1">{trip.title}</h5>
                                      {trip.is_public && (
                                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">Público</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin size={10} /> {trip.destination || 'A definir'}</p>
                                  </div>
                                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline mt-4">
                                    <span className="text-[9px] text-zinc-500 flex items-center gap-1"><Calendar size={10} /> {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : 'A definir'}</span>
                                    <span className="text-xs font-black text-vj-green">
                                      {trip.currency} {trip.price_per_pax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500 italic">
                              Nenhum pacote de viagem cadastrado no CRM. Cadastre em "Viagens em Grupo" para exibir aqui.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
