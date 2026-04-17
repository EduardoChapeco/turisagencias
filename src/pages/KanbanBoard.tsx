import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GripVertical, Plus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { KanbanCardSheet } from '@/components/kanban/KanbanCardSheet';
import { KanbanAiLeadDialog } from '@/components/kanban/KanbanAiLeadDialog';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard, useEnsureDefaultBoards, useKanbanRealtime } from '@/hooks/useKanbanBoards';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanSquare, X, Eye, Users } from 'lucide-react';

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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  trips?: { title: string | null } | null;
};

type KanbanColumnData = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string | null;
};

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

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
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-70 touch-none cursor-grab active:cursor-grabbing transition-opacity"
        aria-label="Arrastar card"
      >
        <GripVertical size={14} className="text-vj-txt3" />
      </button>

      <div className="pl-4 space-y-2">
        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-vj-green/10 text-vj-green border border-vj-green/20"
              >
                {t}
              </span>
            ))}
            {card.tags.length > 3 && (
              <span className="text-xs text-vj-txt3">+{card.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Título */}
        <p className="font-medium text-sm text-vj-txt leading-snug">{card.title}</p>

        {/* Subtítulo */}
        {(card.clients?.name || card.quotations?.destination) && (
          <p className="text-xs text-vj-txt3 truncate">
            {card.clients?.name ?? card.quotations?.destination}
          </p>
        )}

        {/* Footer */}
        {card.estimated_value && (
          <p className="text-xs font-semibold text-vj-green">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              card.estimated_value,
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── CardOverlay (DragOverlay visual) ── */
function CardOverlay({ card }: { card: KanbanCardData }) {
  return (
    <div className="kanban-card rotate-1 opacity-95 w-[256px]">
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
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createCard.mutateAsync({ board_id: boardId, column_id: columnId, title: title.trim() });
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
      {/* Header */}
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          {column.color && (
            <span
              className="h-2 w-2 rounded-full shrink-0"
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
            className="flex items-center gap-1.5 w-full text-xs text-vj-txt3 hover:text-vj-txt transition-colors py-1.5 px-2 rounded-cb-md hover:bg-vj-bg"
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
  const title = slug === 'departures' ? 'Embarques' : 'CRM';
  const description =
    slug === 'departures'
      ? 'Acompanhe o status dos embarques em andamento.'
      : 'Gerencie o pipeline de vendas e prospecções.';

  const { data, isLoading } = useKanbanBoard(slug);
  const updateCard = useUpdateKanbanCard();
  const ensureBoards = useEnsureDefaultBoards();
  useKanbanRealtime(data?.board?.id);

  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'me' | 'all'>('me');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, KanbanCardData[]>();
    data?.columns?.forEach((col) => byColumn.set(col.id, []));
    data?.cards?.forEach((card) => {
      if (viewMode === 'me' && card.assigned_to !== user?.id) return;
      const list = byColumn.get(card.column_id) ?? [];
      list.push(card as KanbanCardData);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data, viewMode, user?.id]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card as KanbanCardData);
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
    setSelectedCard(card);
    setSheetOpen(true);
  };

  if (isLoading || !data) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  const totalCards = viewMode === 'me' 
    ? (data?.cards?.filter(c => c.assigned_to === user?.id).length ?? 0)
    : (data?.cards?.length ?? 0);

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 pb-3 flex justify-between items-end">
          <PageHeader
            title={title}
            description={description}
            icon={KanbanSquare}
            badge={
              <StatusBadge variant="neutral" size="sm">
                {totalCards} cards
              </StatusBadge>
            }
          />
          <div className="flex flex-col items-end gap-3">
            <KanbanAiLeadDialog 
              boardId={data?.board?.id} 
              defaultColumnId={data?.columns?.[0]?.id} 
            />
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'me' | 'all')} className="w-[300px]">
               <TabsList className="grid w-full grid-cols-2">
                   <TabsTrigger value="me" className="flex items-center gap-2 text-xs">
                       <Eye size={14}/> Meu Board
                   </TabsTrigger>
                   <TabsTrigger value="all" className="flex items-center gap-2 text-xs">
                       <Users size={14}/> Geral (Todos)
                   </TabsTrigger>
               </TabsList>
            </Tabs>
          </div>
        </div>

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
      </div>

      {/* Sheet de detalhes */}
      <KanbanCardSheet
        card={selectedCard}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDeleted={() => setSelectedCard(null)}
      />
    </AppLayout>
  );
}
