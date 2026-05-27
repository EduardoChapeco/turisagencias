import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface Proposal {
 id: string;
 org_id: string;
 client_id: string | null;
 title: string;
 destination: string | null;
 status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'archived';
 template_id: string | null;
 content_schema: any; // Blocos do editor visual
 pricing_schema: any; // Valores e formas de pagamento
 itinerary_schema: any; // Detalhamento de dias
 media_schema: any; // Fotos e galerias
 public_slug: string | null;
 public_token: string;
 pdf_url: string | null;
 webview_url: string | null;
 source_pdf_url: string | null;
 source_pdf_ocr_text: string | null;
 ai_extracted_data: any;
 created_at: string;
 updated_at: string;
}

export interface ProposalVersion {
 id: string;
 proposal_id: string;
 version_number: number;
 snapshot: any;
 html_snapshot: string | null;
 pdf_url: string | null;
 created_by: string | null;
 created_at: string;
}

export interface ProposalAsset {
 id: string;
 proposal_id: string;
 file_url: string;
 file_type: string | null;
 bucket_path: string | null;
 metadata: any;
 created_at: string;
}

export interface QuoteTemplate {
 id: string;
 org_id: string | null;
 name: string;
 description: string | null;
 category: string | null;
 thumbnail_url: string | null;
 design_schema: any;
 default_sections: any;
 is_master: boolean;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface QuoteDesignElement {
 id: string;
 org_id: string | null;
 name: string;
 type: 'hero' | 'itinerary' | 'pricing' | 'hotel' | 'flight' | 'gallery' | 'inclusions' | 'exclusions' | 'terms' | 'cta' | 'contact' | 'custom';
 category: string | null;
 schema: any;
 style_schema: any;
 html_template: string | null;
 thumbnail_url: string | null;
 compatibility: string;
 is_master: boolean;
 is_active: boolean;
 version: string;
 created_at: string;
 updated_at: string;
}

// ── HOOKS DE PROPOSTAS ──

// Buscar lista de propostas da organização
export function useProposals() {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['proposals', organization?.id],
 queryFn: async () => {
 if (!organization?.id) return [];
 
 const { data, error } = await supabase
 .from('proposals')
 .select(`
 *,
 client:clients(id, name, email, whatsapp)
 `)
 .eq('org_id', organization.id)
 .order('updated_at', { ascending: false });

 if (error) throw error;
 return data as unknown as (Proposal & { client: any })[];
 },
 enabled: !!organization?.id
 });
}

// Buscar uma proposta única por ID (Restrito a autenticados da organização)
export function useProposal(id: string) {
 return useQuery({
 queryKey: ['proposal', id],
 queryFn: async () => {
 if (!id) return null;
 const { data, error } = await supabase
 .from('proposals')
 .select(`
 *,
 client:clients(id, name, email, whatsapp)
 `)
 .eq('id', id)
 .single();

 if (error) throw error;
 return data as unknown as (Proposal & { client: any });
 },
 enabled: !!id
 });
}

// Buscar uma proposta pública via public_token (Acesso anônimo permitido na WebView)
export function usePublicProposal(token: string) {
 return useQuery({
 queryKey: ['public-proposal', token],
 queryFn: async () => {
 if (!token) return null;
 
 const { data, error } = await supabase
 .from('proposals')
 .select(`
 id, org_id, client_id, title, destination, status, 
 content_schema, pricing_schema, itinerary_schema, media_schema,
 public_token, pdf_url, webview_url, created_at,
 client:clients(id, name, email, whatsapp)
 `)
 .eq('public_token', token)
 .maybeSingle();

 if (error) throw error;
 return data as unknown as (Proposal & { client: any });
 },
 enabled: !!token
 });
}

// Criar nova proposta
export function useCreateProposal() {
 const { organization } = useAuthStore();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async (proposal: Partial<Omit<Proposal, 'id' | 'org_id' | 'public_token'>>) => {
 if (!organization?.id) throw new Error('Organização não selecionada');

 const { data, error } = await supabase
 .from('proposals')
 .insert({
 org_id: organization.id,
 title: proposal.title || 'Nova Proposta de Viagem',
 destination: proposal.destination || '',
 client_id: proposal.client_id || null,
 status: 'draft',
 template_id: proposal.template_id || null,
 content_schema: proposal.content_schema || [],
 pricing_schema: proposal.pricing_schema || {},
 itinerary_schema: proposal.itinerary_schema || [],
 media_schema: proposal.media_schema || {},
 source_pdf_url: proposal.source_pdf_url || null,
 source_pdf_ocr_text: proposal.source_pdf_ocr_text || null,
 ai_extracted_data: proposal.ai_extracted_data || {}
 })
 .select()
 .single();

 if (error) throw error;
 return data as unknown as Proposal;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['proposals'] });
 }
 });
}

