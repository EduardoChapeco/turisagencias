import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useCreateKanbanCard, useKanbanBoard } from '@/hooks/useKanbanBoards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function KanbanBoard() {
  const location = useLocation();
  const slug = location.pathname.includes('/departures') ? 'departures' : 'sales';
  const title = slug === 'departures' ? 'Kanban de Embarques' : 'Kanban de Vendas';
  const { data, isLoading } = useKanbanBoard(slug);
  const createCard = useCreateKanbanCard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState('');

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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">Board organizado com a estrutura padrão do VoyageOS.</p>
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
          <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {data?.columns?.map((column) => (
              <Card key={column.id} className="min-h-[320px]">
                <CardHeader>
                  <CardTitle className="text-base">{column.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!groupedCards.get(column.id)?.length && (
                    <p className="text-sm text-muted-foreground">Sem cards nesta coluna.</p>
                  )}
                  {groupedCards.get(column.id)?.map((card) => (
                    <div key={card.id} className="rounded-md border p-3">
                      <p className="font-medium">{card.title}</p>
                      {card.description && <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
