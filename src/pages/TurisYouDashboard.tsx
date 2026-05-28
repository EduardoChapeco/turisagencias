import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Rocket, Globe, Link, BookOpen, ArrowRight,
  Eye, Copy, Settings2, Pencil, Trash2,
  ExternalLink, Loader2, Layers2, MoreHorizontal,
  CheckCircle2, FileText,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

// ─── Types ──────────────────────────────────────────────────────────────────

type ProjectType = 'website' | 'linkbio' | 'blog';

interface BuilderProject {
  id: string;
  org_id: string;
  project_type: string;
  title: string;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  // Extended fields used in practice
  slug?: string | null;
  status?: string | null;
  cover_image_url?: string | null;
}

// ─── Creation cards config ───────────────────────────────────────────────────

interface CreationCard {
  type: ProjectType;
  template_category?: string;
  label: string;
  description: string;
  Icon: React.ElementType;
  gradient: string;
  iconBg: string;
}

const CREATION_CARDS: CreationCard[] = [
  {
    type: 'website',
    template_category: 'landing',
    label: 'Landing Page',
    description: 'Página de vendas otimizada para conversão com seções de destaque, depoimentos e CTA.',
    Icon: Rocket,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    type: 'website',
    template_category: 'full_site',
    label: 'Site Completo',
    description: 'Site institucional com múltiplas páginas, blog, destinos e formulários de contato.',
    Icon: Globe,
    gradient: 'linear-gradient(135deg, #0f4c81 0%, #1a6eb5 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    type: 'linkbio',
    label: 'Link na Bio',
    description: 'Hub de links para o Instagram, WhatsApp, roteiros e pacotes — em uma única URL.',
    Icon: Link,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
  {
    type: 'blog',
    label: 'Blog',
    description: 'Blog de viagens com SEO embutido, categorias, tags e publicação programada.',
    Icon: BookOpen,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    iconBg: 'rgba(255,255,255,0.15)',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    website: 'Site',
    linkbio: 'Bio',
    blog: 'Blog',
  };
  return map[type] ?? type;
}

function typeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    website: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    linkbio: 'bg-pink-50 text-pink-700 border-pink-200',
    blog: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return map[type] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200';
}

function statusBadgeClass(status: string | null | undefined): string {
  if (status === 'published' || status === 'active') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  return 'bg-zinc-100 text-zinc-500 border-zinc-200';
}

function statusLabel(status: string | null | undefined): string {
  if (status === 'published' || status === 'active') return 'Publicado';
  return 'Rascunho';
}