// Salvar / Atualizar Proposta + Versionar
export function useUpdateProposal() {
 const queryClient = useQueryClient();
 const { user } = useAuthStore();

 return useMutation({
 mutationFn: async ({ id, updates, createVersion = true }: { id: string; updates: Partial<Proposal>; createVersion?: boolean }) => {
 // 1. Atualizar proposta principal
 const { data: updatedProposal, error: updateErr } = await supabase
 .from('proposals')
 .update({
 title: updates.title,
 destination: updates.destination,
 client_id: updates.client_id,
 status: updates.status,
 content_schema: updates.content_schema,
 pricing_schema: updates.pricing_schema,
 itinerary_schema: updates.itinerary_schema,
 media_schema: updates.media_schema,
 pdf_url: updates.pdf_url,
 webview_url: updates.webview_url,
 updated_at: new Date().toISOString()
 })
 .eq('id', id)
 .select()
 .single();

 if (updateErr) throw updateErr;

 // 2. Criar nova versão na tabela proposal_versions (Versionamento real)
 if (createVersion && updatedProposal) {
 // Obter número da última versão
 const { data: versions } = await supabase
 .from('proposal_versions')
 .select('version_number')
 .eq('proposal_id', id)
 .order('version_number', { ascending: false })
 .limit(1);

 const nextVersionNum = (versions?.[0]?.version_number || 0) + 1;

 await supabase
 .from('proposal_versions')
 .insert({
 proposal_id: id,
 version_number: nextVersionNum,
 snapshot: updatedProposal,
 created_by: user?.id
 });
 }

 return updatedProposal as unknown as Proposal;
 },
 onSuccess: (data) => {
 if (data) {
 queryClient.invalidateQueries({ queryKey: ['proposals'] });
 queryClient.invalidateQueries({ queryKey: ['proposal', data.id] });
 queryClient.invalidateQueries({ queryKey: ['proposal-versions', data.id] });
 }
 }
 });
}

// Excluir proposta
export function useDeleteProposal() {
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: async (id: string) => {
 const { error } = await supabase
 .from('proposals')
 .delete()
 .eq('id', id);

 if (error) throw error;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['proposals'] });
 }
 });
}

// ── HOOKS DE TEMPLATES E ELEMENTOS DE DESIGN ──

// Buscar templates de proposta
export function useQuoteTemplates() {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['quote-templates', organization?.id],
 queryFn: async () => {
 let query = supabase
 .from('quote_templates')
 .select('*')
 .eq('is_active', true);

 if (organization?.id) {
 query = query.or(`org_id.is.null,org_id.eq.${organization.id}`);
 } else {
 query = query.is('org_id', null);
 }

 const { data, error } = await query;
 if (error) throw error;
 return data as unknown as QuoteTemplate[];
 }
 });
}

// Buscar elementos de design (blocos visuais da biblioteca)
export function useQuoteDesignElements() {
 const { organization } = useAuthStore();

 return useQuery({
 queryKey: ['quote-design-elements', organization?.id],
 queryFn: async () => {
 let query = supabase
 .from('quote_design_elements')
 .select('*')
 .eq('is_active', true);

 if (organization?.id) {
 query = query.or(`org_id.is.null,org_id.eq.${organization.id}`);
 } else {
 query = query.is('org_id', null);
 }

 const { data, error } = await query;
 if (error) throw error;
 return data as unknown as QuoteDesignElement[];
 }
 });
}

// Buscar versões de uma proposta específica
export function useProposalVersions(proposalId: string) {
 return useQuery({
 queryKey: ['proposal-versions', proposalId],
 queryFn: async () => {
 if (!proposalId) return [];
 const { data, error } = await supabase
 .from('proposal_versions')
 .select('*')
 .eq('proposal_id', proposalId)
 .order('version_number', { ascending: false });

 if (error) throw error;
 return data as unknown as ProposalVersion[];
 },
 enabled: !!proposalId
 });
}
