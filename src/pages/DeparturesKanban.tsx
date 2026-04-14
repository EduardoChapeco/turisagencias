import { useMemo, useState } from 'react';
import { Plus, GripVertical, X, Plane, KanbanSquare } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard } from '@/hooks/useKanbanBoards';
import { DepartureBoardCard, DepartureCardOverlay } from '@/components/kanban/DepartureBoardCard';
import { DepartureCardSheet } from '@/components/kanban/DepartureCardSheet';
import type { DepartureCardData } from '@/components/kanban/DepartureBoardCard';

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
import { cn } from '@/lib/utils';

/* ── Column type ── */
type KanbanColumnData = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string | null;
};

/* ── QuickAdd Form ── */
function QuickAddForm({ boardId, columnId, onCancel }: { boardId: string; columnId: string; onCancel: () => void }) {
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
      <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder="Nome do cliente / embarque..." className="border-vj-border text-sm h-8 bg-white" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={!title.trim() || createCard.isPending}>
          {createCard.isPending ? '...' : 'Adicionar'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}><X size={14} /></Button>
      </div>
    </form>
  );
}

/* ── Departure Column ── */
function DepartureColumn({
  column,
  cards,
  boardId,
  onCardClick,
}: {
  column: KanbanColumnData;
  cards: DepartureCardData[];
  boardId: string;
  onCardClick: (card: DepartureCardData) => void;
}) {
  const { setNodeRef } = useSortable({ id: column.id, data: { type: 'Column', column } });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Sort: cards with check_in_date first, ordered by date ascending
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const da = ((a.metadata ?? (a as any).meta) as any)?.check_in_date;
      const db = ((b.metadata ?? (b as any).meta) as any)?.check_in_date;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });
  }, [cards]);

  return (
    <div className="kanban-column">
      {/* Header */}
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          {column.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />}
          <span className="kanban-column-title">{column.name}</span>
        </div>
        <span className="kanban-column-count">{cards.length}</span>
      </div>

      {/* Cards */}
      <div className="kanban-cards" ref={setNodeRef}>
        <SortableContext items={sortedCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <DepartureBoardCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      {/* Quick add */}
      <div className="kanban-quick-add">
        {showQuickAdd ? (
          <QuickAddForm boardId={boardId} columnId={column.id} onCancel={() => setShowQuickAdd(false)} />
        ) : (
          <button type="button" onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 w-full text-xs text-vj-txt3 hover:text-vj-txt transition-colors py-1.5 px-2 rounded-cb-md hover:bg-vj-bg">
            <Plus size={13} /> Adicionar embarque
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function DeparturesKanban() {
  const { data, isLoading } = useKanbanBoard('departures');
  const updateCard = useUpdateKanbanCard();

  const [activeCard, setActiveCard] = useState<DepartureCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<DepartureCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, DepartureCardData[]>();
    data?.columns?.forEach((col) => byColumn.set(col.id, []));
    data?.cards?.forEach((card) => {
      const list = byColumn.get(card.column_id) ?? [];
      list.push(card as DepartureCardData);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data]);

  // Total checkins upcoming in next 7 days
  const urgentCount = useMemo(() => {
    return data?.cards?.filter((c) => {
      const date = ((c as any).metadata ?? (c as any).meta)?.check_in_date;
      if (!date) return false;
      const diff = Math.ceil((new Date(date + 'T00:00:00').getTime() - Date.now()) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length ?? 0;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card as DepartureCardData);
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

  const openCard = (card: DepartureCardData) => {
    setSelectedCard(card);
    setSheetOpen(true);
  };

  if (isLoading) {
    return <AppLayout><PageSkeleton /></AppLayout>;
  }

  const totalCards = data?.cards?.length ?? 0;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 pb-3">
          <PageHeader
            title="Gestor de Embarques"
            description="Acompanhe check-ins, localizadores aéreos e pacotes de viagem em tempo real."
            icon={Plane}
            badge={
              <div className="flex items-center gap-2">
                <StatusBadge variant="neutral" size="sm">
                  {totalCards} embarques
                </StatusBadge>
                {urgentCount > 0 && (
                  <StatusBadge variant="warning" size="sm">
                    ⚠️ {urgentCount} em 7 dias
                  </StatusBadge>
                )}
              </div>
            }
          />
        </div>

        {!data?.columns?.length ? (
          <EmptyState
            icon={Plane}
            title="Nenhuma coluna configurada"
            description="O board de embarques está sendo preparado. Tente recarregar a página."
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
                  <DepartureColumn
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
              {activeCard ? <DepartureCardOverlay card={activeCard} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <DepartureCardSheet
        card={selectedCard}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDeleted={() => setSelectedCard(null)}
      />
    </AppLayout>
  );
}
