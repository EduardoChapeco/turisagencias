import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useQuotations, useDeleteQuotation } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, MapPin, Hotel, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada', accepted: 'Aceita', expired: 'Expirada',
};
const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-accent/20 text-accent',
  viewed: 'bg-warning/20 text-warning',
  accepted: 'bg-success/20 text-success',
  expired: 'bg-destructive/20 text-destructive',
};

export default function Quotations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { data: quotations, isLoading } = useQuotations({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteQuotation = useDeleteQuotation();

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Cotações</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas cotações de viagem</p>
          </div>
          <Button onClick={() => navigate('/quotations/new')}>
            <Plus className="mr-2 h-4 w-4" /> Nova Cotação
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por destino..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviada</SelectItem>
              <SelectItem value="viewed">Visualizada</SelectItem>
              <SelectItem value="accepted">Aceita</SelectItem>
              <SelectItem value="expired">Expirada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : !quotations?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Nenhuma cotação encontrada</p>
              <p className="text-sm text-muted-foreground mb-4">Crie sua primeira cotação com extração por IA.</p>
              <Button onClick={() => navigate('/quotations/new')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Cotação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotations.map((q) => (
              <Card key={q.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/quotations/${q.id}`)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      {q.destination && (
                        <p className="font-medium flex items-center gap-1 truncate">
                          <MapPin className="h-4 w-4 text-accent shrink-0" /> {q.destination}
                        </p>
                      )}
                      {q.hotel_name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Hotel className="h-3 w-3 shrink-0" /> {q.hotel_name}
                          {q.hotel_stars && ` ${'⭐'.repeat(q.hotel_stars)}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={statusColors[q.status] || ''}>
                        {statusLabels[q.status] || q.status}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir cotação?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteQuotation.mutate(q.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {q.check_in && q.check_out && (
                      <p>{new Date(q.check_in).toLocaleDateString('pt-BR')} → {new Date(q.check_out).toLocaleDateString('pt-BR')}</p>
                    )}
                    {(q as any).clients?.name && <p className="text-xs">Cliente: {(q as any).clients.name}</p>}
                  </div>
                  <p className="text-lg font-bold font-heading text-primary">
                    {formatCurrency(q.total_value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
