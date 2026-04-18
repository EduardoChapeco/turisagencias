import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useDestinations, useUpsertDestination, useDeleteDestination, useToggleDestinationActive, type Destination } from '@/hooks/useDestinations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Globe2, Plus, Search, Trash2, Pencil, MapPin,
  Plane, Clock, Thermometer, CheckCircle2, XCircle, ChevronRight
} from 'lucide-react';

const SEASON_LABELS: Record<string, string> = {
  jan: 'Jan', feb: 'Fev', mar: 'Mar', apr: 'Abr',
  may: 'Mai', jun: 'Jun', jul: 'Jul', aug: 'Ago',
  sep: 'Set', oct: 'Out', nov: 'Nov', dec: 'Dez',
};

const SEASON_COLORS: Record<string, string> = {
  jan: 'bg-blue-100 text-blue-700', feb: 'bg-blue-100 text-blue-700',
  mar: 'bg-green-100 text-green-700', apr: 'bg-green-100 text-green-700',
  may: 'bg-yellow-100 text-yellow-700', jun: 'bg-orange-100 text-orange-700',
  jul: 'bg-orange-100 text-orange-700', aug: 'bg-orange-100 text-orange-700',
  sep: 'bg-amber-100 text-amber-700', oct: 'bg-amber-100 text-amber-700',
  nov: 'bg-purple-100 text-purple-700', dec: 'bg-blue-100 text-blue-700',
};

