import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useQuotations } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { QuotationAiImportSheet } from '@/components/QuotationAiImportSheet';
import { QuotationDetailSheet } from '@/components/QuotationDetailSheet';
import { Plus, Search, FileText, MapPin, Hotel, Calendar, Users, Sparkles, ArrowRight, ArrowUpRight, CheckCircle2, Navigation, FileSignature } from 'lucide-react';
import { getClientName } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/PageHeader';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  draft:    { color: 'bg-zinc-100 text-zinc-600 border-zinc-200',           label: 'Rascunho' },
  sent:     { color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Enviada' },
  viewed:   { color: 'bg-orange-50 text-orange-600 border-orange-100',       label: 'Visualizada' },
  confirmed: { color: 'bg-vj-green/10 text-vj-green border-vj-green/20', label: 'Confirmada' },
  expired:  { color: 'bg-red-50 text-red-600 border-red-100',             label: 'Expirada' },
};

export default function Quotations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [aiImportOpen, setAiImportOpen] = useState(false);
  const [detailSheet, setDetailSheet] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { data: allQuotations, isLoading } = useQuotations();

  const fmtCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const quotations = allQuotations ?? [];
  const filteredQuotations = quotations.filter(q => {
    const s = search.toLowerCase();
    const searchMatch = !s || (q.destination?.toLowerCase().includes(s) || q.hotel_name?.toLowerCase().includes(s) || (q.clients as Record<string, any>)?.name?.toLowerCase().includes(s));
    const statusMatch = statusFilter === 'all' || q.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'draft').length,
    sent: quotations.filter(q => q.status === 'sent').length,
    confirmed: quotations.filter(q => q.status === 'confirmed').length,
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto pb-10 px-3 sm:px-4">
        
        <PageHeader
          title="Propostas"
          description="Construtor comercial de cotações com hospedagem, transporte, passeios, valores, compartilhamento e aceite."
          icon={FileText}
          actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 rounded-full border-vj-border bg-white" onClick={() => setAiImportOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-vj-green" /> Extração IA
            </Button>
            <Button className="h-10 rounded-full" onClick={() => setBuilderOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Cotação
            </Button>
          </div>
          }
        />

        {/* Stats Row */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-1">
            <div className="premium-card p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-zinc-400 mb-2 mt-1">
                <FileText className="w-4 h-4" /> <span className="text-xs uppercase tracking-wider font-bold">Total</span>
              </div>
              <p className="text-2xl font-black text-zinc-800">{stats.total}</p>
            </div>
            <div className="premium-card border-zinc-200 bg-zinc-50/50 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-zinc-600 mb-2 mt-1">
                <FileSignature className="w-4 h-4" /> <span className="text-xs uppercase tracking-wider font-bold">Rascunhos</span>
              </div>
              <p className="text-2xl font-black text-zinc-700">{stats.draft}</p>
            </div>
            <div className="premium-card border-blue-200 bg-blue-50/50 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-blue-600 mb-2 mt-1">
                <Navigation className="w-4 h-4" /> <span className="text-xs uppercase tracking-wider font-bold">Enviadas</span>
              </div>
              <p className="text-2xl font-black text-blue-700">{stats.sent}</p>
            </div>
            <div className="premium-card border-vj-green/30 bg-vj-green/10 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-vj-green mb-2 mt-1">
                <CheckCircle2 className="w-4 h-4" /> <span className="text-xs uppercase tracking-wider font-bold">Confirmadas</span>
              </div>
              <p className="text-2xl font-black text-vj-green">{stats.confirmed}</p>
            </div>
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center justify-between pb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar destino ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-10 bg-white border-vj-border rounded-xl focus-visible:ring-vj-green"
            />
          </div>
          <div className="flex gap-2">
             {['all', 'draft', 'sent', 'confirmed'].map(f => (
               <Button 
                key={f}
                variant={statusFilter === f ? 'default' : 'outline'}
                size="sm"
                className="h-10 rounded-full px-4"
                onClick={() => setStatusFilter(f)}
               >
                 {f === 'all' ? 'Tudo' : f === 'draft' ? 'Rascunhos' : f === 'sent' ? 'Enviadas' : 'Confirmadas'}
               </Button>
             ))}
          </div>
        </div>

        {isLoading ? (
          <div className="bento-grid-premium">
             {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
          </div>
        ) : !filteredQuotations?.length ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma proposta encontrada"
            description="Tente ajustar os filtros ou comece criando sua primeira oferta."
            action={<Button className="premium-button" onClick={() => setBuilderOpen(true)}><Plus className="mr-2 h-4 w-4" /> Criar Proposta</Button>}
          />
        ) : (
          <div className="bento-grid-premium">
            {filteredQuotations.map((q) => {
              const clientName = getClientName(q.clients);
              const style = STATUS_STYLES[q.status] ?? STATUS_STYLES.draft;
              const coverImage = (q as Record<string, any>).cover_image_url;

              return (
                <div
                  key={q.id}
                  className="premium-card group overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => setDetailSheet({ open: true, id: q.id })}
                >
                  {/* Visual Header */}
                  <div className="relative h-40 bg-zinc-100 border-b border-zinc-100 overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt={q.destination || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-400">
                        <MapPin className="h-10 w-10 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{q.destination || 'Sem Destino'}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${style.color.replace('bg-', 'bg-')}`}>
                        {style.label}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm">
                       <p className="text-white text-sm font-bold truncate">{q.destination || "Roteiro Customizado"}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Users className="w-3 h-3" /> {clientName || "Cliente não vinculado"}
                      </div>
                      
                      {q.hotel_name && (
                        <div className="flex items-center gap-2 text-xs font-bold text-vj-txt uppercase tracking-wider line-clamp-1">
                          <Hotel className="w-3 h-3 text-vj-green" /> {q.hotel_name}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                        <Calendar className="w-3 h-3" />
                        {q.check_in ? new Date(q.check_in).toLocaleDateString('pt-BR') : 'A definir'}
                        <ArrowRight className="w-2 h-2" />
                        {q.check_out ? new Date(q.check_out).toLocaleDateString('pt-BR') : 'A definir'}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                       <span className="stat-value text-2xl text-vj-txt">
                        {fmtCurrency(q.total_value).split(',')[0]}
                        <span className="text-sm opacity-50">,00</span>
                       </span>
                       <Button variant="ghost" size="icon" className="group-hover:bg-vj-green/10 group-hover:text-vj-green rounded-xl transition-colors">
                          <ArrowUpRight className="w-5 h-5" />
                       </Button>
                    </div>
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
        onCreated={(id) => { setBuilderOpen(false); setDetailSheet({ open: true, id }); }}
      />

      <QuotationAiImportSheet
        open={aiImportOpen}
        onClose={() => setAiImportOpen(false)}
        onSuccess={(id) => { setAiImportOpen(false); setDetailSheet({ open: true, id }); }}
      />

      <QuotationDetailSheet
        id={detailSheet.id}
        open={detailSheet.open}
        onClose={() => setDetailSheet({ open: false, id: null })}
      />
    </AppLayout>
  );
}

