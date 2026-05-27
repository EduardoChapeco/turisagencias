import { useState } from 'react';
import { Copy, Plus, RotateCcw, X, Image as ImageIcon, Bus, FileSignature, Package, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { slugifyGroupTrip, useGroupTrips, useCreateGroupTrip, useDeleteGroupTrip, useUpdateGroupTrip } from '@/hooks/useGroupTrips';
import type { GroupTrip } from '@/hooks/useGroupTrips';
import { useBusLayouts } from '@/hooks/useBusLayouts';
import { useContractTemplates } from '@/hooks/useContracts';
import { useAuthStore } from '@/stores/authStore';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { SheetPage } from '@/components/ui/SheetPage';
import { GroupTripDaysEditor } from '@/components/group-trips/GroupTripDaysEditor';
import { EmptyState } from '@/components/ui/EmptyState';
import { LazyImage } from '@/components/ui/LazyImage';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaField } from '@/components/ui/MediaField';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Calendar, ExternalLink, Trash2, Eye } from 'lucide-react';
import { LocationCombobox } from '@/components/ui/LocationCombobox';
// ─── Tag/chip list editor ────────────────────────────────────────────────────
function ChipListEditor({
  label, values, onChange, placeholder,
}: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus size={14} />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-vj-bg border border-vj-border rounded-full text-xs font-medium text-vj-txt2">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="text-vj-txt3 hover:text-red-500 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FormState = {
  title: string; subtitle: string; destination: string; origin_city: string;
  slug: string; slug_locked: boolean;
  departure_date: string; return_date: string; price_per_pax: number; max_pax: number;
  installments_count: number; description_md: string; cover_image_url: string;
  includes: string[]; excludes: string[]; important_notes: string;
  gallery_urls: string[]; transport_type: string; bus_layout_id: string;
  is_public: boolean; status: 'draft' | 'published' | 'closed' | 'cancelled';
  contract_template_id: string;
};

const defaultForm = (): FormState => ({
  title: '', subtitle: '', destination: '', origin_city: '',
  slug: '', slug_locked: false,
  departure_date: '', return_date: '', price_per_pax: 0, max_pax: 40,
  installments_count: 1, description_md: '', cover_image_url: '',
  includes: [], excludes: [], important_notes: '',
  gallery_urls: [], transport_type: 'bus', bus_layout_id: 'none',
  is_public: false, status: 'draft',
  contract_template_id: '',
});

export default function GroupTrips() {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useGroupTrips();
  const { data: busLayouts } = useBusLayouts();
  const { organization } = useAuthStore();
  const { data: contractTemplates } = useContractTemplates(organization?.id);
  const create = useCreateGroupTrip();
  const update = useUpdateGroupTrip();
  const remove = useDeleteGroupTrip();
  const { toast } = useToast();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const set = (patch: Partial<FormState>) => setForm(p => ({ ...p, ...patch }));
  const publicLink = form.slug ? `/g/${form.slug}` : '/g/...';
  const canAutoUpdateSlug = !form.slug_locked && form.status !== 'published' && !form.is_public;

  const updateTitle = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(prev.slug_locked || prev.status === 'published' || prev.is_public
        ? {}
        : { slug: slugifyGroupTrip(title) }),
    }));
  };

  const updateSlug = (slug: string) => {
    set({ slug: slugifyGroupTrip(slug), slug_locked: true });
  };

  const regenerateSlug = () => {
    set({ slug: slugifyGroupTrip(form.title), slug_locked: false });
  };

  const copyPublicLink = async () => {
    const path = `${window.location.origin}${publicLink}`;
    await navigator.clipboard?.writeText(path);
    toast({ title: 'Link copiado' });
  };

  const openNew = () => { setEditing('new'); setForm(defaultForm()); };

  const openEdit = (id: string) => {
    const t = trips?.find(x => x.id === id);
    if (!t) return;
    setEditing(id);
    setForm({
      title: t.title || '',
      subtitle: t.subtitle || '',
      slug: t.slug || '',
      slug_locked: t.slug_locked ?? (t.status === 'published' || t.is_public),
      destination: t.destination || '',
      origin_city: t.origin_city || '',
      departure_date: t.departure_date || '',
      return_date: t.return_date || '',
      price_per_pax: Number(t.price_per_pax) || 0,
      max_pax: t.max_pax || 40,
      installments_count: t.installments_count || 1,
      description_md: t.description_md || '',
      cover_image_url: t.cover_image_url || '',
      includes: t.includes || [],
      excludes: t.excludes || [],
      important_notes: t.important_notes || '',
      gallery_urls: t.gallery_urls || [],
      transport_type: t.transport_type || 'bus',
      bus_layout_id: t.bus_layout_id || 'none',
      is_public: t.is_public || false,
      status: t.status || 'draft',
      contract_template_id: t.contract_template_id || '',
    });
  };

  const handleSave = async () => {
    const payload: Partial<GroupTrip> = {
      ...form,
      slug: form.slug || undefined,
      slug_locked: form.slug_locked || form.status === 'published' || form.is_public,
      price_per_pax: Number(form.price_per_pax),
      max_pax: Number(form.max_pax),
      installments_count: Number(form.installments_count),
      gallery_urls: form.gallery_urls.length > 0 ? form.gallery_urls : null,
      includes: form.includes.length > 0 ? form.includes : null,
      excludes: form.excludes.length > 0 ? form.excludes : null,
      important_notes: form.important_notes || null,
      bus_layout_id: form.bus_layout_id === 'none' ? null : form.bus_layout_id,
      contract_template_id: form.contract_template_id || null,
    };
    if (!payload.departure_date) delete payload.departure_date;
    if (!payload.return_date) delete payload.return_date;

    if (editing === 'new') {
      await create.mutateAsync(payload);
    } else if (editing) {
      await update.mutateAsync({ id: editing, ...payload });
    }
    setEditing(null);
  };

  const togglePublish = async (id: string, trip: GroupTrip) => {
    const nowPublic = !trip.is_public;
    await update.mutateAsync({
      id,
      is_public: nowPublic,
      status: nowPublic ? 'published' : 'draft',
      slug_locked: nowPublic ? true : trip.slug_locked,
    });
  };

  const sections = [
    { id: 'basic',     label: 'Básico',     icon: MapPin },
    { id: 'details',   label: 'Datas',      icon: Calendar },
    { id: 'content',   label: 'Conteúdo',   icon: FileSignature },
    { id: 'gallery',   label: 'Galeria',    icon: ImageIcon },
    { id: 'transport', label: 'Ônibus',     icon: Bus },
    { id: 'commercial',label: 'Comercial',  icon: Users },
    { id: 'contrato',  label: 'Contrato',   icon: FileSignature },
    ...(editing && editing !== 'new' ? [{ id: 'days', label: 'Dia a dia', icon: Calendar }] : []),
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Grupos Terrestres"
        description="Pacotes de viagem em grupo com página pública compartilhável"
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus size={16} /> Novo Pacote
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-vj-r" />)}
        </div>
      ) : !trips?.length ? (
        <EmptyState
          icon={Users}
          title="Nenhum pacote criado"
          description="Crie pacotes de viagem em grupo, defina o roteiro e compartilhe uma página pública para receber reservas."
          action={<Button onClick={openNew}>Criar primeiro pacote</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {trips.map(t => (
            <div key={t.id} className="premium-card group grid min-h-[180px] overflow-hidden transition-all hover:border-vj-green/30 sm:grid-cols-[160px_1fr]">
              <div className="relative h-44 bg-vj-bg sm:h-full sm:min-h-[180px]">
                {t.cover_image_url ? (
                  <LazyImage
                    src={t.cover_image_url}
                    alt={t.title}
                    aspectRatio="auto"
                    wrapperClassName="h-full w-full"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-300">
                    <MapPin size={48} className="opacity-30 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.destination || 'Sem Destino'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full  backdrop-blur-md ${
                    t.is_public && t.status === 'published'
                      ? 'bg-vj-green text-white' : 'bg-white/90 text-zinc-500'
                  }`}>
                    {t.is_public && t.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-heading font-black text-xl text-white line-clamp-1">{t.title}</h3>
                  {t.subtitle && <p className="text-sm font-medium text-white/80 line-clamp-1 mt-1">{t.subtitle}</p>}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-vj-txt3 mb-4">
                  {t.destination && <span className="flex items-center gap-1.5 p-2 bg-zinc-50 rounded-xl border border-zinc-100"><MapPin size={14} className="text-zinc-400" /> {t.destination}</span>}
                  {t.departure_date && <span className="flex items-center gap-1.5 p-2 bg-zinc-50 rounded-xl border border-zinc-100"><Calendar size={14} className="text-zinc-400" /> {new Date(t.departure_date).toLocaleDateString('pt-BR')}</span>}
                  <span className="flex items-center gap-1.5 p-2 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-600 ml-auto"><Users size={14} /> {t.current_pax}/{t.max_pax} Vagas</span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Por pessoa a partir de</p>
                    <p className="text-xl font-black text-vj-green leading-none">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: t.currency || 'BRL' }).format(Number(t.price_per_pax))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.slug && t.is_public && (
                      <Button variant="outline" size="sm" className="premium-button border-zinc-200 " title="Ver página pública"
                        onClick={() => window.open(`/g/${t.slug}`, '_blank')}>
                        <ExternalLink size={14} />
                      </Button>
                    )}
                    <Button variant="outline" size="sm"
                      className="premium-button border-vj-green/30 text-vj-green hover:bg-vj-green/10 "
                      title="Painel financeiro"
                      onClick={() => navigate(`/group-trips/${t.id}`)}>
                      <BarChart2 size={14} className="mr-1" /> Dashboard
                    </Button>
                    <Button variant="outline" size="sm" className="premium-button bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800 " title="Editar" onClick={() => openEdit(t.id)}>
                      <Eye size={14} className="mr-1.5" /> Abrir
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl" title="Excluir"
                      onClick={() => { if (confirm('Excluir pacote?')) remove.mutate(t.id); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SheetPage
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Novo Pacote em Grupo' : 'Editar Pacote'}
        subtitle="Defina o pacote e publique a página pública"
        sections={sections}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        {(section) => (
          <>
            {/* ── BÁSICO ─────────────────────────────────────────────── */}
            {section === 'basic' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>Título do pacote *</Label>
                  <Input value={form.title} onChange={e => updateTitle(e.target.value)}
                    placeholder="Ex: Excursão Caldas Novas — Réveillon 2026" />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Input value={form.subtitle} onChange={e => set({ subtitle: e.target.value })}
                    placeholder="Ex: 5 dias inesquecíveis nas águas termais" />
                </div>
                <MediaField
                  label="Imagem de capa"
                  helperText="Upload local por padrao; link externo fica como opcao avancada."
                  value={form.cover_image_url ? [form.cover_image_url] : []}
                  onChange={(urls) => set({ cover_image_url: urls[0] || '' })}
                  bucket="group-trip-media"
                  folder="covers"
                  multiple={false}
                  accept="image/*"
                  aspectRatio={16 / 9}
                  ownerType="group_trip"
                  ownerId={editing && editing !== 'new' ? editing : null}
                  fieldName="cover_image_url"
                />
                <div>
                  <Label>Descrição (markdown)</Label>
                  <Textarea rows={6} value={form.description_md} onChange={e => set({ description_md: e.target.value })}
                    placeholder="Descreva o pacote com detalhes..." />
                </div>
                <div className="space-y-2 rounded-xl border border-vj-border bg-zinc-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-vj-txt">Link publico</p>
                      <p className="text-xs text-vj-txt3">
                        {canAutoUpdateSlug ? 'Acompanha o titulo enquanto esta em rascunho.' : 'Link estavel; edite manualmente se precisar.'}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="gap-1" onClick={regenerateSlug}>
                      <RotateCcw size={14} /> Gerar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={form.slug}
                      onChange={e => updateSlug(e.target.value)}
                      placeholder={slugifyGroupTrip(form.title) || 'nome-do-pacote'}
                      className="font-mono text-sm"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => void copyPublicLink()} disabled={!form.slug}>
                      <Copy size={15} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!form.slug}
                      onClick={() => window.open(publicLink, '_blank')}
                    >
                      <ExternalLink size={15} />
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-vj-txt3">{publicLink}</p>
                </div>
                {editing && editing !== 'new' && (
                  <div className="flex items-center justify-between p-4 bg-vj-bg rounded-xl border border-vj-border">
                    <div>
                      <p className="font-semibold text-sm">Publicar página pública</p>
                      <p className="text-xs text-vj-txt3">Ativar para receber reservas no link /g/slug</p>
                    </div>
                    <Switch
                      checked={form.is_public}
                      onCheckedChange={v => set({ is_public: v, status: v ? 'published' : 'draft' })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── DATAS ───────────────────────────────────────────────── */}
            {section === 'details' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Cidade de origem</Label>
                    <LocationCombobox 
                      value={form.origin_city} 
                      onChange={val => set({ origin_city: val })} 
                      placeholder="Busque uma cidade/aeroporto..." 
                    />
                  </div>
                  <div>
                    <Label>Destino</Label>
                    <LocationCombobox 
                      value={form.destination} 
                      onChange={val => set({ destination: val })} 
                      placeholder="Busque uma cidade/aeroporto..." 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Data de partida</Label>
                    <Input type="date" value={form.departure_date} onChange={e => set({ departure_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Data de retorno</Label>
                    <Input type="date" value={form.return_date} onChange={e => set({ return_date: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTEÚDO ────────────────────────────────────────────── */}
            {section === 'content' && (
              <div className="space-y-6 max-w-2xl">
                <ChipListEditor
                  label="✅ O que está incluído"
                  values={form.includes}
                  onChange={v => set({ includes: v })}
                  placeholder="Ex: Transporte em ônibus executivo"
                />
                <ChipListEditor
                  label="❌ O que não está incluído"
                  values={form.excludes}
                  onChange={v => set({ excludes: v })}
                  placeholder="Ex: Seguro viagem individual"
                />
                <div>
                  <Label>Observações importantes</Label>
                  <Textarea rows={4} value={form.important_notes} onChange={e => set({ important_notes: e.target.value })}
                    placeholder="Política de cancelamento, documentos necessários..." />
                </div>
              </div>
            )}

            {/* ── GALERIA ─────────────────────────────────────────────── */}
            {section === 'gallery' && (
              <div className="max-w-2xl">
                <MediaField
                  label="Galeria"
                  helperText="Use upload local para as fotos da pagina publica. Links externos ficam como opcao avancada."
                  value={form.gallery_urls}
                  onChange={v => set({ gallery_urls: v })}
                  bucket="group-trip-media"
                  folder="gallery"
                  multiple
                  accept="image/*"
                  aspectRatio={4 / 3}
                  ownerType="group_trip"
                  ownerId={editing && editing !== 'new' ? editing : null}
                  fieldName="gallery_urls"
                />
              </div>
            )}

            {/* ── ÔNIBUS/TRANSPORTE ───────────────────────────────────── */}
            {section === 'transport' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>Tipo de transporte</Label>
                  <Select value={form.transport_type} onValueChange={v => set({ transport_type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus">🚌 Ônibus</SelectItem>
                      <SelectItem value="van">🚐 Van</SelectItem>
                      <SelectItem value="plane">✈️ Avião (fretado)</SelectItem>
                      <SelectItem value="boat">⛵ Barco</SelectItem>
                      <SelectItem value="none">Sem transporte incluso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.transport_type === 'bus' && (
                  <div>
                    <Label>Layout de Assentos</Label>
                    <Select value={form.bus_layout_id} onValueChange={v => set({ bus_layout_id: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem mapa de assentos</SelectItem>
                        {busLayouts?.map(bl => (
                          <SelectItem key={bl.id} value={bl.id}>
                            {bl.name} ({bl.rows * bl.cols} lugares)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.bus_layout_id !== 'none' && form.transport_type === 'bus' && (
                  <div className="p-4 rounded-xl bg-vj-green/5 border border-vj-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus size={16} className="text-vj-green" />
                      <p className="font-semibold text-sm text-vj-green">Mapa de Assentos Vinculado</p>
                    </div>
                    <p className="text-xs text-vj-txt2">
                      Este pacote utilizará este layout. Passageiros poderão escolher assentos disponíveis durante a visualização pública (se ativado).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── COMERCIAL ───────────────────────────────────────────── */}
            {section === 'commercial' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Preço por pessoa (R$) *</Label>
                    <Input type="number" step="0.01" value={form.price_per_pax}
                      onChange={e => set({ price_per_pax: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Vagas máximas</Label>
                    <Input type="number" value={form.max_pax}
                      onChange={e => set({ max_pax: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Número de parcelas (carnê automático)</Label>
                  <Input type="number" min={1} max={24} value={form.installments_count}
                    onChange={e => set({ installments_count: Number(e.target.value) })} />
                  <p className="text-xs text-vj-txt3 mt-1">
                    Última parcela vence {1} dia antes da viagem. Demais distribuídas igualmente entre hoje e o vencimento final.
                  </p>
                </div>
                {form.price_per_pax > 0 && form.installments_count > 1 && (
                  <div className="p-4 bg-vj-green/5 border border-vj-green/20 rounded-xl">
                    <p className="text-sm font-semibold text-vj-green mb-1">Resumo do carnê</p>
                    <p className="text-sm text-vj-txt2">
                      {form.installments_count}x de{' '}
                      <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.price_per_pax / form.installments_count)}</strong>
                      {' '}por passageiro
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── CONTRATO ─────────────────────────────────────────────── */}
            {section === 'contrato' && (
              <div className="space-y-5 max-w-2xl">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                  <p className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-1">
                    <FileSignature size={15} className="text-amber-500" /> Template de Contrato Padrão
                  </p>
                  <p className="text-xs text-amber-700">
                    Quando um passageiro finalizar a inscrição, este template será usado para gerar o contrato digital automaticamente.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Selecionar Template de Contrato</Label>
                  <Select
                    value={form.contract_template_id || '_none'}
                    onValueChange={v => set({ contract_template_id: v === '_none' ? '' : v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Nenhum template vinculado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="text-zinc-400 italic">
                        Sem contrato automático
                      </SelectItem>
                      {contractTemplates?.map((ct: any) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          {ct.name || ct.title || `Template ${ct.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!contractTemplates?.length && (
                    <p className="text-xs text-zinc-400 mt-1">
                      Nenhum template cadastrado. Acesse <strong>Configurações › Contratos</strong> para criar um.
                    </p>
                  )}
                </div>

                {form.contract_template_id && (
                  <div className="p-4 rounded-xl bg-vj-green/5 border border-vj-green/20 text-sm">
                    <p className="font-semibold text-vj-green">✅ Template vinculado</p>
                    <p className="text-vj-txt2 mt-1 text-xs">
                      Ao aprovar uma reserva, o sistema vai gerar e enviar o contrato digital automaticamente para assinatura.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── DIA A DIA ──────────────────────────────────────── */}
            {section === 'days' && editing && editing !== 'new' && (
              <GroupTripDaysEditor tripId={editing} />
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}