function DestinationCard({
  dest, onEdit, onDelete, onToggle,
}: {
  dest: Destination;
  onEdit: (d: Destination) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const gw = dest.gateway_rules;

  return (
    <div className={`premium-card p-5 flex flex-col gap-4 group ${!dest.is_active ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-vj-green/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-vj-green" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-vj-txt truncate text-sm">{dest.name}</h3>
            <p className="text-[10px] text-vj-txt3 uppercase tracking-widest font-semibold truncate">{dest.country} {dest.region ? `• ${dest.region}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            onClick={() => onToggle(dest.id, !dest.is_active)}
            className={`w-2 h-2 rounded-full cursor-pointer flex-shrink-0 ${dest.is_active ? 'bg-green-500' : 'bg-zinc-300'}`}
            title={dest.is_active ? 'Ativo' : 'Inativo'}
          />
        </div>
      </div>

      {/* IATA + Transfer */}
      <div className="grid grid-cols-2 gap-2">
        {dest.iata_gateway && (
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Gateway IATA</p>
            <p className="font-mono text-sm font-bold text-zinc-700">{dest.iata_gateway}</p>
          </div>
        )}
        {dest.transfer_time_hours && (
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Transfer</p>
            <p className="text-sm font-bold text-zinc-700">{dest.transfer_time_hours}h</p>
          </div>
        )}
      </div>

      {/* Gateway Rules */}
      {gw && (gw.gateway_city || gw.transfer_notes) && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-[9px] uppercase tracking-widest text-blue-500 font-bold mb-1 flex items-center gap-1">
            <Plane className="w-2.5 h-2.5" /> Regra de Gateway IA
          </p>
          {gw.gateway_city && (
            <p className="text-xs text-blue-800 font-medium">
              Via <span className="font-bold">{gw.gateway_city}</span>
              {gw.gateway_iata && <span className="font-mono ml-1">({gw.gateway_iata})</span>}
            </p>
          )}
          {gw.transfer_notes && (
            <p className="text-[10px] text-blue-600 mt-1 leading-relaxed">{gw.transfer_notes}</p>
          )}
        </div>
      )}

      {/* Seasons */}
      {(dest.best_season?.length || dest.avoid_season?.length) ? (
        <div className="space-y-1.5">
          {dest.best_season && dest.best_season.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[9px] uppercase text-green-600 font-bold tracking-wider">Melhor:</p>
              {dest.best_season.map(s => (
                <span key={s} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${SEASON_COLORS[s] ?? 'bg-zinc-100 text-zinc-500'}`}>
                  {SEASON_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}
          {dest.avoid_season && dest.avoid_season.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[9px] uppercase text-red-500 font-bold tracking-wider">Evitar:</p>
              {dest.avoid_season.map(s => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-50 text-red-500">
                  {SEASON_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-xl" onClick={() => onEdit(dest)}>
          <Pencil className="w-3 h-3 mr-1.5" /> Editar
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-xl p-0 flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover {dest.name}?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita. Destinos em uso por cotações não serão afetados.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(dest.id)} className="bg-destructive text-white hover:bg-destructive/90">Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ── Formulário de Edição/Criação ──
function DestinationForm({
  initial, open, onClose,
}: { initial?: Destination | null; open: boolean; onClose: () => void }) {
  const upsert = useUpsertDestination();
  const isEditing = !!initial?.id;

  const [form, setForm] = useState({
    slug: initial?.slug ?? '',
    name: initial?.name ?? '',
    country: initial?.country ?? '',
    region: initial?.region ?? '',
    iata_gateway: initial?.iata_gateway ?? '',
    transfer_time_hours: String(initial?.transfer_time_hours ?? ''),
    best_season: (initial?.best_season ?? []).join(', '),
    avoid_season: (initial?.avoid_season ?? []).join(', '),
    gateway_city: initial?.gateway_rules?.gateway_city ?? '',
    gateway_iata: initial?.gateway_rules?.gateway_iata ?? '',
    transfer_type: initial?.gateway_rules?.transfer_type ?? '',
    transfer_notes: initial?.gateway_rules?.transfer_notes ?? '',
    min_connection_hours: String(initial?.gateway_rules?.min_connection_hours ?? ''),
  });

  const set = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.country) return;

    const parseSeason = (s: string) => s.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);

    await upsert.mutateAsync({
      id: initial?.id,
      slug: form.slug.toLowerCase().trim(),
      name: form.name.trim(),
      country: form.country.trim(),
      region: form.region || undefined,
      iata_gateway: form.iata_gateway.toUpperCase() || undefined,
      transfer_time_hours: form.transfer_time_hours ? Number(form.transfer_time_hours) : undefined,
      best_season: parseSeason(form.best_season),
      avoid_season: parseSeason(form.avoid_season),
      gateway_rules: (form.gateway_city || form.transfer_notes) ? {
        gateway_city: form.gateway_city || undefined,
        gateway_iata: form.gateway_iata.toUpperCase() || undefined,
        transfer_type: form.transfer_type || undefined,
        transfer_notes: form.transfer_notes || undefined,
        min_connection_hours: form.min_connection_hours ? Number(form.min_connection_hours) : undefined,
      } : undefined,
      is_active: true,
    } as Record<string, any>);

    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Editar Destino' : 'Novo Destino'}</SheetTitle>
          <SheetDescription>Configure as regras de gateway que o Agente IA usa para cotações automáticas.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Dados Básicos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">📍 Dados do Destino</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Nome do Destino *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jericoacoara" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug (ID único) *</Label>
                <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="jericoacoara" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">País *</Label>
                <Input value={form.country} onChange={e => set('country', e.target.value)} placeholder="Brasil" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Região/Estado</Label>
                <Input value={form.region} onChange={e => set('region', e.target.value)} placeholder="Ceará" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">IATA do Gateway</Label>
                <Input value={form.iata_gateway} onChange={e => set('iata_gateway', e.target.value)} placeholder="FOR" className="rounded-xl font-mono" maxLength={4} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tempo de Transfer (horas)</Label>
                <Input type="number" value={form.transfer_time_hours} onChange={e => set('transfer_time_hours', e.target.value)} placeholder="4" className="rounded-xl" />
              </div>
            </div>
          </div>

          {/* Regras de Gateway */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-3">✈️ Regras para o Agente IA</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Cidade Gateway</Label>
                  <Input value={form.gateway_city} onChange={e => set('gateway_city', e.target.value)} placeholder="Fortaleza" className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">IATA Gateway</Label>
                  <Input value={form.gateway_iata} onChange={e => set('gateway_iata', e.target.value)} placeholder="FOR" className="rounded-xl font-mono" maxLength={4} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Transfer</Label>
                  <Input value={form.transfer_type} onChange={e => set('transfer_type', e.target.value)} placeholder="van, avião, barco..." className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Conexão Mínima (h)</Label>
                  <Input type="number" value={form.min_connection_hours} onChange={e => set('min_connection_hours', e.target.value)} placeholder="3" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Observações de Transfer</Label>
                <Textarea
                  value={form.transfer_notes}
                  onChange={e => set('transfer_notes', e.target.value)}
                  placeholder="Ex: Van de 4h sem asfalto. Voos para Jijoca operam somente com Gol/Latam. Evitar conexão menor que 3h em FOR."
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Sazonalidade */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">🌤️ Sazonalidade (separado por vírgula: jan, feb, mar...)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-green-600">✅ Melhores Meses</Label>
                <Input value={form.best_season} onChange={e => set('best_season', e.target.value)} placeholder="jul, aug, sep" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-red-500">❌ Evitar</Label>
                <Input value={form.avoid_season} onChange={e => set('avoid_season', e.target.value)} placeholder="nov, dec" className="rounded-xl" />
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-vj-green text-white hover:bg-vj-green/90 h-12 rounded-2xl font-bold"
            onClick={handleSubmit}
            disabled={!form.name || !form.slug || !form.country || upsert.isPending}
          >
            {upsert.isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Destino'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Página Principal ──
export default function Destinations() {
  const { data: destinations, isLoading } = useDestinations();
  const deleteDestination = useDeleteDestination();
  const toggleActive = useToggleDestinationActive();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Destination | null>(null);

  const countries = [...new Set((destinations ?? []).map(d => d.country))].sort();

  const filtered = (destinations ?? []).filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !country || d.country === country;
    return matchSearch && matchCountry;
  });

  const handleEdit = (d: Destination) => {
    setEditTarget(d);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const activeCount = (destinations ?? []).filter(d => d.is_active).length;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10 px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">
              Destinos <span className="highlight-text">& Gateways</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-vj-green" />
              Base de conhecimento logístico do Agente IA — {activeCount} destinos ativos
            </p>
          </div>
          <Button className="premium-button  " onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" /> Novo Destino
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar destinos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 h-11 bg-white border-vj-border rounded-2xl"
            />
          </div>
          <Select value={country || 'all'} onValueChange={v => setCountry(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-11 px-4 rounded-2xl border-vj-border bg-white font-medium w-auto min-w-[180px]">
              <SelectValue placeholder="Todos os países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os países</SelectItem>
              {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {(search || country) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCountry(''); }}>
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="bento-grid-premium">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[260px] rounded-[24px]" />)}
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon={Globe2}
            title="Nenhum destino encontrado"
            description="Adicione destinos para que o Agente IA possa calcular rotas, gateways e conexões automaticamente."
            action={<Button className="premium-button" onClick={handleNew}><Plus className="mr-2 h-4 w-4" />Criar Destino</Button>}
          />
        ) : (
          <div className="bento-grid-premium">
            {filtered.map(dest => (
              <DestinationCard
                key={dest.id}
                dest={dest}
                onEdit={handleEdit}
                onDelete={id => deleteDestination.mutate(id)}
                onToggle={(id, active) => toggleActive.mutate({ id, is_active: active })}
              />
            ))}
          </div>
        )}
      </div>

      <DestinationForm
        open={formOpen}
        initial={editTarget}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
      />
    </AppLayout>
  );
}
