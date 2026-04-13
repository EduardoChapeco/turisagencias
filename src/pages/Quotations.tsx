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
import { QuotationAiImportSheet } from '@/components/QuotationAiImportSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, MapPin, Hotel, Trash2, Calendar, Users, Sparkles } from 'lucide-react';
import { getClientName } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  draft:    { color: 'bg-vj-bg text-vj-txt2 border-vj-border',           label: 'Rascunho' },
  sent:     { color: 'bg-vj-blue-bg text-vj-blue border-[var(--blue)]/20', label: 'Enviada' },
  viewed:   { color: 'bg-vj-orange-bg text-vj-orange border-[var(--orange)]/20',       label: 'Visualizada' },
  accepted: { color: 'bg-vj-green-bg text-vj-green border-[var(--green)]/20', label: 'Aceita ✅' },
  expired:  { color: 'bg-vj-red-bg text-vj-red border-[var(--red)]/20',             label: 'Expirada' },
};

export default function Quotations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [aiImportOpen, setAiImportOpen] = useState(false);
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAiImportOpen(true)}
                className="border-vj-green text-vj-green hover:bg-vj-green/5 gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Cotação PDF IA
              </Button>
              <Button onClick={() => setBuilderOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Cotação
              </Button>
            </div>
          }
        />

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3" />
            <Input
              placeholder="Buscar por destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 border-vj-border bg-vj-bg rounded-[10px] h-[42px] text-[13px] text-vj-txt">
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
                  className="group relative rounded-[var(--r)] border border-vj-border bg-vj-white overflow-hidden hover:border-vj-txt3 transition-all cursor-pointer flex flex-col shadow-none"
                  onClick={() => navigate(`/quotations/${q.id}`)}
                >
                  {/* Cover image */}
                  <div className="relative h-[160px] bg-vj-bg overflow-hidden border-b border-vj-border">
                    {coverImage ? (
                      <img src={coverImage} alt={q.destination || ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-vj-border2" />
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
                  <div className="p-5 flex-1 space-y-2">
                    <div>
                      {q.destination && (
                        <p className="font-semibold text-vj-txt text-[16px] flex items-center gap-1.5 leading-tight">
                          {q.destination}
                        </p>
                      )}
                      {q.hotel_name && (
                        <p className="text-[13px] text-vj-txt2 flex items-center gap-1 mt-1">
                          <Hotel className="h-3 w-3 shrink-0" /> {q.hotel_name}
                          {q.hotel_stars ? ` ${'⭐'.repeat(Math.min(q.hotel_stars, 5))}` : ''}
                        </p>
                      )}
                    </div>

                    {(q.check_in || q.check_out) && (
                      <p className="text-[13px] text-vj-txt2 flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {q.check_in && new Date(q.check_in).toLocaleDateString('pt-BR')}
                        {q.check_out && ` → ${new Date(q.check_out).toLocaleDateString('pt-BR')}`}
                        {q.num_nights && ` (${q.num_nights}n)`}
                      </p>
                    )}

                    {clientName && (
                      <p className="text-[13px] text-vj-txt2 flex items-center gap-1">
                        <Users className="h-3 w-3 shrink-0" /> {clientName}
                      </p>
                    )}

                    {q.total_value && (
                      <p className="text-[18px] font-bold text-vj-txt mt-2">
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

      <QuotationAiImportSheet
        open={aiImportOpen}
        onClose={() => setAiImportOpen(false)}
        onSuccess={(id) => { setAiImportOpen(false); navigate(`/quotations/${id}`); }}
      />
    </AppLayout>
  );
}

