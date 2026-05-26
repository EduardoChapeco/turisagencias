import { useEffect, useState, useCallback } from 'react';
import {
  Monitor, Tablet, Smartphone, Eye, Save,
  ArrowLeft, Loader2, Undo, Redo, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Core Imports
import { useBuilderStore } from './core/useBuilderStore';
import { BuilderSidebar } from './core/BuilderSidebar';
import { BuilderCanvas } from './core/BuilderCanvas';
import { registerAllBlocks } from './blocks';

// Initialize the block registry once
registerAllBlocks();

interface VisualBuilderProps {
  onBack?: () => void;
  projectName?: string;
}

export default function VisualBuilder({
  onBack,
  projectName = 'Website Principal',
}: VisualBuilderProps) {
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  const {
    nodes, setNodes,
    viewport, setViewport,
    isPreview, setIsPreview,
    isDirty, markSaved,
    undo, redo, history,
    projectId, projectType, slug, metaTitle, metaDescription,
    setProjectMeta,
  } = useBuilderStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Load project from Supabase ────────────────────────────────────────────
  useEffect(() => {
    const loadProject = async () => {
      if (!organization?.id) return;

      try {
        setLoading(true);

        // 1. Find or note if there's an existing project for this org + type
        const { data: projectData } = await supabase
          .from('builder_projects')
          .select('*')
          .eq('org_id', organization.id)
          .eq('project_type', projectType)
          .maybeSingle();

        if (projectData) {
          setProjectMeta({ projectId: projectData.id });

          // 2. Load the latest published version
          const versionQuery = projectData.current_version_id
            ? supabase
                .from('builder_versions')
                .select('*')
                .eq('id', projectData.current_version_id)
                .maybeSingle()
            : supabase
                .from('builder_versions')
                .select('*')
                .eq('project_id', projectData.id)
                .order('version_number', { ascending: false })
                .limit(1)
                .maybeSingle();

          const { data: versionData } = await versionQuery;

          if (versionData) {
            // content_schema may be an array (Node Tree) or a stringified JSON
            const contentSchema = typeof versionData.content_schema === 'string'
              ? JSON.parse(versionData.content_schema)
              : versionData.content_schema;

            if (Array.isArray(contentSchema) && contentSchema.length > 0) {
              setNodes(contentSchema as any);
            }

            const frameSchema = (versionData.frame_schema as any) || {};
            setProjectMeta({
              slug: frameSchema.slug || 'home',
              metaTitle: frameSchema.metaTitle || organization.name,
              metaDescription: frameSchema.metaDescription || '',
            });
          } else {
            // No version yet – set defaults
            setProjectMeta({
              slug: organization.slug || 'home',
              metaTitle: organization.name,
              metaDescription: '',
            });
            setNodes([]);
          }
        } else {
          // No project exists yet – set defaults
          setProjectMeta({
            projectId: null,
            slug: organization.slug || 'home',
            metaTitle: organization.name,
            metaDescription: '',
          });
          setNodes([]);
        }

        markSaved();
      } catch (err: any) {
        logger.error('VisualBuilder: Error loading project', err);
        toast({ title: 'Erro ao carregar projeto', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [organization?.id, projectType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Save / Publish ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!organization?.id || !user?.id) return;
    setSaving(true);

    try {
      // 1. Upsert the builder_project row
      let currentProjectId = projectId;

      if (!currentProjectId) {
        const { data: newProject, error: projectErr } = await supabase
          .from('builder_projects')
          .insert({
            org_id: organization.id,
            project_type: projectType,
            title: projectName,
          })
          .select('id')
          .single();

        if (projectErr) throw projectErr;
        currentProjectId = newProject.id;
        setProjectMeta({ projectId: currentProjectId });
      }

      // 2. Get the next version number
      const { data: lastVersion } = await supabase
        .from('builder_versions')
        .select('version_number')
        .eq('project_id', currentProjectId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextVersionNumber = (lastVersion?.version_number ?? 0) + 1;

      // 3. Insert new version (the full Node Tree)
      const { data: newVersion, error: versionErr } = await supabase
        .from('builder_versions')
        .insert({
          project_id: currentProjectId,
          version_number: nextVersionNumber,
          content_schema: nodes as any,   // The full Node Tree
          frame_schema: { slug, metaTitle, metaDescription } as any,
          design_tokens: {} as any,
          status: 'published',
          created_by: user.id,
        })
        .select('id')
        .single();

      if (versionErr) throw versionErr;

      // 4. Update the project's current_version_id pointer
      const { error: updateErr } = await supabase
        .from('builder_projects')
        .update({
          current_version_id: newVersion.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId);

      if (updateErr) throw updateErr;

      markSaved();
      toast({
        title: '✓ Publicado com sucesso!',
        description: `Versão ${nextVersionNumber} • ${new Date().toLocaleTimeString('pt-BR')}`,
      });
    } catch (e: any) {
      logger.error('VisualBuilder: Save failed', e);
      toast({ title: 'Erro ao publicar', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [organization, user, projectId, projectType, projectName, nodes, slug, metaTitle, metaDescription, markSaved, setProjectMeta, toast]);

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-vj-green" />
        <p className="text-sm">Carregando editor...</p>
      </div>
    );
  }

  const publicUrl = slug ? `/site/${organization?.slug}` : '#';

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] text-white font-sans overflow-hidden">
      {/* ── Top Navbar ── */}
      <header className="h-12 border-b border-white/10 bg-[#111] flex items-center justify-between px-3 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 text-zinc-400 hover:text-white hover:bg-white/10 text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Sair
          </Button>

          <span className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-200 truncate max-w-[180px]">{projectName}</h2>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Alterações não salvas" />
            )}
          </div>
        </div>

        {/* Center – Viewport switcher */}
        {!isPreview && (
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
            {[
              { mode: 'desktop', Icon: Monitor },
              { mode: 'tablet',  Icon: Tablet },
              { mode: 'mobile',  Icon: Smartphone },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewport(mode as any)}
                className={cn(
                  'h-7 px-3 rounded-md transition-all flex items-center justify-center',
                  viewport === mode
                    ? 'bg-white/15 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          {!isPreview && (
            <div className="flex gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={undo}
                disabled={history.past.length === 0}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={redo}
                disabled={history.future.length === 0}
                title="Refazer (Ctrl+Y)"
              >
                <Redo className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Preview */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8 text-zinc-400 hover:text-white hover:bg-white/10 text-xs gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {isPreview ? 'Editar' : 'Preview'}
          </Button>

          {/* Visit live site */}
          {!isDirty && projectId && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex h-8 items-center gap-1.5 px-3 rounded-md text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              Ver site
            </a>
          )}

          {/* Publish */}
          {!isPreview && (
            <Button
              size="sm"
              className="h-8 bg-vj-green text-zinc-950 font-bold hover:bg-vj-green/90 text-xs gap-1.5 ml-1"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />
              }
              {saving ? 'Publicando...' : 'Publicar'}
            </Button>
          )}
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {!isPreview && <BuilderSidebar />}
        <BuilderCanvas />
      </div>
    </div>
  );
}
