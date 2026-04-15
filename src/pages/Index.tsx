import { useNavigate } from 'react-router-dom';
import {
  FileText, Plane, PlaneTakeoff, TicketCheck, CalendarHeart, Activity,
  KanbanSquare, Users, Globe2, TrendingUp, AlertTriangle, ArrowRight, DollarSign, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Simulated Financial Data for the Chart (Real world would group by month)
const financialChartData = [
  { month: 'Jan', receivable: 4000, payable: 2400 },
  { month: 'Fev', receivable: 3000, payable: 1398 },
  { month: 'Mar', receivable: 2000, payable: 9800 },
  { month: 'Abr', receivable: 2780, payable: 3908 },
  { month: 'Mai', receivable: 1890, payable: 4800 },
  { month: 'Jun', receivable: 2390, payable: 3800 },
  { month: 'Jul', receivable: 3490, payable: 4300 },
];

function useDashboardStats(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const today = new Date().toISOString().split('T')[0];

      const [tripsRes, quotationsRes, ticketsRes, clientsRes, departuresTodayRes, transRes] = await Promise.all([
        supabase.from('trips').select('id, status', { count: 'exact' }).eq('org_id', orgId).neq('status', 'cancelled'),
        supabase.from('quotations').select('id, status', { count: 'exact' }).eq('org_id', orgId).in('status', ['draft', 'sent']),
        supabase.from('tickets').select('id, priority', { count: 'exact' }).eq('org_id', orgId).eq('status', 'open'),
        supabase.from('clients').select('id', { count: 'exact' }).eq('org_id', orgId),
        supabase.from('trips').select('id', { count: 'exact' }).eq('org_id', orgId).eq('departure_date', today),
        supabase.from('financial_transactions').select('amount, type, status').eq('org_id', orgId).neq('status', 'canceled')
      ]);

      const transactions = transRes.data || [];
      const totalReceivable = transactions.filter(t => t.type === 'receivable').reduce((acc, t) => acc + t.amount, 0);
      const totalPayable = transactions.filter(t => t.type === 'payable').reduce((acc, t) => acc + t.amount, 0);
      const operationalProfit = totalReceivable - totalPayable;

      return {
        activeTrips: tripsRes.count || 0,
        pendingQuotations: quotationsRes.count || 0,
        openTickets: ticketsRes.count || 0,
        totalClients: clientsRes.count || 0,
        departuresToday: departuresTodayRes.count || 0,
        urgentTickets: (ticketsRes.data || []).filter((t: any) => t.priority === 'urgent').length,
        finances: { receivable: totalReceivable, payable: totalPayable, profit: operationalProfit }
      };
    },
    enabled: !!orgId,
    staleTime: 60 * 1000, 
  });
}

function useRecentActivity(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-activity', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('tickets')
        .select('id, title, status, created_at')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(4);
      return data || [];
    },
    enabled: !!orgId,
  });
}

