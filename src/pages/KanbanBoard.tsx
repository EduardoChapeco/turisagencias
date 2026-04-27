import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GripVertical, Plus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard, useEnsureDefaultBoards, useKanbanRealtime } from '@/hooks/useKanbanBoards';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanSquare, X, Eye, Users } from 'lucide-react';
import KanbanCardPage from './KanbanCardPage';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

/* ── Types ── */
type KanbanCardData = {
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
  group_trip_id: string | null;
  assigned_to: string | null;
  meta: any;
  created_at?: string | null;
  updated_at?: string | null;
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  trips?: { destination: string | null } | null;
  group_trips?: { title: string | null } | null;
};

type KanbanColumnData = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string | null;
};

function getCardSignals(card: KanbanCardData) {
  const signals: Array<{ label: string; className: string }> = [];
  const updatedAt = card.updated_at ? new Date(card.updated_at) : null;
  const inactiveDays = updatedAt && !Number.isNaN(updatedAt.getTime())
    ? Math.floor((Date.now() - updatedAt.getTime()) / 86400000)
    : 0;

  if (inactiveDays >= 7) {
    signals.push({ label: 'Frio', className: 'bg-red-50 text-red-700 border-red-200' });
  } else if (inactiveDays >= 3) {
    signals.push({ label: 'Esfriando', className: 'bg-amber-50 text-amber-700 border-amber-200' });
  }

  if (!card.estimated_value) {
    signals.push({ label: 'Sem valor', className: 'bg-zinc-50 text-zinc-600 border-zinc-200' });
  }

  if ((card.estimated_value || 0) > 5000 && !card.quotation_id) {
    signals.push({ label: 'Sem proposta', className: 'bg-blue-50 text-blue-700 border-blue-200' });
  }

  return signals.slice(0, 3);
}

