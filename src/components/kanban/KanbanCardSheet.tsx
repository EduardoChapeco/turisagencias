import { useState, useRef, useEffect } from 'react';
import {
  AlignLeft,
  CheckSquare,
  FileText,
  Link2,
  Pencil,
  Plus,
  Send,
  Trash2,
  User,
  X,
  Plane,
  MessageCircle,
} from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, mapStatusToVariant } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import {
  useUpdateKanbanCard,
  useDeleteKanbanCard,
  useKanbanNotes,
  useCreateKanbanNote,
  useUpdateKanbanNote,
  useDeleteKanbanNote,
  useKanbanChecklists,
  useCreateKanbanChecklist,
  useToggleChecklistItem,
  useAddChecklistItem,
  useDeleteChecklistItem,
  useKanbanTags,
  useCreateKanbanTag,
} from '@/hooks/useKanbanBoards';
import { cn } from '@/lib/utils';

/* ── Types ── */
interface KanbanCard {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  estimated_value: number | null;
  whatsapp: string | null;
  email: string | null;
  tags: string[] | null;
  client_id: string | null;
  quotation_id: string | null;
  group_trip_id: string | null;
  assigned_to: string | null;
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  group_trips?: { title: string | null } | null;
}

interface KanbanColumnData {
  id: string;
  name: string;
  color: string | null;
}

interface Props {
  card: KanbanCard | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  columns?: KanbanColumnData[];
}

