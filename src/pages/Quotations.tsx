import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useQuotations, useDeleteQuotation } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, MapPin, Hotel, Trash2, Calendar, Users } from 'lucide-react';
import { getClientName } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  draft:    { color: 'bg-cb-s2 text-cb-muted border-cb-border',           label: 'Rascunho' },
  sent:     { color: 'bg-cb-accent/10 text-cb-accent border-cb-accent/20', label: 'Enviada' },
  viewed:   { color: 'bg-amber-100 text-amber-700 border-amber-200',       label: 'Visualizada' },
  accepted: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Aceita ✅' },
  expired:  { color: 'bg-red-100 text-red-700 border-red-200',             label: 'Expirada' },
};

export default function Quotations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const navigate = useNavigate();

  const { data: quotations, isLoading } = useQuotations({
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const deleteQuotation = useDeleteQuotation();

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Cotações"
          description="Construtor ultra-personalizado de orçamentos de viagem"
          icon={FileText}
          badge={<StatusBadge variant="neutral" size="sm">{quotations?.length ?? 0} cotações</StatusBadge>}
          actions={
            <Button onClick={() => setBuilderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Cotação
            </Button>
          }
        />

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cb-muted" />
            <Input
              placeholder="Buscar por destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-cb-border bg-cb-s1"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 border-cb-border bg-cb-s1">
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
          <PageSkeleton />
        ) : !quotations?.length ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma cotação encontrada"
            description="Crie cotações ultra-personalizadas com itinerário, transportes, passeios e muito mais."
            action={<Button onClick={() => setBuilderOpen(true)}><Plus className="mr-2 h-4 w-4" /> Criar Cotação</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quotations.map((q) => {
              const clientName = getClientName(q.clients);
              const style = STATUS_STYLES[q.status] ?? STATUS_STYLES.draft;
              const coverImage = (q as any).cover_image_url;

              return (
                <div
                  key={q.id}
                  className="group relative rounded-2xl border border-cb-border bg-cb-s0 overflow-hidden hover:border-cb-accent/30 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                  onClick={() => navigate(`/quotations/${q.id}`)}
                >
                  {/* Cover image */}
                  <div className="relative h-36 bg-gradient-to-br from-cb-accent/20 to-cb-s2 overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt={q.destination || ''} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-cb-muted/20" />
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`text-xs border ${style.color}`}>{style.label}</Badge>
                    </div>
                    {/* Delete button */}
                    <div
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/80 hover:bg-white hover:text-red-500 text-gray-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir cotação?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 text-white" onClick={() => deleteQuotation.mutate(q.id)}>Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 space-y-2">
                    <div>
                      {q.destination && (
                        <p className="font-bold text-cb-text flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-cb-accent shrink-0" /> {q.destination}
                        </p>
                      )}
                      {q.hotel_name && (
                        <p className="text-xs text-cb-muted flex items-center gap-1 mt-0.5">
                          <Hotel className="h-3 w-3 shrink-0" /> {q.hotel_name}
                          {q.hotel_stars ? ` ${'⭐'.repeat(Math.min(q.hotel_stars, 5))}` : ''}
                        </p>
                      )}
                    </div>

                    {(q.check_in || q.check_out) && (
                      <p className="text-xs text-cb-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {q.check_in && new Date(q.check_in).toLocaleDateString('pt-BR')}
                        {q.check_out && ` → ${new Date(q.check_out).toLocaleDateString('pt-BR')}`}
                        {q.num_nights && ` (${q.num_nights}n)`}
                      </p>
                    )}

                    {clientName && (
                      <p className="text-xs text-cb-muted flex items-center gap-1">
                        <Users className="h-3 w-3 shrink-0" /> {clientName}
                      </p>
                    )}

                    {q.total_value && (
                      <p className="text-xl font-bold font-heading text-cb-accent">
                        {formatCurrency(q.total_value, q.currency ?? 'BRL')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QuotationBuilderSheet
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
      />
    </AppLayout>
  );
}

