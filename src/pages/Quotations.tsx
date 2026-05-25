import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useQuotations } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { QuotationAiImportSheet } from '@/components/QuotationAiImportSheet';
import { QuotationDetailSheet } from '@/components/QuotationDetailSheet';
import { 
  Plus, Search, FileText, MapPin, Hotel, Calendar, Users, Sparkles, 
  ArrowRight, ArrowUpRight, CheckCircle2, Navigation, FileSignature,
  Zap, BrainCircuit, ShieldCheck, Activity
} from 'lucide-react';
import { getClientName } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/PageHeader';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  draft:    { color: 'bg-zinc-100 text-zinc-600 border-zinc-200',           label: 'Rascunho' },
  sent:     { color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Enviada' },
  viewed:   { color: 'bg-orange-50 text-orange-600 border-orange-100',       label: 'Visualizada' },
  confirmed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Confirmada' },
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
      <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
        
        <PageHeader
          title="Propostas & Cotações"
          description="Crie e gerencie propostas comerciais, extraia com IA e acompanhe o pipeline."
          icon={FileText}
          actions={
            <div className="flex items-center gap-2 w-full flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px] max-w-xs group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3 group-focus-within:text-vj-green transition-colors" />
                <Input
                  placeholder="Buscar proposta..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-vj-border"
                />
              </div>
              {/* Status filters */}
              <div className="flex items-center gap-2 shrink-0">
                {(['all', 'draft', 'sent', 'confirmed'] as const).map(f => (
                  <Button
                    key={f}
                    variant={statusFilter === f ? 'default' : 'outline'}
                    className={statusFilter === f ? 'premium-button' : 'glass-button text-vj-txt3'}
                    onClick={() => setStatusFilter(f)}
                  >
                    {f === 'all' ? 'Tudo' : f === 'draft' ? 'Rascunhos' : f === 'sent' ? 'Enviadas' : 'Fechadas'}
                  </Button>
                ))}
              </div>
              <Button variant="outline" className="glass-button shrink-0" onClick={() => setAiImportOpen(true)}>
                <Zap className="h-4 w-4 mr-2 text-vj-green" /> Importar com IA
              </Button>
              <Button className="premium-button shrink-0" onClick={() => setBuilderOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Nova Proposta
              </Button>
            </div>
          }
        />
        {/* Métricas do pipeline */}
        {!isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bento-card bg-white p-5 border-vj-border/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400"><FileText className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-txt3">Total no Funil</span>
              </div>
              <p className="text-3xl font-black text-vj-txt tracking-tighter">{stats.total}</p>
            </div>
            <div className="bento-card bg-white p-5 border-vj-border/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Navigation className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Em Aberto</span>
              </div>
              <p className="text-3xl font-black text-blue-700 tracking-tighter">{stats.sent}</p>
            </div>
            <div className="bento-card p-5 border-vj-green/20 bg-vj-green/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-vj-green/10 rounded-xl text-vj-green"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-green">Confirmadas</span>
              </div>
              <p className="text-3xl font-black text-vj-green tracking-tighter">{stats.confirmed}</p>
            </div>
            <div className="bento-card bg-vj-bg-dark text-white p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-xl text-white"><Activity className="w-4 h-4" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Conversão</span>
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">
                {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* 🧩 QUOTATION CARDS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-[360px] rounded-[2rem]" />)}
          </div>
        ) : !filteredQuotations?.length ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma proposta encontrada"
            description="O esquadrão cognitivo está pronto para ajudar você a criar novas ofertas."
            action={<Button className="premium-button" onClick={() => setBuilderOpen(true)}>Criar Proposta</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredQuotations.map((q) => {
              const clientName = getClientName(q.clients);
              const style = STATUS_STYLES[q.status] ?? STATUS_STYLES.draft;
              const coverImage = (q as Record<string, any>).cover_image_url;

              return (
                <div
                  key={q.id}
                  className="bento-card bg-white overflow-hidden flex flex-col group cursor-pointer border-vj-border/60 hover:border-vj-green/40"
                  onClick={() => setDetailSheet({ open: true, id: q.id })}
                >
                  <div className="relative h-44 bg-zinc-50 overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt={q.destination || ''} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                        <MapPin className="h-10 w-10 mb-2 opacity-30" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md  ${style.color.replace('bg-', 'bg-white/80 ')}`}>
                        {style.label}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                       <p className="text-white text-sm font-black truncate tracking-tight">{q.destination || "Personalizado"}</p>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] text-vj-txt2 font-black uppercase tracking-wider">
                           <Users className="w-3.5 h-3.5 text-vj-green" /> {clientName?.split(' ')[0] || "Avulso"}
                         </div>
                         <div className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border">
                           {q.code || 'COT-PENDENTE'}
                         </div>
                      </div>
                      
                      {q.hotel_name && (
                        <div className="flex items-center gap-2 text-xs font-bold text-vj-txt leading-tight line-clamp-1">
                          <Hotel className="w-3.5 h-3.5 text-vj-txt3" /> {q.hotel_name}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-bold text-vj-txt3 uppercase tracking-tighter bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100/50">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {q.check_in ? new Date(q.check_in).toLocaleDateString('pt-BR') : 'A definir'}</div>
                        <ArrowRight className="w-2.5 h-2.5 opacity-30" />
                        <div>{q.check_out ? new Date(q.check_out).toLocaleDateString('pt-BR') : 'A definir'}</div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-vj-border/40 flex items-center justify-between">
                       <div>
                         <p className="text-[9px] font-black text-vj-txt3 uppercase tracking-widest mb-1">Total Sugerido</p>
                         <span className="text-2xl font-black text-vj-txt tracking-tighter">
                          {fmtCurrency(q.total_value).split(',')[0]}
                          <span className="text-sm opacity-30">,00</span>
                         </span>
                       </div>
                       <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl group-hover:bg-vj-green group-hover:text-white transition-all duration-300">
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
        open={builderOpen} onClose={() => setBuilderOpen(false)}
        onCreated={(id) => { setBuilderOpen(false); setDetailSheet({ open: true, id }); }}
      />
      <QuotationAiImportSheet
        open={aiImportOpen} onClose={() => setAiImportOpen(false)}
        onSuccess={(id) => { setAiImportOpen(false); setDetailSheet({ open: true, id }); }}
      />
      <QuotationDetailSheet
        id={detailSheet.id} open={detailSheet.open}
        onClose={() => setDetailSheet({ open: false, id: null })}
      />
    </AppLayout>
  );
}
