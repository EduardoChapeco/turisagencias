import { useMemo, useState } from 'react';
import { Plus, CheckSquare, Eye, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard, useEnsureDefaultBoards, useKanbanRealtime } from '@/hooks/useKanbanBoards';
import { useAuthStore } from '@/stores/authStore';
import { TaskBoardCard, TaskCardOverlay } from '@/components/kanban/TaskBoardCard';
import { TaskCardSheet } from '@/components/kanban/TaskCardSheet';
import type { TaskCardData } from '@/components/kanban/TaskBoardCard';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createCard.mutateAsync({ 
      board_id: boardId, 
      column_id: columnId, 
      title: title.trim(),
    } as Record<string, any>);
    setTitle('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-2">
      <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder="Título da tarefa..." className="border-vj-border text-sm h-8 bg-white" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1" disabled={!title.trim() || createCard.isPending}>
          {createCard.isPending ? '...' : 'Adicionar'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>✕</Button>
      </div>
    </form>
  );
}

/* ── Task Column ── */
function TaskColumn({ column, cards, boardId, onCardClick }: { column: KanbanColumnData; cards: TaskCardData[]; boardId: string; onCardClick: (card: TaskCardData) => void }) {
  const { setNodeRef } = useSortable({ id: column.id, data: { type: 'Column', column } });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Sort: cards ordered by position, or fallback to due_date
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
       const da = a.due_date;
       const db = b.due_date;
       if (!da && !db) return 0;
       if (!da) return 1;
       if (!db) return -1;
       return da.localeCompare(db);
    });
  }, [cards]);

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          {column.color && <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />}
          <span className="kanban-column-title">{column.name}</span>
        </div>
        <span className="kanban-column-count">{cards.length}</span>
      </div>

      <div className="kanban-cards" ref={setNodeRef}>
        <SortableContext items={sortedCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <TaskBoardCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      <div className="kanban-quick-add">
        {showQuickAdd ? (
          <QuickAddForm boardId={boardId} columnId={column.id} onCancel={() => setShowQuickAdd(false)} />
        ) : (
          <button type="button" onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 w-full text-xs text-vj-txt3 hover:text-vj-txt transition-colors py-1.5 px-2 rounded-cb-md hover:bg-vj-bg">
            <Plus size={13} /> Adicionar Tarefa
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TasksKanban() {
  const { data, isLoading } = useKanbanBoard('tasks');
  const updateCard = useUpdateKanbanCard();
  const ensureBoards = useEnsureDefaultBoards();
  useKanbanRealtime(data?.board?.id);
  const { user } = useAuthStore();

  const [activeCard, setActiveCard] = useState<TaskCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<TaskCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Filter state: 'me' vs 'all'
  const [viewMode, setViewMode] = useState<'me' | 'all'>('me');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, TaskCardData[]>();
    data?.columns?.forEach((col) => byColumn.set(col.id, []));
    
    data?.cards?.forEach((card) => {
      // Filter logic
      if (viewMode === 'me' && card.assigned_to !== user?.id) {
         return; // skip if doesn't belong to me
      }

      const list = byColumn.get(card.column_id) ?? [];
      list.push(card as unknown as TaskCardData);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data, viewMode, user?.id]);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') {
        setActiveCard(event.active.data.current.card as TaskCardData);
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

  if (isLoading) {
    return <AppLayout><PageSkeleton /></AppLayout>;
  }

  const myCardsCount = data?.cards?.filter(c => c.assigned_to === user?.id).length ?? 0;
  const allCardsCount = data?.cards?.length ?? 0;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 pb-3 flex justify-between items-end">
          <PageHeader
            title="Minhas Tarefas"
            description="Organize o seu dia. Tickets e tarefas vinculadas caem aqui."
            icon={CheckSquare}
            badge={
              <StatusBadge variant="neutral" size="sm">
                {viewMode === 'me' ? myCardsCount : allCardsCount} tarefas
              </StatusBadge>
            }
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

        {!data?.columns?.length ? (
          <EmptyState
            icon={CheckSquare}
            title="Quadro de tarefas vazio"
            description="Recrie as colunas padrão (A Fazer, Em Progresso, Revisão, Concluído) automaticamente."
            action={
              <Button onClick={() => ensureBoards.mutate()} disabled={ensureBoards.isPending}>
                {ensureBoards.isPending ? 'Restaurando...' : 'Restaurar colunas padrão'}
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="kanban-board flex-1 min-h-0">
              <SortableContext items={data.columns.map((c) => c.id)}>
                {data.columns.map((column) => (
                  <TaskColumn key={column.id} column={column as KanbanColumnData} cards={groupedCards.get(column.id) ?? []} boardId={data.board.id} onCardClick={(c) => { setSelectedCard(c); setSheetOpen(true); }} />
                ))}
              </SortableContext>
            </div>
            <DragOverlay>{activeCard ? <TaskCardOverlay card={activeCard} /> : null}</DragOverlay>
          </DndContext>
        )}
      </div>

      <TaskCardSheet card={selectedCard} isOpen={sheetOpen} onClose={() => setSheetOpen(false)} onDeleted={() => setSelectedCard(null)} />
    </AppLayout>
  );
}