function useUpcomingTrips(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-upcoming', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const today = new Date().toISOString().split('T')[0];
      const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('trips')
        .select('id, title, departure_date, destination_city, destination_country, clients(name)')
        .eq('org_id', orgId)
        .gte('departure_date', today)
        .lte('departure_date', in7days)
        .order('departure_date')
        .limit(4);
      return data || [];
    },
    enabled: !!orgId,
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { organization, profile } = useAuthStore();
  const { data: stats, isLoading } = useDashboardStats(organization?.id);
  const { data: activity } = useRecentActivity(organization?.id);
  const { data: upcoming } = useUpcomingTrips(organization?.id);
  
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b pb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-vj-green">{profile?.first_name || 'Agente'}</span> ✈️
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Painel C-Level da <span className="font-semibold">{organization?.name || 'sua agência'}</span> — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/new')} className="rounded-xl">
              <Plane className="h-4 w-4 mr-2" /> Nova Viagem
            </Button>
            <Button size="sm" onClick={() => setQuotationBuilderOpen(true)}>
              <FileText className="h-4 w-4 mr-2" /> Nova Cotação
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
             <Skeleton className="h-[250px] rounded-3xl" />
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-[140px] rounded-3xl" />)}
             </div>
          </div>
        ) : (
          <>
            {/* NOVO DASHBOARD FINANCEIRO C-LEVEL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              
              {/* Resumo Financeiro KPI's */}
              <div className="lg:col-span-1 bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                 <div>
                   <h2 className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-2 flex items-center gap-2"><DollarSign size={16}/> Resumo Operacional</h2>
                   <p className="text-4xl font-bold font-heading">
                     {formatCurrency(stats?.finances.profit ?? 0)}
                   </p>
                   <p className="text-xs opacity-70 mt-1 mb-8">Lucro residual projetado (Receitas - Custos)</p>

                   <div className="space-y-4">
                     <div className="bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                       <p className="text-xs opacity-70 flex items-center gap-1"><ArrowUpRight size={14} className="text-green-400"/> A Receber e Recebidos</p>
                       <p className="text-xl font-bold mt-1 text-green-400">{formatCurrency(stats?.finances.receivable ?? 0)}</p>
                     </div>
                     <div className="bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                       <p className="text-xs opacity-70 flex items-center gap-1"><ArrowDownRight size={14} className="text-red-400"/> A Pagar Fornecedores</p>
                       <p className="text-xl font-bold mt-1 text-red-400">{formatCurrency(stats?.finances.payable ?? 0)}</p>
                     </div>
                   </div>
                 </div>
                 
                 <Button variant="secondary" className="w-full rounded-xl mt-6 font-bold bg-white/10 hover:bg-white/20 text-white border-0" onClick={() => navigate('/finance/transactions')}>
                   Abrir Financeiro Completo
                 </Button>
              </div>

              {/* Gráfico Recharts */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border rounded-3xl p-6 shadow-sm flex flex-col">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Fluxo de Caixa (YTD 2026)</h2>
                 <div className="flex-1 w-full min-h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} tickFormatter={(v) => `R$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area type="monotone" dataKey="receivable" name="Recebível" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                      <Area type="monotone" dataKey="payable" name="Pagável" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPay)" />
                    </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

            </div>

            {/* Bento Grid Principal (CRM & Operacional) */}
            <div className="bento-grid auto-rows-[140px] md:grid-cols-4 grid-cols-1 mt-6">

              {/* Embarques Hoje — clickable */}
              <BentoBlock
                className="col-span-1 row-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-vj-green/20 cursor-pointer hover:from-primary/20 hover:border-vj-green/20"
                onClick={() => navigate('/trips')}
              >
                <BentoHeader title="Embarques Hoje" icon={<PlaneTakeoff className="h-5 w-5 text-vj-green" />} />
                <div className="mt-auto">
                  <span className="font-heading text-5xl font-bold text-vj-green">{stats?.departuresToday ?? 0}</span>
                  <p className="text-xs text-muted-foreground mt-1">viagens partindo hoje</p>
                </div>
              </BentoBlock>

              {/* Cotações Abertas */}
              <BentoBlock
                className="col-span-1 row-span-1 bg-amber-500/5 border-amber-500/20 cursor-pointer hover:bg-amber-500/10"
                onClick={() => navigate('/quotations')}
              >
                <BentoHeader title="Cotações Abertas" icon={<FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />} />
                <div className="mt-auto">
                  <span className="font-heading text-5xl font-bold text-amber-600 dark:text-amber-400">{stats?.pendingQuotations ?? 0}</span>
                  <p className="text-xs text-muted-foreground mt-1">aguardando fechamento</p>
                </div>
              </BentoBlock>

              {/* Kanban Preview (2x2) */}
              <BentoBlock className="col-span-1 md:col-span-2 row-span-2 overflow-hidden relative cursor-pointer group" onClick={() => navigate('/kanban/sales')}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-500/5 -z-10" />
                <BentoHeader title="Pipeline de Vendas" icon={<KanbanSquare className="h-5 w-5 text-accent" />} />
                <div className="mt-3 flex gap-2 flex-1 overflow-hidden">
                  {['Novo Lead', 'Proposta', 'Aprovado'].map((col, i) => (
                    <div key={col} className="flex-1 bg-muted/40 rounded-xl p-2 border border-vj-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">{col}</p>
                      <div className={`h-14 rounded-lg border shadow-sm flex items-center justify-center ${i === 1 ? 'bg-accent/10 border-accent/20' : i === 2 ? 'bg-green-500/10 border-green-500/20' : 'bg-card border-vj-border'}`}>
                        <span className="text-[10px] text-muted-foreground/60">Ver pipeline →</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground group-hover:text-accent transition-colors flex items-center gap-1">
                  Abrir Kanban <ArrowRight className="h-3 w-3" />
                </div>
              </BentoBlock>

              {/* Próximos Embarques */}
              <BentoBlock className="col-span-1 md:col-span-2 row-span-1 overflow-hidden">
                <BentoHeader title="Próximos 7 Dias" icon={<CalendarHeart className="h-5 w-5 text-purple-500" />} />
                <div className="mt-2 space-y-1.5 overflow-hidden flex-1">
                  {!upcoming?.length ? (
                    <p className="text-xs text-muted-foreground py-1">Nenhum embarque programado.</p>
                  ) : upcoming.slice(0, 3).map((trip: any) => (
                    <button key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="w-full flex items-center justify-between text-xs rounded-lg bg-muted/40 px-2 py-1.5 hover:bg-muted/70 transition-colors text-left">
                      <span className="font-medium truncate max-w-[150px]">{trip.title}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {new Date(trip.departure_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </button>
                  ))}
                </div>
              </BentoBlock>

            </div>
          </>
        )}
      </div>

      <QuotationBuilderSheet 
        open={quotationBuilderOpen} 
        onClose={() => setQuotationBuilderOpen(false)} 
      />
    </AppLayout>
  );
}

function BentoBlock({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bento-cell p-5 flex flex-col ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function BentoHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between w-full mb-1">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="opacity-80 drop-shadow-sm">{icon}</div>
    </div>
  );
}
