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
} from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge, mapStatusToVariant } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
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
  trip_id: string | null;
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  trips?: { title: string | null } | null;
}

interface Props {
  card: KanbanCard | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

/* ─────────────────────────────────────────────
   SEÇÃO: Dados Gerais
   ───────────────────────────────────────────── */
function DadosSection({ card }: { card: KanbanCard }) {
  const updateCard = useUpdateKanbanCard();
  const { data: allTags } = useKanbanTags();
  const createTag = useCreateKanbanTag();

  const [form, setForm] = useState({
    title: card.title,
    description: card.description ?? '',
    estimated_value: card.estimated_value ?? '',
    whatsapp: card.whatsapp ?? '',
    email: card.email ?? '',
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
    });
    setDirty(false);
  };

  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || cardTags.includes(trimmed)) return;
    // Cria tag no banco se não existir
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
    <div className="space-y-5">
      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="card-title">Título do card</Label>
        <Input
          id="card-title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="border-cb-border"
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
          className="border-cb-border resize-none"
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
          className="border-cb-border"
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
            className="border-cb-border"
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
            className="border-cb-border"
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
            className="border-cb-border text-sm h-8"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="border-cb-border"
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

      {/* Vínculos */}
      {(card.clients || card.quotations || card.trips) && (
        <div className="pt-2 border-t border-cb-border space-y-2">
          <p className="text-xs font-semibold text-cb-muted uppercase tracking-wide">Vínculos</p>
          {card.clients && (
            <div className="flex items-center gap-2 text-sm text-cb-text">
              <User size={13} className="text-cb-muted shrink-0" />
              <span>Cliente: <strong>{card.clients.name}</strong></span>
            </div>
          )}
          {card.quotations?.destination && (
            <div className="flex items-center gap-2 text-sm text-cb-text">
              <Link2 size={13} className="text-cb-muted shrink-0" />
              <span>Cotação: <strong>{card.quotations.destination}</strong></span>
            </div>
          )}
          {card.trips?.title && (
            <div className="flex items-center gap-2 text-sm text-cb-text">
              <Link2 size={13} className="text-cb-muted shrink-0" />
              <span>Viagem: <strong>{card.trips.title}</strong></span>
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
    return <div className="text-sm text-cb-muted">Carregando...</div>;
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
        const items = (cl as any).items ?? [];
        const checked = items.filter((i: any) => i.is_checked).length;
        const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;

        return (
          <div key={cl.id} className="surface-muted rounded-cb-md p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-cb-text">{cl.title}</p>
              <span className="text-xs text-cb-muted">{checked}/{items.length}</span>
            </div>
            {items.length > 0 && (
              <div className="h-1.5 bg-cb-s2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cb-success rounded-full transition-all duration-300"
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
                      className="rounded border-cb-border accent-cb-accent"
                      id={`item-${item.id}`}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={cn(
                        'text-sm flex-1 cursor-pointer',
                        item.is_checked ? 'line-through text-cb-muted' : 'text-cb-text',
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
                className="border-cb-border text-sm h-8"
              />
            </div>
          </div>
        );
      })}

      {checklists && checklists.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="border-cb-border"
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

  if (isLoading) return <div className="text-sm text-cb-muted">Carregando...</div>;

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
          className="border-cb-border resize-none text-sm"
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
            const author = (note as any).author;
            const authorName = author
              ? `${author.first_name} ${author.last_name}`.trim()
              : 'Anônimo';
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="group border border-cb-border rounded-cb-md p-3 bg-cb-s0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-cb-accent/15 flex items-center justify-center text-xs font-semibold text-cb-accent">
                      {authorName[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="text-xs font-medium text-cb-text">{authorName}</span>
                    <span className="text-xs text-cb-muted">
                      {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {note.updated_at !== note.created_at && (
                      <span className="text-xs text-cb-muted italic">(editado)</span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="text-cb-muted hover:text-cb-text p-1"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNote.mutate({ id: note.id, card_id: cardId })}
                      className="text-cb-muted hover:text-cb-danger p-1"
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
                      className="border-cb-border resize-none text-sm"
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
                  <p className="text-sm text-cb-text whitespace-pre-wrap">{note.body}</p>
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
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────── */
const SECTIONS = [
  { id: 'dados', label: 'Dados Gerais', icon: AlignLeft },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
  { id: 'notas', label: 'Notas', icon: FileText },
  { id: 'vinculos', label: 'Vínculos', icon: Link2 },
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
            className="border-cb-danger/40 text-cb-danger hover:bg-cb-danger/5"
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
          {activeSection === 'vinculos' && (
            <div className="space-y-3">
              {card.clients && (
                <div className="surface-muted rounded-cb-md p-4">
                  <p className="text-xs font-semibold text-cb-muted uppercase tracking-wide mb-2">Cliente</p>
                  <p className="font-medium text-cb-text">{card.clients.name}</p>
                  {card.clients.phone && <p className="text-sm text-cb-muted mt-0.5">{card.clients.phone}</p>}
                </div>
              )}
              {card.quotations?.destination && (
                <div className="surface-muted rounded-cb-md p-4">
                  <p className="text-xs font-semibold text-cb-muted uppercase tracking-wide mb-2">Cotação</p>
                  <p className="font-medium text-cb-text">{card.quotations.destination}</p>
                </div>
              )}
              {card.trips?.title && (
                <div className="surface-muted rounded-cb-md p-4">
                  <p className="text-xs font-semibold text-cb-muted uppercase tracking-wide mb-2">Viagem</p>
                  <p className="font-medium text-cb-text">{card.trips.title}</p>
                </div>
              )}
              {!card.clients && !card.quotations && !card.trips && (
                <EmptyState
                  icon={Link2}
                  title="Nenhum vínculo"
                  description="Vincule este card a um cliente, cotação ou viagem na seção Dados Gerais."
                />
              )}
            </div>
          )}
        </>
      )}
    </SheetPage>
  );
}
