import { useState } from 'react';
import {
  Plane,
  CalendarDays,
  Hash,
  Package,
  Globe,
  Link2,
  Trash2,
  CheckSquare,
  FileText,
  ExternalLink,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useTrips } from '@/hooks/useTrips';
import {
  useUpdateKanbanCard,
  useDeleteKanbanCard,
  useKanbanNotes,
  useCreateKanbanNote,
  useKanbanChecklists,
  useCreateKanbanChecklist,
  useToggleChecklistItem,
  useAddChecklistItem,
  useDeleteChecklistItem,
} from '@/hooks/useKanbanBoards';
import type { DepartureCardData, DepartureMeta } from './DepartureBoardCard';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';


/* ── Seção: Dados do Embarque ── */
function EmbarqueSection({ card }: { card: DepartureCardData }) {
  const updateCard = useUpdateKanbanCard();
  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;

  const [form, setForm] = useState({
    title: card.title,
    destination: meta.destination ?? '',
    package_name: meta.package_name ?? '',
    hotel_name: meta.hotel_name ?? '',
    check_in_date: meta.check_in_date ?? '',
    check_in_time: meta.check_in_time ?? '',
    flight_locator: meta.flight_locator ?? '',
    airline_name: meta.airline_name ?? '',
    airline_checkin_url: meta.airline_checkin_url ?? '',
    whatsapp: card.whatsapp ?? '',
    estimated_value: card.estimated_value?.toString() ?? '',
    description: card.description ?? '',
  });
  const [dirty, setDirty] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    const newMeta: DepartureMeta = {
      destination: form.destination || undefined,
      package_name: form.package_name || undefined,
      hotel_name: form.hotel_name || undefined,
      check_in_date: form.check_in_date || undefined,
      check_in_time: form.check_in_time || undefined,
      flight_locator: form.flight_locator || undefined,
      airline_name: form.airline_name || undefined,
      airline_checkin_url: form.airline_checkin_url || undefined,
    };
    await updateCard.mutateAsync({
      id: card.id,
      title: form.title || card.title,
      description: form.description || null,
      whatsapp: form.whatsapp || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      meta: newMeta,
      metadata: newMeta,   // keep both columns in sync
    } as Record<string, any>);
    setDirty(false);
  };

  return (
    <div className="space-y-5">
      {/* Título do card */}
      <div className="space-y-1.5">
        <Label htmlFor="dep-title">Título do embarque</Label>
        <Input id="dep-title" value={form.title} onChange={(e) => set('title', e.target.value)} className="border-vj-border" />
      </div>

      {/* Pacote + Destino */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 space-y-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
          <Package size={12} /> Pacote de Viagem
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="dep-pkg" className="text-xs">Nome do Pacote</Label>
            <Input id="dep-pkg" value={form.package_name} onChange={(e) => set('package_name', e.target.value)}
              placeholder="Ex: Cancún All Inclusive 7n" className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-dest" className="text-xs">Destino</Label>
            <Input id="dep-dest" value={form.destination} onChange={(e) => set('destination', e.target.value)}
              placeholder="Ex: Cancún, México" className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-hotel" className="text-xs">Hotel</Label>
            <Input id="dep-hotel" value={form.hotel_name} onChange={(e) => set('hotel_name', e.target.value)}
              placeholder="Nome do hotel" className="border-vj-border text-sm" />
          </div>
        </div>
      </div>

      {/* Check-in information */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 space-y-4">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
          <CalendarDays size={12} /> Data & Hora do Embarque
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dep-date" className="text-xs">Data do Check-in ✈️</Label>
            <Input id="dep-date" type="date" value={form.check_in_date} onChange={(e) => set('check_in_date', e.target.value)}
              className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-time" className="text-xs">Hora de abertura (Online)</Label>
            <Input id="dep-time" type="time" value={form.check_in_time} onChange={(e) => set('check_in_time', e.target.value)}
              className="border-vj-border text-sm" />
          </div>
        </div>
      </div>

      {/* Localizadores aéreos */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50/50 border border-purple-100 space-y-4">
        <p className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
          <Hash size={12} /> Localizadores & Airline
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dep-locator" className="text-xs">Localizador PNR</Label>
            <Input id="dep-locator" value={form.flight_locator} onChange={(e) => set('flight_locator', e.target.value.toUpperCase())}
              placeholder="Ex: ABCDE1" className="border-vj-border text-sm font-mono uppercase" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-airline" className="text-xs">Companhia Aérea</Label>
            <Input id="dep-airline" value={form.airline_name} onChange={(e) => set('airline_name', e.target.value)}
              placeholder="Ex: LATAM, GOL, Azul" className="border-vj-border text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dep-url" className="text-xs flex items-center gap-1">
            <Globe size={11} /> Link de Check-in Online (clique rápido no card)
          </Label>
          <div className="flex gap-2">
            <Input id="dep-url" value={form.airline_checkin_url} onChange={(e) => set('airline_checkin_url', e.target.value)}
              placeholder="https://latamairlines.com/checkin" className="border-vj-border text-sm flex-1" />
            {form.airline_checkin_url && (
              <a href={form.airline_checkin_url} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" type="button" className="border-vj-border h-10 w-10 p-0">
                  <ExternalLink size={14} />
                </Button>
              </a>
            )}
          </div>
          <p className="text-[10px] text-vj-txt3">Cole a URL direta da página de check-in. Ela aparecerá como botão no card do Kanban.</p>
        </div>
      </div>

      {/* WhatsApp + Valor */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dep-wa" className="text-xs">WhatsApp do Cliente</Label>
          <Input id="dep-wa" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
            placeholder="49999999999" className="border-vj-border text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dep-val" className="text-xs">Valor do Pacote (R$)</Label>
          <Input id="dep-val" type="number" value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)}
            placeholder="0,00" className="border-vj-border text-sm" />
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-1.5">
        <Label htmlFor="dep-obs" className="text-xs">Observações Internas</Label>
        <Textarea id="dep-obs" value={form.description} onChange={(e) => set('description', e.target.value)}
          rows={3} placeholder="Informações extras, documentos pendentes, instruções..." className="border-vj-border resize-none text-sm" />
      </div>

      {dirty && (
        <Button onClick={() => void handleSave()} disabled={updateCard.isPending} className="w-full bg-vj-green text-white hover:bg-vj-green/90">
          {updateCard.isPending ? 'Salvando...' : '💾 Salvar Embarque'}
        </Button>
      )}
    </div>
  );
}

/* ── Seção: Checklist (documentação) ── */
function DocsSection({ cardId }: { cardId: string }) {
  const { data: checklists, isLoading } = useKanbanChecklists(cardId);
  const createChecklist = useCreateKanbanChecklist();
  const toggleItem = useToggleChecklistItem();
  const addItem = useAddChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  if (isLoading) return <div className="text-sm text-vj-txt3">Carregando...</div>;

  return (
    <div className="space-y-4">
      {(!checklists || checklists.length === 0) && (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum checklist de documentos"
          description="Crie um checklist para documentos, prazos e requisitos de viagem."
          action={
            <Button size="sm" variant="outline" onClick={() => createChecklist.mutate({ card_id: cardId, title: 'Documentos & Requisitos' })} disabled={createChecklist.isPending}>
              <Plus size={14} className="mr-1" /> Criar checklist de documentos
            </Button>
          }
        />
      )}
      {checklists?.map((cl) => {
        const items = (cl as Record<string, any>).items ?? [];
        const checked = items.filter((i: any) => i.is_checked).length;
        const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;
        return (
          <div key={cl.id} className="bg-vj-surface border border-vj-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-vj-txt">{cl.title}</p>
              <span className="text-xs text-vj-txt3">{checked}/{items.length} · {pct}%</span>
            </div>
            <div className="h-1.5 bg-vj-bg rounded-full overflow-hidden">
              <div className="h-full bg-vj-green rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-1.5">
              {items.sort((a: any, b: any) => a.position - b.position).map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input type="checkbox" checked={item.is_checked}
                    onChange={(e) => toggleItem.mutate({ item_id: item.id, is_checked: e.target.checked, card_id: cardId })}
                    className="rounded border-vj-border accent-vj-green" id={`item-${item.id}`} />
                  <label htmlFor={`item-${item.id}`} className={cn('text-sm flex-1 cursor-pointer', item.is_checked ? 'line-through text-vj-txt3' : 'text-vj-txt')}>
                    {item.title}
                  </label>
                  <button type="button" onClick={() => deleteItem.mutate({ item_id: item.id, card_id: cardId })} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input value={newItemText[cl.id] ?? ''} onChange={(e) => setNewItemText((p) => ({ ...p, [cl.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText[cl.id]?.trim()) {
                    e.preventDefault();
                    addItem.mutate({ checklist_id: cl.id, title: newItemText[cl.id].trim(), card_id: cardId });
                    setNewItemText((p) => ({ ...p, [cl.id]: '' }));
                  }
                }}
                placeholder="Novo item (Enter)" className="border-vj-border text-sm h-8" />
            </div>
          </div>
        );
      })}
      {checklists && checklists.length > 0 && (
        <Button variant="outline" size="sm" className="border-vj-border" onClick={() => createChecklist.mutate({ card_id: cardId })} disabled={createChecklist.isPending}>
          <Plus size={14} className="mr-1" /> Adicionar checklist
        </Button>
      )}
    </div>
  );
}

/* ── Seção: Notas ── */
function NotasSection({ cardId }: { cardId: string }) {
  const { data: notes, isLoading } = useKanbanNotes(cardId);
  const createNote = useCreateKanbanNote();
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!body.trim()) return;
    createNote.mutate({ card_id: cardId, body: body.trim() });
    setBody('');
  };

  if (isLoading) return <div className="text-sm text-vj-txt3">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-vj-surface border border-vj-border rounded-xl p-3 space-y-2">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(); }}
          placeholder="Nota interna... (Ctrl+Enter para enviar)" rows={2} className="border-vj-border resize-none text-sm" />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSend} disabled={!body.trim() || createNote.isPending}>
            <Send size={13} className="mr-1.5" />
            {createNote.isPending ? 'Salvando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
      {!notes || notes.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma nota" description="Adicione notas sobre documentação, pendências e follow-up." />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const author = (note as Record<string, any>).author;
            const authorName = author ? `${author.first_name} ${author.last_name}`.trim() : 'Agente';
            return (
              <div key={note.id} className="border border-vj-border rounded-xl p-3 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-vj-green/15 flex items-center justify-center text-[10px] font-bold text-vj-green">
                    {authorName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-xs font-medium text-vj-txt">{authorName}</span>
                  <span className="text-xs text-vj-txt3">
                    {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-vj-txt whitespace-pre-wrap pl-7">{note.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Seção: Vínculos ── */
function VinculosSection({ card }: { card: DepartureCardData }) {
  const updateCard = useUpdateKanbanCard();
  const { data: trips } = useTrips();
  const [clientId, setClientId] = useState(card.client_id ?? '');
  const [tripId, setTripId] = useState(card.trip_id ?? '');

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Cliente</Label>
        <ClientSearchSelect value={clientId} onChange={async (id) => { setClientId(id); await updateCard.mutateAsync({ id: card.id, client_id: id || null }); }} placeholder="Buscar cliente..." />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Viagem</Label>
        <Select 
          value={tripId} 
          onValueChange={async (value) => { 
            const newId = value === '_empty' ? '' : value;
            setTripId(newId); 
            await updateCard.mutateAsync({ id: card.id, trip_id: newId || null }); 
          }}
        >
          <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
            <SelectValue placeholder="Nenhuma viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_empty">Nenhuma viagem</SelectItem>
            {trips?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title || t.destination || `Viagem ${t.id.slice(0, 8)}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {card.clients && (
        <div className="surface-muted rounded-xl p-4">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide mb-1">Cliente atual</p>
          <p className="font-medium text-vj-txt">{card.clients.name}</p>
          {card.clients.phone && <p className="text-sm text-vj-txt3 mt-0.5">{card.clients.phone}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
const SECTIONS = [
  { id: 'embarque', label: 'Embarque', icon: Plane },
  { id: 'docs', label: 'Documentos', icon: CheckSquare },
  { id: 'notas', label: 'Notas', icon: FileText },
  { id: 'vinculos', label: 'Vínculos', icon: Link2 },
];

interface Props {
  card: DepartureCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DepartureCardSheet({ card, isOpen, onClose, onDeleted }: Props) {
  const deleteCard = useDeleteKanbanCard();

  if (!card) return null;

  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;

  const handleDelete = async () => {
    if (!window.confirm(`Excluir o card "${card.title}"? Esta ação não pode ser desfeita.`)) return;
    await deleteCard.mutateAsync(card.id);
    onDeleted?.();
    onClose();
  };

  return (
    <SheetPage
      open={isOpen}
      onClose={onClose}
      title={card.title}
      subtitle={card.clients?.name ?? meta.destination ?? undefined}
      icon={Plane}
      sections={SECTIONS}
      defaultSection="embarque"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => void handleDelete()} disabled={deleteCard.isPending}>
            <Trash2 size={14} className="mr-1.5" />
            Excluir
          </Button>
          {meta.airline_checkin_url && (
            <a href={meta.airline_checkin_url} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-1.5">
                <ExternalLink size={13} />
                Abrir Check-in Online
              </Button>
            </a>
          )}
          {!meta.airline_checkin_url && (
            <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
          )}
        </div>
      }
    >
      {(activeSection) => (
        <>
          {activeSection === 'embarque' && <EmbarqueSection card={card} />}
          {activeSection === 'docs' && <DocsSection cardId={card.id} />}
          {activeSection === 'notas' && <NotasSection cardId={card.id} />}
          {activeSection === 'vinculos' && <VinculosSection card={card} />}
        </>
      )}
    </SheetPage>
  );
}
