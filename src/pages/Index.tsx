import { useNavigate } from 'react-router-dom';
import {
  FileText, Plane, PlaneTakeoff, CalendarHeart,
  KanbanSquare, ArrowRight, DollarSign, ArrowUpRight, ArrowDownRight, Users2
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

const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function useFinancialChart(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-chart', orgId],
    queryFn: async () => {
      if (!orgId) return MONTH_LABELS.map(m => ({ month: m, receivable: 0, payable: 0 }));
      const year = new Date().getFullYear();
      const { data } = await supabase
        .from('financial_transactions')
        .select('amount, type, due_date')
        .eq('org_id', orgId)
        .gte('due_date', `${year}-01-01`)
        .lte('due_date', `${year}-12-31`);
      const buckets = MONTH_LABELS.map(m => ({ month: m, receivable: 0, payable: 0 }));
      (data || []).forEach((t: any) => {
        if (!t.due_date) return;
        const mi = new Date(t.due_date).getMonth();
        if (t.type === 'receivable' || t.type === 'income') buckets[mi].receivable += Number(t.amount) || 0;
        else buckets[mi].payable += Number(t.amount) || 0;
      });
      return buckets;
    },
    enabled: !!orgId,
    staleTime: 60_000,
  });
}

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
        .select('id, title, departure_date, destination_city, destination_country')
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
  const { data: _activity } = useRecentActivity(organization?.id);
  const { data: financialChartData } = useFinancialChart(organization?.id);
  const { data: upcoming } = useUpcomingTrips(organization?.id);
  
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10 px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">
              {greeting}, <span className="highlight-text">{profile?.first_name || 'Agente'}</span> ☕
            </h1>
            <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sua agência <span className="font-bold text-vj-txt">{organization?.name || 'Turis Agências'}</span> está performando abaixo da meta este mês.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="premium-button border-vj-border bg-white" onClick={() => navigate('/trips/new')}>
              <Plane className="h-4 w-4 mr-2 text-vj-green" /> Viagem
            </Button>
            <Button className="premium-button shadow-lg shadow-green-900/10" onClick={() => setQuotationBuilderOpen(true)}>
              <FileText className="h-4 w-4 mr-2" /> Nova Cotação
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bento-grid-premium">
             <Skeleton className="col-span-full h-[300px] rounded-[32px]" />
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-[200px] rounded-[32px]" />)}
          </div>
        ) : (
          <div className="bento-grid-premium">
            
            {/* Financial Hero Block */}
            <div className="col-span-1 md:col-span-2 row-span-2 premium-card bg-zinc-950 p-8 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Desempenho Financeiro YTD</span>
                  <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                
                <h2 className="stat-value text-green-400">
                  {formatCurrency(stats?.finances.profit ?? 0).split(',')[0]}
                  <span className="text-2xl opacity-50">,00</span>
                </h2>
                <p className="text-zinc-400 text-sm mt-2 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-400" /> +12.5% em relação ao mês anterior
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-800">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Receita Líquida</p>
                  <p className="text-lg font-bold">{formatCurrency(stats?.finances.receivable ?? 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Custo Fornecedores</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(stats?.finances.payable ?? 0)}</p>
                </div>
              </div>
            </div>

            {/* Quick KPI: Active Trips */}
            <div className="col-span-1 premium-card card-gradient-green p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="bg-green-100 dark:bg-green-950/30 p-2 rounded-xl">
                  <PlaneTakeoff className="w-5 h-5 text-green-600" />
                </div>
                <Users2 className="w-4 h-4 text-muted-foreground opacity-50" />
              </div>
              <div className="mt-8">
                <span className="stat-value text-vj-txt leading-none">{stats?.activeTrips ?? 0}</span>
                <p className="text-sm font-bold text-vj-txt uppercase tracking-wider mt-2">Viagens Ativas</p>
                <p className="text-xs text-muted-foreground mt-1">Operacional em dia</p>
              </div>
            </div>

            {/* Quick KPI: Pending Quotations */}
            <div className="col-span-1 premium-card card-gradient-amber p-6 flex flex-col justify-between cursor-pointer group" onClick={() => navigate('/quotations')}>
              <div className="flex items-center justify-between text-amber-600">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-8">
                <span className="stat-value text-amber-600 leading-none">{stats?.pendingQuotations ?? 0}</span>
                <p className="text-sm font-bold text-vj-txt uppercase tracking-wider mt-2">Cotações Abertas</p>
                <p className="text-xs text-muted-foreground mt-1">Ações necessárias</p>
              </div>
            </div>

            {/* AI Insights Block (Wide) */}
            <div className="col-span-1 md:col-span-2 premium-card p-6 flex flex-col bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600">Turis AI Agent • Real-time Insights</span>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-help">
                  <p className="text-xs text-vj-txt font-medium leading-relaxed">
                    "Identifiquei uma oportunidade de upselling em 3 cotações para Maldivas. Os clientes possuem perfil de alta renda e os hotéis selecionados têm baixa disponibilidade."
                  </p>
                </div>
                <div className="bg-blue-600/5 p-3 rounded-2xl border border-blue-100">
                  <p className="text-[10px] text-blue-700 font-bold uppercase mb-1">Ação Sugerida</p>
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    Enviar upgrade de categoria de quarto no hotel 'Soneva Fushi' para o cliente Roberto Silva.
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="mt-4 text-[10px] font-bold uppercase text-slate-500 tracking-wider hover:text-blue-600 w-fit p-0">
                Ver todas as automações →
              </Button>
            </div>

            {/* Recent Tickets Activity */}
            <div className="col-span-1 md:col-span-2 premium-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">Suporte e Chamados</h3>
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">{stats?.urgentTickets} urgentes</span>
              </div>
              
              <div className="space-y-3 flex-1">
                {_activity?.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 transition-colors cursor-pointer" onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-amber-400' : 'bg-zinc-300'}`} />
                      <span className="text-xs font-semibold truncate max-w-[200px]">{ticket.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">#{ticket.id.slice(0, 5)}</span>
                  </div>
                ))}
                {!_activity?.length && <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma atividade recente.</p>}
              </div>
            </div>

            {/* Upcoming Trip Schedule (Narrow) */}
            <div className="col-span-1 md:col-span-2 premium-card p-6 flex flex-col bg-zinc-900 text-white border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <CalendarHeart className="w-4 h-4 text-purple-400" /> Próximos 7 Dias
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {upcoming?.map((trip: any) => (
                  <div key={trip.id} className="bg-zinc-800 h-24 p-4 rounded-2xl flex flex-col justify-between hover:bg-zinc-800/80 transition-colors cursor-pointer border border-zinc-700/50" onClick={() => navigate(`/trips/${trip.id}`)}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{trip.destination_city}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                    </div>
                    <p className="text-xs font-bold truncate">{trip.title}</p>
                    <p className="text-[10px] text-zinc-500">{new Date(trip.departure_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                  </div>
                ))}
                {!upcoming?.length && <p className="text-xs text-zinc-500 col-span-full text-center py-8">Vazio para este período.</p>}
              </div>
            </div>

          </div>
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
