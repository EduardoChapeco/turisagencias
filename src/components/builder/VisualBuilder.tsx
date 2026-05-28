import { useEffect, useState, useCallback } from 'react';
import {
 Monitor, Tablet, Smartphone, Eye, Save,
 ArrowLeft, Loader2, Undo, Redo, Globe, ExternalLink
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
import { BuilderRightPanel } from './core/BuilderRightPanel';
import { registerAllBlocks } from './blocks';

// Initialize the block registry once
registerAllBlocks();

interface VisualBuilderProps {
 onBack?: () => void;
 projectName?: string;
 initialProjectType?: 'website' | 'linkbio' | 'blog';
 projectId?: string | null;
}

export default function VisualBuilder({
 onBack,
 projectName = 'Website Principal',
 initialProjectType,
 projectId,
}: VisualBuilderProps) {
 const { organization, user } = useAuthStore();
 const { toast } = useToast();

 const {
 nodes, setNodes,
 viewport, setViewport,
 isPreview, setIsPreview,
 isDirty, markSaved,
 undo, redo, history,
 siteId, pageId, projectType, slug, metaTitle, metaDescription,
 setProjectMeta,
 isSavingDraft, setIsSavingDraft, lastSavedAt, setLastSavedAt
 } = useBuilderStore();

 // Set project type on mount
 useEffect(() => {
 if (initialProjectType) {
 setProjectMeta({ projectType: initialProjectType });
 }
 }, [initialProjectType, setProjectMeta]);

 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // ─── Load project from Supabase ────────────────────────────────────────────
 useEffect(() => {
 const loadProject = async () => {
 if (!organization?.id) return;

 try {
 setLoading(true);
 const db = supabase;

   let projectData = null;

   if (projectId) {
     const { data } = await db
       .from('builder_projects')
       .select('id, slug, seo_title, seo_description, published_version_id')
       .eq('id', projectId)
       .maybeSingle();
     projectData = data;
   }

   let currentProjectId = projectData?.id || null;

   if (currentProjectId && projectData) {
     // Load the latest version
     const versionQuery = projectData.published_version_id
       ? db
         .from('builder_versions')
         .select('*')
         .eq('id', projectData.published_version_id)
         .maybeSingle()
       : db
         .from('builder_versions')
         .select('*')
         .eq('project_id', currentProjectId)
         .order('version_number', { ascending: false })
         .limit(1)
         .maybeSingle();

     const { data: versionData } = await versionQuery;

     if (versionData) {
       const contentJson = typeof versionData.content_json === 'string'
         ? JSON.parse(versionData.content_json)
         : versionData.content_json;

       if (Array.isArray(contentJson) && contentJson.length > 0) {
         setNodes(contentJson as any);
       }

       const seoJson = (versionData.seo_json as any) || {};
       setProjectMeta({
         siteId: currentProjectId,
         pageId: currentProjectId,
         slug: projectData.slug || 'home',
         metaTitle: seoJson.metaTitle || projectData.seo_title || organization.name,
         metaDescription: seoJson.metaDescription || projectData.seo_description || '',
       });
     } else {
       setProjectMeta({ siteId: currentProjectId, pageId: currentProjectId });
       setNodes([]);
     }
 } else {
 // No site exists yet
 setProjectMeta({
 siteId: null,
 pageId: null,
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

 // ─── Autosave Draft ────────────────────────────────────────────────────────
 useEffect(() => {
 if (!isDirty || !organization?.id || !user?.id || !siteId) return;

 const timer = setTimeout(async () => {
 try {
 setIsSavingDraft(true);
 const db = supabase;
 // 1. Get latest version to see if we update or insert draft
 const { data: lastVersion } = await db
 .from('builder_versions')
 .select('id, version_number, status')
 .eq('project_id', siteId)
 .order('version_number', { ascending: false })
 .limit(1)
 .maybeSingle();

 let targetVersionNumber = (lastVersion?.version_number ?? 0);
 if (targetVersionNumber === 0 || lastVersion?.status === 'published') {
 targetVersionNumber += 1; // Needs new draft version
 }

 const payload = {
 org_id: organization.id,
 project_id: siteId,
 version_number: targetVersionNumber,
 content_json: nodes as any,
 seo_json: { metaTitle, metaDescription } as any,
 settings_json: {} as any,
 status: 'draft',
 created_by: user.id,
 };

 if (lastVersion && lastVersion.status === 'draft') {
 // Update existing draft
 await db.from('builder_versions').update(payload).eq('id', lastVersion.id);
 } else {
 // Insert new draft
 await db.from('builder_versions').insert(payload);
 }

 setLastSavedAt(new Date().toISOString());
 } catch (err) {
 logger.error('Autosave failed', err);
 } finally {
 setIsSavingDraft(false);
 }
 }, 3000); // 3 seconds debounce

 return () => clearTimeout(timer);
 }, [nodes, isDirty, organization, user, siteId, pageId, metaTitle, metaDescription]); // eslint-disable-line react-hooks/exhaustive-deps

 // ─── Save / Publish ─────────────────────────────────────────────────────────
 const handleSave = useCallback(async () => {
 if (!organization?.id || !user?.id) return;
 setSaving(true);

 try {
 let currentProjectId = siteId;
 const db = supabase;

 // 1. Ensure Project exists
 if (!currentProjectId) {
 const { data: newProject, error: projectErr } = await db
 .from('builder_projects')
 .insert({
 org_id: organization.id,
 type: projectType,
 name: projectName,
 slug: slug || organization.slug || projectType,
 seo_title: metaTitle || projectName,
 seo_description: metaDescription,
 status: 'published',
 is_published: true
 })
 .select('id')
 .single();

 if (projectErr) throw projectErr;
 currentProjectId = newProject.id;
 }

 setProjectMeta({ siteId: currentProjectId, pageId: currentProjectId });

 // 3. Get the latest version
 const db3 = supabase;
 const { data: lastVersion } = await db3
 .from('builder_versions')
 .select('id, version_number, status')
 .eq('project_id', currentProjectId)
 .order('version_number', { ascending: false })
 .limit(1)
 .maybeSingle();

 let newVersionId;
 let nextVersionNumber = lastVersion?.version_number ?? 1;

 // 4. Update draft to published, or insert new published version
 if (lastVersion?.status === 'draft') {
 const { data: updatedVersion, error: versionErr } = await db3
 .from('builder_versions')
 .update({
 content_json: nodes as any,
 seo_json: { metaTitle, metaDescription } as any,
 status: 'published',
 is_published: true,
 published_at: new Date().toISOString(),
 published_by: user.id,
 created_by: user.id
 })
 .eq('id', lastVersion.id)
 .select('id')
 .single();
 if (versionErr) throw versionErr;
 newVersionId = updatedVersion.id;
 } else {
 nextVersionNumber = (lastVersion?.version_number ?? 0) + 1;
 const { data: newVersion, error: versionErr } = await db3
 .from('builder_versions')
 .insert({
 org_id: organization.id,
 project_id: currentProjectId,
 version_number: nextVersionNumber,
 content_json: nodes as any,
 seo_json: { metaTitle, metaDescription } as any,
 status: 'published',
 is_published: true,
 published_at: new Date().toISOString(),
 published_by: user.id,
 created_by: user.id,
 })
 .select('id')
 .single();
 if (versionErr) throw versionErr;
 newVersionId = newVersion.id;
 }

 // 5. Update the project's published_version_id
  const { error: updateErr } = await supabase
  .from('builder_projects')
  .update({
  published_version_id: newVersionId,
  is_published: true,
  published_at: new Date().toISOString()
  })
  .eq('id', currentProjectId);

 if (updateErr) throw updateErr;

 markSaved();
 setLastSavedAt(new Date().toISOString());
 
 toast({
 title: '✓ Publicado com sucesso!',
 description: `Versão ${nextVersionNumber} atualizada • ${new Date().toLocaleTimeString('pt-BR')}`,
 });
 } catch (e: any) {
 logger.error('VisualBuilder: Save failed', e);
 toast({ title: 'Erro ao publicar', description: e.message, variant: 'destructive' });
 } finally {
 setSaving(false);
 }
 }, [organization, user, siteId, pageId, projectType, projectName, nodes, slug, metaTitle, metaDescription, markSaved, setProjectMeta, setLastSavedAt, toast]);

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
 { mode: 'tablet', Icon: Tablet },
 { mode: 'mobile', Icon: Smartphone },
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
 {!isDirty && siteId && (
 <a
 href={publicUrl}
 target="_blank"
 rel="noreferrer"
 className="text-xs text-zinc-500 hover:text-vj-green flex items-center gap-1"
 >
 <ExternalLink className="w-3 h-3" />
 Live
 </a>
 )}

 <div className="flex items-center gap-3">
 {isSavingDraft ? (
 <span className="text-[10px] uppercase font-bold text-zinc-400 hidden sm:inline-block">Salvando...</span>
 ) : lastSavedAt ? (
 <span className="text-[10px] uppercase font-bold text-zinc-500 hidden sm:inline-block">Salvo {new Date(lastSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}</span>
 ) : null}
 
 <Button 
 onClick={handleSave}
 disabled={saving}
 size="sm"
 className="bg-vj-green hover:bg-[#b0f531] text-zinc-950 font-bold"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 sm:mr-2" />}
 <span className="hidden sm:inline-block">{saving ? 'Publicando...' : 'Publicar'}</span>
 </Button>
 </div>
 </div>
 </header>

 {/* ── Main Workspace ── */}
 <div className="flex-1 flex min-h-0 overflow-hidden relative">
 {!isPreview && <BuilderSidebar />}
 <BuilderCanvas />
 {!isPreview && <BuilderRightPanel />}
 </div>
 </div>
 );
}
