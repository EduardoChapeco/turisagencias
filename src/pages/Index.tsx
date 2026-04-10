import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plane,
  PlaneTakeoff,
  TicketCheck,
  CalendarHeart,
  Activity,
  KanbanSquare,
  Users,
  Globe2,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function useDashboardStats(orgId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const today = new Date().toISOString().split('T')[0];

      const [tripsRes, quotationsRes, ticketsRes, clientsRes, departuresTodayRes] = await Promise.all([
        supabase.from('trips').select('id, status', { count: 'exact' }).eq('org_id', orgId).neq('status', 'cancelled'),
        supabase.from('quotations').select('id, status', { count: 'exact' }).eq('org_id', orgId).in('status', ['draft', 'sent']),
        supabase.from('tickets').select('id, priority', { count: 'exact' }).eq('org_id', orgId).eq('status', 'open'),
        supabase.from('clients').select('id', { count: 'exact' }).eq('org_id', orgId),
        supabase.from('trips').select('id', { count: 'exact' }).eq('org_id', orgId).eq('departure_date', today),
      ]);

      return {
        activeTrips: tripsRes.count || 0,
        pendingQuotations: quotationsRes.count || 0,
        openTickets: ticketsRes.count || 0,
        totalClients: clientsRes.count || 0,
        departuresToday: departuresTodayRes.count || 0,
        urgentTickets: (ticketsRes.data || []).filter((t: any) => t.priority === 'urgent').length,
      };
    },
    enabled: !!orgId,
    staleTime: 60 * 1000, // 1 minuto
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-primary">{profile?.first_name || 'Agente'}</span> ✈️
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Cockpit da <span className="font-semibold">{organization?.name || 'sua agência'}</span> — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/trips/new')} className="rounded-xl">
              <Plane className="h-4 w-4 mr-2" /> Nova Viagem
            </Button>
            <Button size="sm" onClick={() => navigate('/quotations/new')} className="rounded-xl shadow-sm">
              <FileText className="h-4 w-4 mr-2" /> Nova Cotação
            </Button>
          </div>
        </div>

        {/* Bento Grid - Stats Row */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-[140px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[140px]">

            {/* Embarques Hoje — clickable */}
            <BentoBlock
              className="col-span-1 row-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 cursor-pointer hover:from-primary/20 hover:border-primary/40"
              onClick={() => navigate('/trips')}
            >
              <BentoHeader title="Embarques Hoje" icon={<PlaneTakeoff className="h-5 w-5 text-primary" />} />
              <div className="mt-auto">
                <span className="font-heading text-5xl font-bold text-primary">{stats?.departuresToday ?? 0}</span>
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
                  <div key={col} className="flex-1 bg-muted/40 rounded-xl p-2 border border-border/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">{col}</p>
                    <div className={`h-14 rounded-lg border shadow-sm flex items-center justify-center ${i === 1 ? 'bg-accent/10 border-accent/20' : i === 2 ? 'bg-green-500/10 border-green-500/20' : 'bg-card border-border'}`}>
                      <span className="text-[10px] text-muted-foreground/60">Ver pipeline →</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground group-hover:text-accent transition-colors flex items-center gap-1">
                Abrir Kanban <ArrowRight className="h-3 w-3" />
              </div>
            </BentoBlock>

            {/* Tickets Urgentes */}
            <BentoBlock
              className={`col-span-1 row-span-1 cursor-pointer ${(stats?.urgentTickets ?? 0) > 0 ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10' : 'bg-muted/20'}`}
              onClick={() => navigate('/tickets')}
            >
              <BentoHeader
                title="Tickets Urgentes"
                icon={<AlertTriangle className={`h-5 w-5 ${(stats?.urgentTickets ?? 0) > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />}
              />
              <div className="mt-auto">
                <span className={`font-heading text-5xl font-bold ${(stats?.urgentTickets ?? 0) > 0 ? 'text-destructive' : ''}`}>{stats?.urgentTickets ?? 0}</span>
                <p className="text-xs text-muted-foreground mt-1">{stats?.openTickets ?? 0} em aberto no total</p>
              </div>
            </BentoBlock>

            {/* Total Clientes */}
            <BentoBlock className="col-span-1 row-span-1 cursor-pointer hover:bg-muted/30" onClick={() => navigate('/clients')}>
              <BentoHeader title="Base de Clientes" icon={<Users className="h-5 w-5 text-blue-500" />} />
              <div className="mt-auto">
                <span className="font-heading text-5xl font-bold">{stats?.totalClients ?? 0}</span>
                <p className="text-xs text-muted-foreground mt-1">clientes ativos no CRM</p>
              </div>
            </BentoBlock>

            {/* Próximos Embarques (2x1) */}
            <BentoBlock className="col-span-1 md:col-span-2 row-span-1 overflow-hidden">
              <BentoHeader title="Próximos 7 Dias" icon={<CalendarHeart className="h-5 w-5 text-purple-500" />} />
              <div className="mt-2 space-y-1.5 overflow-hidden flex-1">
                {!upcoming?.length ? (
                  <p className="text-xs text-muted-foreground py-1">Nenhum embarque programado para esta semana.</p>
                ) : upcoming.slice(0, 3).map((trip: any) => (
                  <button
                    key={trip.id}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="w-full flex items-center justify-between text-xs rounded-lg bg-muted/40 px-2 py-1.5 hover:bg-muted/70 transition-colors text-left"
                  >
                    <span className="font-medium truncate max-w-[150px]">{trip.title}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {new Date(trip.departure_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </button>
                ))}
              </div>
            </BentoBlock>

            {/* Feed de Atividade (2x1) */}
            <BentoBlock className="col-span-1 md:col-span-2 row-span-1 overflow-hidden bg-surface/50">
              <BentoHeader title="Atividade Recente" icon={<Activity className="h-5 w-5 text-blue-400" />} />
              <div className="mt-2 space-y-1.5 flex-1 overflow-hidden">
                {!activity?.length ? (
                  <p className="text-xs text-muted-foreground py-1">Nenhuma atividade recente.</p>
                ) : activity.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/tickets/${item.id}`)}
                    className="w-full flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    <TicketCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="truncate flex-1 font-medium">{item.title}</span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full font-semibold uppercase text-[9px] ${item.status === 'open' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{item.status}</span>
                  </button>
                ))}
              </div>
            </BentoBlock>

            {/* Guias Mágicos CTA */}
            <BentoBlock className="col-span-1 md:col-span-2 row-span-1 bg-gradient-to-br from-green-500/5 to-teal-500/5 border-green-500/20 cursor-pointer hover:from-green-500/10" onClick={() => navigate('/guides')}>
              <BentoHeader title="Base de Conhecimento" icon={<Globe2 className="h-5 w-5 text-green-500" />} />
              <p className="text-xs text-muted-foreground mt-2 flex-1">Guias Mágicos alimentam o V-Agent com inteligência sobre destinos.</p>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                Gerenciar Destinos <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </BentoBlock>

            {/* V-Agent CTA */}
            <BentoBlock className="col-span-1 md:col-span-2 row-span-1 bg-gradient-to-br from-purple-500/5 to-accent/5 border-purple-500/20 cursor-pointer hover:from-purple-500/10" onClick={() => navigate('/ai-chat')}>
              <BentoHeader title="V-Agent (IA)" icon={<TrendingUp className="h-5 w-5 text-purple-500" />} />
              <p className="text-xs text-muted-foreground mt-2 flex-1">Motor de IA treinado com contexto da sua agência. Pergunte sobre qualquer viagem.</p>
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold mt-2">
                Abrir Chat de IA <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </BentoBlock>

          </div>
        )}
      </div>
    </AppLayout>
  );
}

function BentoBlock({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Card
      className={`rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

function BentoHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between w-full">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="opacity-80 drop-shadow-sm">{icon}</div>
    </div>
  );
}
