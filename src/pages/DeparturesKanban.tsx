import { useMemo, useState } from 'react';
import { Plus, GripVertical, X, Plane, KanbanSquare, Eye, Users, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard, useEnsureDefaultBoards, useKanbanRealtime } from '@/hooks/useKanbanBoards';
import { DepartureBoardCard, DepartureCardOverlay } from '@/components/kanban/DepartureBoardCard';
import { DepartureCardSheet } from '@/components/kanban/DepartureCardSheet';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

/* ── Calendar View ── */
function CalendarView({
  cards,
  onCardClick,
}: {
  cards: DepartureCardData[];
  onCardClick: (card: DepartureCardData) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear]   = useState(today.getFullYear());

  const firstDay = new Date(year, month, 1).getDay(); // 0=sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Map date string (YYYY-MM-DD) -> cards
  const byDate = useMemo(() => {
    const m = new Map<string, DepartureCardData[]>();
    cards.forEach(card => {
      const raw = (card as Record<string, unknown>).due_date as string | null
        ?? ((card as Record<string, unknown>).metadata as Record<string, unknown> | null)?.check_in_date as string | null;
      if (!raw) return;
      const d = raw.slice(0, 10);
      const list = m.get(d) ?? [];
      list.push(card);
      m.set(d, list);
    });
    return m;
  }, [cards]);

  const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DAYS_PT   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }

  return (
    <div className="rounded-xl border border-vj-border bg-white overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-vj-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-bold text-vj-txt">{MONTHS_PT[month]} {year}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-vj-border">
        {DAYS_PT.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-vj-txt3 uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isToday = cell.dateStr === today.toISOString().slice(0, 10);
          const dayCards = cell.dateStr ? (byDate.get(cell.dateStr) ?? []) : [];
          return (
            <div
              key={i}
              className={[
                'min-h-[80px] p-1 border-r border-b border-vj-border text-sm relative',
                !cell.day ? 'bg-vj-bg/50' : 'bg-white hover:bg-vj-bg/30 transition-colors',
                isToday ? 'bg-green-50' : '',
              ].join(' ')}
            >
              {cell.day && (
                <div className={[
                  'mb-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ml-auto',
                  isToday ? 'bg-vj-green text-white' : 'text-vj-txt3',
                ].join(' ')}>
                  {cell.day}
                </div>
              )}
              <div className="space-y-0.5">
                {dayCards.slice(0, 2).map(card => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => onCardClick(card)}
                    className="w-full text-left rounded-md px-1.5 py-0.5 text-[10px] leading-snug font-medium bg-vj-green/10 text-vj-green hover:bg-vj-green/20 transition-colors truncate block"
                    title={card.title}
                  >
                    ✈ {card.title}
                  </button>
                ))}
                {dayCards.length > 2 && (
                  <p className="text-[10px] text-vj-txt3 pl-1">+{dayCards.length - 2} mais</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      const da = ((a.metadata ?? (a as Record<string, any>).meta) as Record<string, any>)?.check_in_date;
      const db = ((b.metadata ?? (b as Record<string, any>).meta) as Record<string, any>)?.check_in_date;
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
  const ensureBoards = useEnsureDefaultBoards();
  useKanbanRealtime(data?.board?.id);

  const [activeCard, setActiveCard] = useState<DepartureCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<DepartureCardData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'me' | 'all'>('me');
  const [displayMode, setDisplayMode] = useState<'kanban' | 'calendar'>('kanban');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, DepartureCardData[]>();
    data?.columns?.forEach((col) => byColumn.set(col.id, []));
    data?.cards?.forEach((card) => {
      if (viewMode === 'me' && card.assigned_to !== user?.id) return;
      const list = byColumn.get(card.column_id) ?? [];
      list.push(card as DepartureCardData);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data, viewMode, user?.id]);

  // Total checkins upcoming in next 7 days
  const urgentCount = useMemo(() => {
    return data?.cards?.filter((c) => {
      if (viewMode === 'me' && c.assigned_to !== user?.id) return false;
      const date = ((c as Record<string, any>).metadata ?? (c as Record<string, any>).meta)?.check_in_date;
      if (!date) return false;
      const diff = Math.ceil((new Date(date + 'T00:00:00').getTime() - Date.now()) / 86400000);
      return diff >= 0 && diff <= 7;
    }).length ?? 0;
  }, [data, viewMode, user?.id]);

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

  const totalCards = viewMode === 'me' 
    ? (data?.cards?.filter(c => c.assigned_to === user?.id).length ?? 0)
    : (data?.cards?.length ?? 0);

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 pb-3">
          <div className="flex w-full justify-between items-end gap-3 flex-wrap">
            <PageHeader
              title="Embarques"
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

            <div className="flex items-center gap-2 flex-wrap">
              {/* Kanban | Calendar toggle */}
              <div className="flex rounded-lg border border-vj-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDisplayMode('kanban')}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                    displayMode === 'kanban' ? 'bg-vj-green text-white' : 'text-vj-txt3 hover:bg-vj-bg',
                  ].join(' ')}
                >
                  <KanbanSquare className="h-3.5 w-3.5" /> Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('calendar')}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-vj-border transition-colors',
                    displayMode === 'calendar' ? 'bg-vj-green text-white' : 'text-vj-txt3 hover:bg-vj-bg',
                  ].join(' ')}
                >
                  <CalendarDays className="h-3.5 w-3.5" /> Calendário
                </button>
              </div>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'me' | 'all')} className="w-[240px]">
                 <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="me" className="flex items-center gap-2 text-xs">
                         <Eye size={14}/> Meu Board
                     </TabsTrigger>
                     <TabsTrigger value="all" className="flex items-center gap-2 text-xs">
                         <Users size={14}/> Geral
                     </TabsTrigger>
                 </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {displayMode === 'calendar' ? (
          <div className="flex-1 overflow-auto pb-6">
            <CalendarView
              cards={[...(data?.cards ?? [])].filter(c =>
                viewMode === 'all' || c.assigned_to === user?.id
              ) as DepartureCardData[]}
              onCardClick={openCard}
            />
          </div>
        ) : !data?.columns?.length ? (
          <EmptyState
            icon={Plane}
            title="Quadro de embarques vazio"
            description="Recrie as colunas padrão (Documentação Pendente, Check-in, Embarque, Em Viagem, Retornaram) ou adicione cards manualmente."
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