/* ── SortableCard ── */
function SortableCard({
  card,
  onClick,
}: {
  card: KanbanCardData;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isHighValue = (card.estimated_value || 0) > 5000;
  const signals = getCardSignals(card);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'kanban-card group relative',
        isDragging && 'kanban-card-dragging',
      )}
    >
      {/* Dynamic Animated Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center justify-center">
        {isHighValue ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vj-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-vj-green border border-vj-green/30"></span>
          </span>
        ) : (
          <span className="h-2 w-2 rounded-full bg-zinc-200"></span>
        )}
      </div>

      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-black/5 p-1 rounded-md touch-none cursor-grab active:cursor-grabbing transition-all"
        aria-label="Arrastar card"
      >
        <GripVertical size={16} className="text-zinc-400" />
      </button>

      <div className="pl-6 space-y-3">
        {/* Tags com estilo Forge (pills) */}
        {(signals.length > 0 || (card.tags && card.tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5">
            {signals.map((signal) => (
              <span
                key={signal.label}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  signal.className,
                )}
              >
                {signal.label}
              </span>
            ))}
            {(card.tags ?? []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-vj-primary/10 text-vj-primary border border-vj-primary/20 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
            {(card.tags?.length ?? 0) > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">+{(card.tags?.length ?? 0) - 3}</span>
            )}
          </div>
        )}

        {/* Título & Subtítulo */}
        <div>
          <p className="font-bold text-[15px] text-zinc-800 leading-snug group-hover:text-vj-primary transition-colors">{card.title}</p>
          {(card.clients?.name || card.quotations?.destination || card.group_trips?.title) && (
            <p className="text-xs font-medium text-zinc-500 truncate mt-0.5">
              {card.clients?.name ?? card.quotations?.destination ?? card.group_trips?.title}
            </p>
          )}
        </div>

        {/* Footer */}
        {card.estimated_value && (
          <div className="pt-2 mt-2 border-t border-zinc-100 flex items-center justify-between">
            <p className={cn("text-[13px] font-extrabold tracking-tight", isHighValue ? "text-vj-green" : "text-zinc-600")}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                card.estimated_value,
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CardOverlay (DragOverlay visual) ── */
function CardOverlay({ card }: { card: KanbanCardData }) {
  return (
    <div className="kanban-card rotate-1 opacity-95 w-[256px] rounded-xl border-vj-primary border-2">
      <p className="font-medium text-sm text-vj-txt">{card.title}</p>
      {card.clients?.name && (
        <p className="text-xs text-vj-txt3 mt-1">{card.clients.name}</p>
      )}
    </div>
  );
}

/* ── QuickAddForm (inline por coluna) ── */
function QuickAddForm({
  boardId,
  columnId,
  onCancel,
}: {
  boardId: string;
  columnId: string;
  onCancel: () => void;
}) {
  const createCard = useCreateKanbanCard();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createCard.mutateAsync({
      board_id: boardId,
      column_id: columnId,
      title: title.trim(),
      assigned_to: user?.id ?? null,
    });
    setTitle('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-2">
      <Input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder="Título do card..."
        className="border-vj-border text-sm h-8 bg-white"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={!title.trim() || createCard.isPending}>
          {createCard.isPending ? '...' : 'Adicionar'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          <X size={14} />
        </Button>
      </div>
    </form>
  );
}

/* ── KanbanColumn ── */
function KanbanColumn({
  column,
  cards,
  boardId,
  onCardClick,
}: {
  column: KanbanColumnData;
  cards: KanbanCardData[];
  boardId: string;
  onCardClick: (card: KanbanCardData) => void;
}) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <div className="kanban-column">
      {/* Header com Glow Column */}
      <div className="kanban-column-header">
        <div className="flex items-center gap-2.5">
          {column.color && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 border border-zinc-200"
              style={{ backgroundColor: column.color }}
            />
          )}
          <span className="kanban-column-title">{column.name}</span>
        </div>
        <span className="kanban-column-count">{cards.length}</span>
      </div>

      {/* Cards */}
      <div className="kanban-cards" ref={setNodeRef}>
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Quick add */}
      <div className="kanban-quick-add">
        {showQuickAdd ? (
          <QuickAddForm
            boardId={boardId}
            columnId={column.id}
            onCancel={() => setShowQuickAdd(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 w-full text-xs text-vj-txt3 hover:text-vj-txt transition-colors py-1.5 px-2 rounded-xl hover:bg-vj-bg"
          >
            <Plus size={13} />
            Adicionar card
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function KanbanBoard() {
  const location = useLocation();
  const slug = location.pathname.includes('/departures') ? 'departures' : 'sales';
  const title = slug === 'departures' ? 'Gestão de Embarque' : 'Funil de Vendas';
  const description =
    slug === 'departures'
      ? 'Acompanhe o status dos embarques em andamento.'
      : 'Gerencie o pipeline de vendas e prospecções.';

  const { data, isLoading } = useKanbanBoard(slug);
  const updateCard = useUpdateKanbanCard();
  const ensureBoards = useEnsureDefaultBoards();
  useKanbanRealtime(data?.board?.id);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCardId = searchParams.get('card');

  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'me' | 'all'>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [localCards, setLocalCards] = useState<KanbanCardData[]>([]);

  useEffect(() => {
    if (data?.cards) setLocalCards(data.cards as KanbanCardData[]);
  }, [data?.cards]);

  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, KanbanCardData[]>();
    data?.columns?.forEach((col) => byColumn.set(col.id, []));
    localCards.forEach((card) => {
      if (viewMode === 'me' && card.assigned_to !== user?.id) return;
      const list = byColumn.get(card.column_id) ?? [];
      list.push(card);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data?.columns, localCards, viewMode, user?.id]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card as KanbanCardData);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Card';
    const isOverTask = over.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    if (isOverTask) {
      setLocalCards((cards) => {
        const activeIndex = cards.findIndex(t => t.id === activeId);
        const overIndex = cards.findIndex(t => t.id === overId);
        if (cards[activeIndex].column_id !== cards[overIndex].column_id) {
          const newCards = [...cards];
          newCards[activeIndex] = { ...newCards[activeIndex], column_id: cards[overIndex].column_id };
          return arrayMove(newCards, activeIndex, overIndex);
        }
        return arrayMove(cards, activeIndex, overIndex);
      });
    }

    if (isOverColumn) {
      setLocalCards((cards) => {
        const activeIndex = cards.findIndex(t => t.id === activeId);
        if (cards[activeIndex].column_id !== overId) {
          const newCards = [...cards];
          newCards[activeIndex] = { ...newCards[activeIndex], column_id: overId as string };
          return newCards;
        }
        return cards;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isOverColumn = over.data.current?.type === 'Column';
    let targetColumnId = over.id as string;

    if (!isOverColumn) {
      const overCard = data?.cards?.find((c) => c.id === over.id);
      if (overCard) targetColumnId = overCard.column_id;
    }

    const draggedCard = data?.cards?.find((c) => c.id === active.id);
    if (draggedCard && targetColumnId && draggedCard.column_id !== targetColumnId) {
      await updateCard.mutateAsync({ id: draggedCard.id, column_id: targetColumnId });
    }
  };

  const openCard = (card: KanbanCardData) => {
    setSearchParams({ card: card.id });
  };

  const closeCard = () => {
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <EmptyState
          icon={KanbanSquare}
          title="Erro ao carregar quadro"
          description="Não foi possível carregar os dados deste quadro. Verifique sua conexão ou permissões."
          action={<Button onClick={() => window.location.reload()}>Recarregar página</Button>}
        />
      </AppLayout>
    );
  }

  const totalCards = viewMode === 'me' 
    ? (data?.cards?.filter(c => c.assigned_to === user?.id).length ?? 0)
    : (data?.cards?.length ?? 0);

  return (
    <AppLayout fullHeight>
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader
          title={title}
          description={description}
          icon={KanbanSquare}
          badge={
            <StatusBadge variant="neutral" size="sm">
              {totalCards} cards
            </StatusBadge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'me' ? 'default' : 'outline'}
                className={viewMode === 'me' ? 'premium-button' : 'glass-button text-vj-txt3'}
                onClick={() => setViewMode('me')}
              >
                <Eye size={14} className="mr-2" /> Meu Board
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                className={viewMode === 'all' ? 'premium-button' : 'glass-button text-vj-txt3'}
                onClick={() => setViewMode('all')}
              >
                <Users size={14} className="mr-2" /> Geral
              </Button>
            </div>
          }
        />

        {!data?.columns?.length ? (
          <EmptyState
            icon={KanbanSquare}
            title="Quadro de vendas vazio"
            description="Recrie as colunas padrão (Novo Lead, Em Contato, Proposta, Negociando, Fechado, Perdido) automaticamente."
            action={
              <Button onClick={() => ensureBoards.mutate()} disabled={ensureBoards.isPending}>
                {ensureBoards.isPending ? 'Restaurando...' : 'Restaurar colunas padrão'}
              </Button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board flex-1 min-h-0">
              <SortableContext items={data.columns.map((c) => c.id)}>
                {data.columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column as KanbanColumnData}
                    cards={groupedCards.get(column.id) ?? []}
                    boardId={data.board.id}
                    onCardClick={openCard}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay>
              {activeCard ? <CardOverlay card={activeCard} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Universal Card Sheet — Prova de profundidade */}
        {selectedCardId && (
          <KanbanCardPage 
            isEmbedded={true} 
            embeddedId={selectedCardId} 
            onClose={closeCard} 
          />
        )}
      </div>
    </AppLayout>
  );
}
