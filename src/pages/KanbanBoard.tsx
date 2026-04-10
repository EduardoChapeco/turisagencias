import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useCreateKanbanCard, useKanbanBoard, useUpdateKanbanCard } from '@/hooks/useKanbanBoards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCard({ card }: { card: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, data: { type: 'Card', card } });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="rounded-md border p-3 bg-white cursor-grab shadow-sm mb-2 hover:border-accent touch-none">
      <p className="font-medium text-sm">{card.title}</p>
      {card.description && <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>}
    </div>
  );
}

function KanbanColumn({ column, cards }: { column: any; cards: any[] }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  return (
    <Card className="min-h-[320px] bg-slate-50 flex flex-col items-stretch">
      <CardHeader className="p-4 pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold">{column.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 flex-1 flex flex-col" ref={setNodeRef}>
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 min-h-[50px]">
            {cards.map((card) => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export default function KanbanBoard() {
  const location = useLocation();
  const slug = location.pathname.includes('/departures') ? 'departures' : 'sales';
  const title = slug === 'departures' ? 'Kanban de Embarques' : 'Kanban de Vendas';
  const { data, isLoading } = useKanbanBoard(slug);
  const createCard = useCreateKanbanCard();
  const updateCard = useUpdateKanbanCard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const firstColumnId = data?.columns?.[0]?.id;
  const groupedCards = useMemo(() => {
    const byColumn = new Map<string, typeof data.cards>();
    data?.columns?.forEach((column) => byColumn.set(column.id, []));
    data?.cards?.forEach((card) => {
      const list = byColumn.get(card.column_id) ?? [];
      list.push(card);
      byColumn.set(card.column_id, list);
    });
    return byColumn;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveCard(event.active.data.current?.card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isOverColumn = over.data.current?.type === 'Column';
    let targetColumnId = overId as string;
    
    if (!isOverColumn) {
      // Find the column of the card we dragged over
      const overCard = data?.cards?.find(c => c.id === overId);
      if (overCard) targetColumnId = overCard.column_id;
    }

    const draggedCard = data?.cards?.find(c => c.id === activeId);
    
    if (draggedCard && targetColumnId && draggedCard.column_id !== targetColumnId) {
      // Optimizacao otimista omitida por simplicidade, atualizando no DB
      await updateCard.mutateAsync({ id: draggedCard.id, column_id: targetColumnId });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">Arraste e solte cards para gerenciar o pipeline.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!firstColumnId}>
                <Plus className="mr-2 h-4 w-4" /> Novo card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  disabled={!cardTitle || !data?.board || !firstColumnId || createCard.isPending}
                  onClick={async () => {
                    await createCard.mutateAsync({
                      board_id: data!.board.id,
                      column_id: firstColumnId!,
                      title: cardTitle,
                    });
                    setCardTitle('');
                    setDialogOpen(false);
                  }}
                >
                  {createCard.isPending ? 'Salvando...' : 'Criar card'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando board...</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6 items-start">
              <SortableContext items={data?.columns?.map(c => c.id) || []}>
                {data?.columns?.map((column) => (
                  <KanbanColumn key={column.id} column={column} cards={groupedCards.get(column.id) || []} />
                ))}
              </SortableContext>
            </div>
            <DragOverlay>
              {activeId && activeCard ? (
                <div className="rounded-md border p-3 bg-white shadow-lg rotate-2 opacity-90">
                  <p className="font-medium text-sm">{activeCard.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </AppLayout>
  );
}