import { useTeam } from '@/hooks/useTeam';
import { AlignLeft, CheckSquare, FileText, Link2, Pencil, Plus, Send, Trash2, User, X, Plane, MessageCircle, MoreVertical, LayoutKanban, HardHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/* ─────────────────────────────────────────────
   SEÇÃO: Dados Gerais
   ───────────────────────────────────────────── */
function DadosSection({ card, columns }: { card: KanbanCard, columns?: KanbanColumnData[] }) {
  const updateCard = useUpdateKanbanCard();
  const { data: allTags } = useKanbanTags();
  const createTag = useCreateKanbanTag();
  const { data: team } = useTeam();

  const [form, setForm] = useState({
    title: card.title,
    description: card.description ?? '',
    estimated_value: card.estimated_value ?? '',
    whatsapp: card.whatsapp ?? '',
    email: card.email ?? '',
    column_id: card.column_id,
    assigned_to: card.assigned_to ?? 'none',
  });
  const [tagInput, setTagInput] = useState('');
  const [cardTags, setCardTags] = useState<string[]>(card.tags ?? []);
  const [dirty, setDirty] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await updateCard.mutateAsync({
      id: card.id,
      title: form.title || card.title,
      description: form.description || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      tags: cardTags,
      column_id: form.column_id,
      assigned_to: form.assigned_to === 'none' ? null : form.assigned_to,
    });
    setDirty(false);
  };

  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || cardTags.includes(trimmed)) return;
    if (!allTags?.find((t) => t.name === trimmed)) {
      await createTag.mutateAsync({ name: trimmed });
    }
    const next = [...cardTags, trimmed];
    setCardTags(next);
    await updateCard.mutateAsync({ id: card.id, tags: next });
    setTagInput('');
  };

  const removeTag = async (name: string) => {
    const next = cardTags.filter((t) => t !== name);
    setCardTags(next);
    await updateCard.mutateAsync({ id: card.id, tags: next });
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-zinc-50/50 rounded-xl border border-zinc-100">
        <div className="flex-1 space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><LayoutKanban size={12}/> Etapa no Funil</Label>
          <Select value={form.column_id} onValueChange={(v) => update('column_id', v)}>
            <SelectTrigger className="w-full h-10 bg-white border-zinc-200 rounded-xl font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columns?.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: col.color || '#ccc' }} />
                    {col.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><HardHat size={12}/> Responsável</Label>
          <Select value={form.assigned_to} onValueChange={(v) => update('assigned_to', v)}>
            <SelectTrigger className="w-full h-10 bg-white border-zinc-200 rounded-xl font-medium">
              <SelectValue placeholder="Sem atribuição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-zinc-400 italic">Sem atribuição</SelectItem>
              {team?.map((member) => (
                <SelectItem key={member.id} value={member.user_id}>
                  {member.first_name} {member.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div className="space-y-1.5">
          <Label htmlFor="card-title">Título do card</Label>
          <Input
            id="card-title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="border-vj-border h-11 rounded-xl"
          />
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <Label htmlFor="card-desc">Descrição</Label>
          <Textarea
            id="card-desc"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Detalhes do contato, contexto..."
            className="border-vj-border resize-none rounded-xl"
          />
        </div>

        {/* Valor estimado */}
        <div className="space-y-1.5">
          <Label htmlFor="card-value">Valor estimado (R$)</Label>
          <Input
            id="card-value"
            type="number"
            min="0"
            step="0.01"
            value={form.estimated_value}
            onChange={(e) => update('estimated_value', e.target.value)}
            placeholder="0,00"
            className="border-vj-border h-11 rounded-xl font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="card-wa">WhatsApp</Label>
            <Input
              id="card-wa"
              value={form.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="49999999999"
              className="border-vj-border h-11 rounded-xl"
            />
          </div>
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="card-email">E-mail</Label>
            <Input
              id="card-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="cliente@email.com"
              className="border-vj-border h-11 rounded-xl"
            />
          </div>
        </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-1.5 min-h-8">
          {cardTags.map((t) => {
            const tagData = allTags?.find((x) => x.name === t);
            return (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: tagData ? `${tagData.color}18` : '#2E86AB18',
                  color: tagData?.color ?? '#2E86AB',
                  borderColor: tagData ? `${tagData.color}35` : '#2E86AB35',
                }}
              >
                {t}
                <button type="button" onClick={() => removeTag(t)} className="opacity-60 hover:opacity-100 ml-0.5">
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); void addTag(tagInput); }
            }}
            placeholder="Adicionar tag (Enter)"
            className="border-vj-border text-sm h-8"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="border-vj-border"
          >
            <Plus size={14} />
          </Button>
        </div>
        {allTags && allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.filter((t) => !cardTags.includes(t.name)).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void addTag(t.name)}
                className="text-xs px-2 py-0.5 rounded-full border opacity-60 hover:opacity-100 transition-opacity"
                style={{ borderColor: `${t.color}40`, color: t.color }}
              >
                + {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Vínculos */}
      {(card.clients || card.quotations || card.group_trips) && (
        <div className="pt-2 border-t border-vj-border space-y-2">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vínculos</p>
          {card.clients && (
            <div className="flex items-center gap-2 text-sm text-vj-txt">
              <User size={13} className="text-vj-txt3 shrink-0" />
              <span>Cliente: <strong>{card.clients.name}</strong></span>
            </div>
          )}
          {card.quotations?.destination && (
            <div className="flex items-center gap-2 text-sm text-vj-txt">
              <Link2 size={13} className="text-vj-txt3 shrink-0" />
              <span>Cotação: <strong>{card.quotations.destination}</strong></span>
            </div>
          )}
          {card.group_trips?.title && (
            <div className="flex items-center gap-2 text-sm text-vj-txt">
              <Link2 size={13} className="text-vj-txt3 shrink-0" />
              <span>Viagem: <strong>{card.group_trips.title}</strong></span>
            </div>
          )}
        </div>
      )}

      {dirty && (
        <Button
          onClick={() => void handleSave()}
          disabled={updateCard.isPending}
          className="w-full"
        >
          {updateCard.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEÇÃO: Checklist
   ───────────────────────────────────────────── */
function ChecklistSection({ cardId }: { cardId: string }) {
  const { data: checklists, isLoading } = useKanbanChecklists(cardId);
  const createChecklist = useCreateKanbanChecklist();
  const toggleItem = useToggleChecklistItem();
  const addItem = useAddChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  if (isLoading) {
    return <div className="text-sm text-vj-txt3">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {(!checklists || checklists.length === 0) && (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum checklist"
          description="Adicione um checklist para acompanhar o progresso."
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => createChecklist.mutate({ card_id: cardId })}
              disabled={createChecklist.isPending}
            >
              <Plus size={14} className="mr-1" /> Criar checklist
            </Button>
          }
        />
      )}

      {checklists?.map((cl) => {
        const items = (cl as Record<string, any>).items ?? [];
        const checked = items.filter((i: any) => i.is_checked).length;
        const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

        return (
          <div key={cl.id} className="surface-muted rounded-cb-md p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-vj-txt">{cl.title}</p>
              <span className="text-xs text-vj-txt3">{checked}/{items.length}</span>
            </div>
            {items.length > 0 && (
              <div className="h-1.5 bg-vj-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-vj-green rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            <div className="space-y-1.5">
              {items
                .sort((a: any, b: any) => a.position - b.position)
                .map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <input
                      type="checkbox"
                      checked={item.is_checked}
                      onChange={(e) =>
                        toggleItem.mutate({
                          item_id: item.id,
                          is_checked: e.target.checked,
                          card_id: cardId,
                        })
                      }
                      className="rounded border-vj-border accent-vj-green"
                      id={`item-${item.id}`}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={cn(
                        'text-sm flex-1 cursor-pointer',
                        item.is_checked ? 'line-through text-vj-txt3' : 'text-vj-txt',
                      )}
                    >
                      {item.title}
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteItem.mutate({ item_id: item.id, card_id: cardId })}
                      className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
            </div>
            {/* Quick-add item */}
            <div className="flex gap-2 pt-1">
              <Input
                value={newItemText[cl.id] ?? ''}
                onChange={(e) => setNewItemText((p) => ({ ...p, [cl.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText[cl.id]?.trim()) {
                    e.preventDefault();
                    addItem.mutate({
                      checklist_id: cl.id,
                      title: newItemText[cl.id].trim(),
                      card_id: cardId,
                    });
                    setNewItemText((p) => ({ ...p, [cl.id]: '' }));
                  }
                }}
                placeholder="Novo item (Enter)"
                className="border-vj-border text-sm h-8"
              />
            </div>
          </div>
        );
      })}

      {checklists && checklists.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="border-vj-border"
          onClick={() => createChecklist.mutate({ card_id: cardId })}
          disabled={createChecklist.isPending}
        >
          <Plus size={14} className="mr-1" /> Adicionar checklist
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEÇÃO: Notas
   ───────────────────────────────────────────── */
function NotasSection({ cardId }: { cardId: string }) {
  const { data: notes, isLoading } = useKanbanNotes(cardId);
  const createNote = useCreateKanbanNote();
  const updateNote = useUpdateKanbanNote();
  const deleteNote = useDeleteKanbanNote();
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!body.trim()) return;
    createNote.mutate({ card_id: cardId, body: body.trim() });
    setBody('');
  };

  const handleEdit = (note: { id: string; body: string }) => {
    setEditingId(note.id);
    setEditingBody(note.body);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingBody.trim()) return;
    updateNote.mutate({ id: noteId, card_id: cardId, body: editingBody.trim() });
    setEditingId(null);
  };

  if (isLoading) return <div className="text-sm text-vj-txt3">Carregando...</div>;

  return (
    <div className="space-y-4">
      {/* Compose */}
      <div className="surface-muted rounded-cb-md p-3 space-y-2">
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
          }}
          placeholder="Escrever uma nota... (Ctrl+Enter para enviar)"
          rows={2}
          className="border-vj-border resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!body.trim() || createNote.isPending}
          >
            <Send size={13} className="mr-1.5" />
            {createNote.isPending ? 'Salvando...' : 'Adicionar nota'}
          </Button>
        </div>
      </div>

      {/* Lista */}
      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota ainda"
          description="Adicione notas para registrar conversas, follow-ups e informações relevantes."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const author = (note as Record<string, any>).author;
            const authorName = author
              ? `${author.first_name} ${author.last_name}`.trim()
              : 'Anônimo';
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="group border border-vj-border rounded-cb-md p-3 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-vj-green/15 flex items-center justify-center text-xs font-semibold text-vj-green">
                      {authorName[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-xs font-medium text-vj-txt">{authorName}</span>
                    <span className="text-xs text-vj-txt3">
                      {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {note.updated_at !== note.created_at && (
                      <span className="text-xs text-vj-txt3 italic">(editado)</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="text-vj-txt3 hover:text-vj-txt p-1"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote.mutate({ id: note.id, card_id: cardId })}
                      className="text-vj-txt3 hover:text-vj-red p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={2}
                      className="border-vj-border resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                      <Button size="sm" onClick={() => handleSaveEdit(note.id)} disabled={updateNote.isPending}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-vj-txt whitespace-pre-wrap">{note.body}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEÇÃO: Vínculos (editable)
   ───────────────────────────────────────────── */
function VinculosSection({ card }: { card: KanbanCard }) {
  const updateCard = useUpdateKanbanCard();
  const { data: groupTrips } = useGroupTrips();
  const [clientId, setClientId] = useState(card.client_id ?? '');
  const [groupTripId, setGroupTripId] = useState(card.group_trip_id ?? '');

  const handleLinkClient = async (id: string) => {
    setClientId(id);
    await updateCard.mutateAsync({ id: card.id, client_id: id || null });
  };

  const handleLinkTrip = async (id: string) => {
    setGroupTripId(id);
    await updateCard.mutateAsync({ id: card.id, group_trip_id: id || null });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Cliente</Label>
        <ClientSearchSelect
          value={clientId}
          onChange={handleLinkClient}
          placeholder="Buscar cliente..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Viagem</Label>
        <Select 
          value={groupTripId} 
          onValueChange={(value) => handleLinkTrip(value === '_empty' ? '' : value)}
        >
          <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
            <SelectValue placeholder="Nenhuma viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_empty">Nenhuma viagem</SelectItem>
            {groupTrips?.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.title || t.destination || `Viagem ${t.id.slice(0, 8)}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show current links */}
      {card.clients && (
        <div className="surface-muted rounded-cb-md p-4">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide mb-2">Cliente atual</p>
          <p className="font-medium text-vj-txt">{card.clients.name}</p>
          {card.clients.phone && <p className="text-sm text-vj-txt3 mt-0.5">{card.clients.phone}</p>}
        </div>
      )}
      {card.quotations?.destination && (
        <div className="surface-muted rounded-cb-md p-4">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide mb-2">Cotação</p>
          <p className="font-medium text-vj-txt">{card.quotations.destination}</p>
        </div>
      )}
      {card.group_trips?.title && (
        <div className="surface-muted rounded-cb-md p-4">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide mb-2">Viagem</p>
          <p className="font-medium text-vj-txt">{card.group_trips.title}</p>
        </div>
      )}
    </div>
  );
}

import { WaChatPanel } from '@/components/kanban/WaChatPanel';

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────── */
const SECTIONS = [
  { id: 'dados', label: 'Dados Gerais', icon: AlignLeft },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'notas', label: 'Notas', icon: FileText },
  { id: 'vinculos', label: 'Vínculos', icon: Link2 },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export function KanbanCardSheet({ card, isOpen, onClose, onDeleted }: Props) {
  const deleteCard = useDeleteKanbanCard();

  if (!card) return null;

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
      subtitle={card.clients?.name ?? card.quotations?.destination ?? undefined}
      icon={User}
      sections={SECTIONS}
      defaultSection="dados"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            className="border-vj-red/40 text-vj-red hover:bg-vj-red/5"
            onClick={() => void handleDelete()}
            disabled={deleteCard.isPending}
          >
            <Trash2 size={14} className="mr-1.5" />
            Excluir card
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      {(activeSection) => (
        <>
          {activeSection === 'dados' && <DadosSection card={card} />}
          {activeSection === 'checklist' && <ChecklistSection cardId={card.id} />}
          {activeSection === 'notas' && <NotasSection cardId={card.id} />}
          {activeSection === 'vinculos' && <VinculosSection card={card} />}
          {activeSection === 'whatsapp' && <WaChatPanel clientId={card.client_id} phone={card.whatsapp} />}
        </>
      )}
    </SheetPage>
  );
}