function gradientByType(type: string): string {
  const map: Record<string, string> = {
    website: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    linkbio: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    blog: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  };
  return map[type] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TurisYouDashboard() {
  const navigate = useNavigate();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Creation dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreationCard | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────
  const { data: projects, isLoading } = useQuery<BuilderProject[]>({
    queryKey: ['turisyou-projects', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('builder_projects')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as BuilderProject[];
    },
    enabled: !!organization?.id,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────

  function handleOpenCreate(card: CreationCard) {
    setSelectedCard(card);
    setNewProjectName('');
    setCreateDialogOpen(true);
  }

  async function handleCreate() {
    if (!selectedCard || !newProjectName.trim()) return;
    setCreating(true);
    try {
      const params = new URLSearchParams();
      params.set('type', selectedCard.type);
      params.set('name', encodeURIComponent(newProjectName.trim()));
      params.set('new', 'true');
      if (selectedCard.template_category) {
        params.set('template_category', selectedCard.template_category);
      }
      setCreateDialogOpen(false);
      navigate(`/site-builder?${params.toString()}`);
    } finally {
      setCreating(false);
    }
  }

  function handleEdit(project: BuilderProject) {
    const params = new URLSearchParams();
    params.set('type', project.project_type);
    params.set('id', project.id);
    navigate(`/site-builder?${params.toString()}`);
  }

  function handleCopyLink(project: BuilderProject) {
    const slug = project.slug || project.id;
    const url = `${window.location.origin}/site/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: '✓ Link copiado!', description: url });
    });
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('builder_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Criação excluída.' });
      queryClient.invalidateQueries({ queryKey: ['turisyou-projects'] });
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="space-y-10 max-w-[1600px] mx-auto pb-12 px-4">

        {/* Page Header */}
        <PageHeader
          title="TurisYou Hub"
          description="Gerencie todas as suas criações digitais: sites, landing pages, link na bio e blog de viagens."
          icon={Layers2}
        />

        {/* ── Creation Cards Section ─────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-black text-[var(--vj-txt)] tracking-tight">Nova Criação</h2>
            <p className="text-sm text-[var(--vj-txt3)] mt-0.5">Escolha um tipo de projeto para começar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREATION_CARDS.map((card) => {
              const { Icon } = card;
              return (
                <button
                  key={`${card.type}-${card.template_category ?? 'default'}`}
                  id={`turisyou-create-${card.type}-${card.template_category ?? 'default'}`}
                  onClick={() => handleOpenCreate(card)}
                  className="turisyou-creation-card group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 text-left transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: card.gradient }}
                >
                  {/* Icon */}
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: card.iconBg }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-base font-black text-white leading-tight">{card.label}</p>
                    <p className="text-xs text-white/75 mt-1.5 leading-relaxed line-clamp-2">{card.description}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-white/80 text-xs font-bold mt-auto group-hover:text-white transition-colors">
                    Criar agora
                    <ArrowRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>

                  {/* Decorative circle */}
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full bg-white/5 pointer-events-none" />
                </button>
              );
            })}
          </div>
        </section>

        {/* ── My Projects Section ────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--vj-txt)] tracking-tight">Minhas Criações</h2>
              <p className="text-sm text-[var(--vj-txt3)] mt-0.5">
                {isLoading ? 'Carregando...' : `${projects?.length ?? 0} projeto${(projects?.length ?? 0) !== 1 ? 's' : ''} encontrado${(projects?.length ?? 0) !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl bg-zinc-100 animate-pulse border" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!projects || projects.length === 0) && (
            <div className="py-24 text-center border-2 border-dashed border-[var(--vj-border)] bg-[var(--vj-bg)] rounded-2xl">
              <FileText className="w-14 h-14 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-[var(--vj-txt)]">Nenhuma criação ainda</h3>
              <p className="text-sm text-[var(--vj-txt3)] mt-2 max-w-sm mx-auto">
                Clique em um dos cards acima para criar seu primeiro site, landing page, link na bio ou blog.
              </p>
            </div>
          )}

          {/* Project cards grid */}
          {!isLoading && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEdit(project)}
                  onCopyLink={() => handleCopyLink(project)}
                  onDelete={() => setDeleteId(project.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Create Dialog ─────────────────────────────────────────────── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border border-[var(--vj-border)] bg-[var(--vj-surface)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-[var(--vj-txt)]">
              {selectedCard ? `Nova ${selectedCard.label}` : 'Novo Projeto'}
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--vj-txt3)]">
              {selectedCard?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="turisyou-project-name" className="text-xs font-bold uppercase tracking-wider text-[var(--vj-txt2)]">
                Nome do Projeto
              </Label>
              <Input
                id="turisyou-project-name"
                autoFocus
                placeholder={`Ex: ${selectedCard?.label ?? 'Meu Projeto'} da Agência`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                className="h-10 rounded-xl border-[var(--vj-border)] bg-[var(--vj-bg)] text-[var(--vj-txt)] placeholder:text-[var(--vj-txt3)]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="rounded-xl border-[var(--vj-border)] text-[var(--vj-txt2)]"
            >
              Cancelar
            </Button>
            <Button
              id="turisyou-create-confirm"
              onClick={handleCreate}
              disabled={!newProjectName.trim() || creating}
              className="rounded-xl bg-[var(--vj-primary)] text-white font-bold hover:opacity-90"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Criar e Abrir Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border border-[var(--vj-border)] bg-[var(--vj-surface)]">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-[var(--vj-txt)]">Excluir criação?</DialogTitle>
            <DialogDescription className="text-sm text-[var(--vj-txt3)]">
              Esta ação é irreversível. O projeto e todas as suas versões serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
              className="rounded-xl border-[var(--vj-border)] text-[var(--vj-txt2)]"
            >
              Cancelar
            </Button>
            <Button
              id="turisyou-delete-confirm"
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="rounded-xl font-bold"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .turisyou-creation-card {
          border: 1px solid rgba(255,255,255,0.08);
        }
        .turisyou-creation-card:hover {
          border-color: rgba(255,255,255,0.2);
        }
      `}</style>
    </AppLayout>
  );
}

// ─── Project Card Component ──────────────────────────────────────────────────

interface ProjectCardProps {
  project: BuilderProject;
  onEdit: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, onEdit, onCopyLink, onDelete }: ProjectCardProps) {
  const hasImage = !!project.cover_image_url;
  const slug = project.slug || project.id.slice(0, 8);

  return (
    <div
      id={`turisyou-project-${project.id}`}
      className="turisyou-project-card group flex flex-col rounded-2xl overflow-hidden border border-[var(--vj-border)] bg-[var(--vj-surface)] transition-all duration-300 hover:border-[var(--vj-primary)]/40 hover:shadow-lg"
    >
      {/* Cover / Gradient thumbnail */}
      <div
        className="relative h-36 shrink-0 overflow-hidden"
        style={{
          background: hasImage ? undefined : gradientByType(project.project_type),
        }}
      >
        {hasImage && (
          <img
            src={project.cover_image_url!}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Overlay with type icon */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`text-[10px] font-black border backdrop-blur-sm ${typeBadgeClass(project.project_type)}`}
          >
            {typeLabel(project.project_type)}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] font-black border backdrop-blur-sm ${statusBadgeClass(project.status)}`}
          >
            {project.status === 'published' || project.status === 'active' ? (
              <CheckCircle2 className="w-2.5 h-2.5 mr-1 inline-block" />
            ) : null}
            {statusLabel(project.status)}
          </Badge>
        </div>

        {/* Settings popover — top right */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                id={`turisyou-settings-${project.id}`}
                className="h-7 w-7 bg-white/90 hover:bg-white border border-white/20 rounded-lg shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-1 rounded-xl border border-[var(--vj-border)] bg-[var(--vj-surface)] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id={`turisyou-rename-${project.id}`}
                className="turisyou-popover-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--vj-txt2)] hover:bg-zinc-100/80 hover:text-[var(--vj-txt)] transition-colors"
                onClick={onEdit}
              >
                <Pencil className="w-3.5 h-3.5" /> Renomear
              </button>
              <button
                id={`turisyou-seo-${project.id}`}
                className="turisyou-popover-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--vj-txt2)] hover:bg-zinc-100/80 hover:text-[var(--vj-txt)] transition-colors"
                onClick={onEdit}
              >
                <Globe className="w-3.5 h-3.5" /> SEO
              </button>
              <button
                id={`turisyou-privacy-${project.id}`}
                className="turisyou-popover-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--vj-txt2)] hover:bg-zinc-100/80 hover:text-[var(--vj-txt)] transition-colors"
                onClick={onEdit}
              >
                <Settings2 className="w-3.5 h-3.5" /> Privacidade
              </button>
              <div className="my-1 border-t border-[var(--vj-border)]" />
              <button
                id={`turisyou-delete-btn-${project.id}`}
                className="turisyou-popover-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <div>
          <h3 className="font-black text-sm text-[var(--vj-txt)] leading-snug line-clamp-1 group-hover:text-[var(--vj-primary)] transition-colors">
            {project.title}
          </h3>
          <p className="text-[10px] text-[var(--vj-txt3)] mt-0.5 font-medium">@{slug}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-[var(--vj-txt3)] font-semibold">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {project.view_count ?? 0} views
          </span>
          <span className="text-[var(--vj-border)]">•</span>
          <span>
            {new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[var(--vj-border)]">
          <Button
            id={`turisyou-edit-${project.id}`}
            size="sm"
            onClick={onEdit}
            className="flex-1 h-8 rounded-xl bg-[var(--vj-primary)] text-white font-bold text-xs hover:opacity-90 gap-1"
          >
            <Pencil className="w-3 h-3" /> Editar
          </Button>
          <Button
            id={`turisyou-copy-${project.id}`}
            size="icon"
            variant="outline"
            onClick={onCopyLink}
            className="h-8 w-8 rounded-xl border-[var(--vj-border)] text-[var(--vj-txt3)] hover:text-[var(--vj-txt)] hover:bg-zinc-100/80"
            title="Copiar link público"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            id={`turisyou-view-${project.id}`}
            size="icon"
            variant="outline"
            onClick={() => {
              const s = project.slug || project.id;
              window.open(`/site/${s}`, '_blank');
            }}
            className="h-8 w-8 rounded-xl border-[var(--vj-border)] text-[var(--vj-txt3)] hover:text-[var(--vj-txt)] hover:bg-zinc-100/80"
            title="Ver publicação"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
