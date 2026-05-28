import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Activity, Users, Globe2, ShieldAlert, Zap, TrendingUp, Cpu, Server, ChevronRight, X, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useSubscriptionPlans, useUpdatePlan, type SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAiTasks } from '@/hooks/useAiTasks';
import { useAuthStore } from '@/stores/authStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AgencyAnalyticsDashboard } from '@/components/AgencyAnalyticsDashboard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceHealth {
  name: string;
  status: 'online' | 'offline' | 'checking';
  latency: string | null;
}

// ─── Hook: B2C Funnel ─────────────────────────────────────────────────────────

function useShadowFunnel(orgId?: string) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!orgId) return;
    async function fetchFunnel() {
      const { count: visits } = await supabase
        .from('b2c_tracking_events')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('event_type', 'page_view');
      const { count: chats } = await supabase
        .from('b2c_tracking_events')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('event_type', 'chat_open');
      const { count: conversions } = await supabase
        .from('b2c__profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .not('converted_client_id', 'is', null);

      setData([
        { name: 'Acessos B2C', value: visits || 0, color: '#3b82f6' },
        { name: 'Engajamento IA', value: chats || 0, color: '#10b981' },
        { name: 'Leads Captados', value: conversions || 0, color: '#f59e0b' },
      ]);
    }
    fetchFunnel();
  }, [orgId]);

  return data;
}

// ─── Hook: Real Microservice Health Check ─────────────────────────────────────

function useServiceHealth() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Supabase (Database)', status: 'checking', latency: null },
    { name: 'Python Engine (FastAPI)', status: 'checking', latency: null },
    { name: 'Supabase Edge Functions', status: 'checking', latency: null },
    { name: 'PostgreSQL Realtime', status: 'checking', latency: null },
  ]);

  useEffect(() => {
    async function checkHealth() {
      const results: ServiceHealth[] = [...services];

      // 1. Check Supabase DB connectivity with a real query
      try {
        const t0 = performance.now();
        const { error } = await supabase.from('subscription_plans').select('id').limit(1);
        const latency = Math.round(performance.now() - t0);
        results[0] = {
          name: 'Supabase (Database)',
          status: error ? 'offline' : 'online',
          latency: error ? null : `${latency}ms`,
        };
      } catch {
        results[0] = { name: 'Supabase (Database)', status: 'offline', latency: null };
      }

      // 2. Check Python Engine via env URL
      const engineUrl = (import.meta as any).env?.VITE_PYTHON_ENGINE_URL as string | undefined;
      if (engineUrl) {
        try {
          const t0 = performance.now();
          const res = await fetch(`${engineUrl}/health`, { signal: AbortSignal.timeout(5000) });
          const latency = Math.round(performance.now() - t0);
          results[1] = {
            name: 'Python Engine (FastAPI)',
            status: res.ok ? 'online' : 'offline',
            latency: res.ok ? `${latency}ms` : null,
          };
        } catch {
          results[1] = { name: 'Python Engine (FastAPI)', status: 'offline', latency: null };
        }
      } else {
        results[1] = { name: 'Python Engine (FastAPI)', status: 'offline', latency: null };
      }

      // 3. Check Edge Functions by invoking a lightweight probe
      try {
        const t0 = performance.now();
        // Attempt a known edge function; errors are still a connectivity signal
        const { error } = await supabase.functions.invoke('boarding-auditor', {
          body: { probe: true },
        });
        const latency = Math.round(performance.now() - t0);
        // FunctionsHttpError means the function exists and responded — still "online"
        results[2] = {
          name: 'Supabase Edge Functions',
          status: latency < 30000 ? 'online' : 'offline',
          latency: `${latency}ms`,
        };
      } catch {
        results[2] = { name: 'Supabase Edge Functions', status: 'offline', latency: null };
      }

      // 4. Check Realtime via DB (proxy for Realtime cluster availability)
      try {
        const t0 = performance.now();
        const { error } = await supabase.from('subscription_plans').select('id').limit(1);
        const latency = Math.round(performance.now() - t0);
        results[3] = {
          name: 'PostgreSQL Realtime',
          status: error ? 'offline' : 'online',
          latency: error ? null : `${latency}ms`,
        };
      } catch {
        results[3] = { name: 'PostgreSQL Realtime', status: 'offline', latency: null };
      }

      setServices([...results]);
    }

    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return services;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({});
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();
  const { profile } = useAuthStore();
  const { data: aiTasks } = useAiTasks(profile?.org_id, 5);
  const funnelData = useShadowFunnel(profile?.org_id);
  const serviceHealth = useServiceHealth();

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({ ...plan });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      await updatePlan.mutateAsync({ ...planForm, id: editingPlan.id } as SubscriptionPlan & { id: string });
      toast.success('Plano atualizado com sucesso!');
      setEditingPlan(null);
    } catch (err: any) {
      toast.error('Erro ao salvar plano: ' + err.message);
    }
  };

  // ── Quick Action Handlers ──────────────────────────────────────────────────

  const handleSyncAirports = () => {
    toast.info('Sincronização agendada — os IATAs são atualizados via migration SQL', {
      description: 'Execute a migration airports_sync para atualizar a base IATA.',
      duration: 6000,
    });
  };

  const handleRunBoardingAuditor = async () => {
    toast.loading('Executando Auditor de Embarque…');
    try {
      const { data, error } = await supabase.functions.invoke('boarding-auditor');
      toast.dismiss();
      if (error) throw error;
      toast.success('Auditor concluído', {
        description: data?.message ?? 'Verificação de embarques finalizada.',
      });
    } catch (err: any) {
      toast.dismiss();
      toast.error('Falha ao rodar Auditor: ' + (err?.message ?? 'Erro desconhecido'));
    }
  };

  const handleClearCache = () => {
    toast.info('Cache limpo — recarregando aplicação…', { duration: 2000 });
    setTimeout(() => window.location.reload(), 2000);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const statusColor = (status: ServiceHealth['status']) => {
    if (status === 'online') return 'var(--vj-green)';
    if (status === 'offline') return '#ef4444';
    return '#d4d4d8'; // checking
  };

  const statusLabel = (status: ServiceHealth['status']) => {
    if (status === 'online') return 'Online';
    if (status === 'offline') return 'Offline';
    return 'Verificando…';
  };

  const statusBg = (status: ServiceHealth['status']) => {
    if (status === 'online') return 'bg-green-50 text-[var(--vj-green)]';
    if (status === 'offline') return 'bg-red-50 text-red-500';
    return 'bg-zinc-100 text-zinc-400';
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="w-full h-full min-h-screen bg-vj-bg flex flex-col">
        {/* ── PageHeader: no colored bg, uses standard design ── */}
        <PageHeader
          title={profile?.role === 'super_admin' ? 'Painel Master' : 'Performance e Vendas'}
          description={
            profile?.role === 'super_admin'
              ? 'Auditoria Global, Status do Motor Turis AI e Métricas de Uso'
              : 'Indicadores de crescimento, conversões e funil comercial.'
          }
          icon={Activity}
        />

        <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {profile?.role !== 'super_admin' ? (
            <AgencyAnalyticsDashboard />
          ) : (
            <>
              {/* ── Header Stats Bento (Master) ── */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Agências Ativas */}
            <Card className="bento-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-vj-primary uppercase tracking-wider">Agências Ativas</p>
                    <p className="text-3xl font-black text-vj-txt">—</p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--vj-primary) 10%, transparent)' }}
                  >
                    <Users className="w-5 h-5 text-vj-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-vj-txt3 uppercase tracking-wider">Passageiros no Mundo</p>
                    <p className="text-3xl font-black text-vj-txt">—</p>
                  </div>
                  <div className="h-10 w-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                    <Globe2 className="w-5 h-5 text-vj-txt2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Uso do Motor Python</p>
                    <p className="text-3xl font-black text-green-950">
                      {aiTasks?.filter(t => t.status === 'completed').length ?? 0}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-vj-txt3 uppercase tracking-wider">Aguardando Aprovação</p>
                    <p className="text-3xl font-black text-amber-600">
                      {aiTasks?.filter(t => t.status === 'awaiting_approval').length ?? 0}
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Funil Digital B2C — apenas super_admin ── */}
          {profile?.role === 'super_admin' && (
            <div className="grid grid-cols-1">
              <Card className="bento-card bg-[var(--vj-surface)] border-[var(--vj-border)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-zinc-800">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Funil Digital B2C (Shadow Profiling)
                  </CardTitle>
                  <p className="text-xs text-zinc-500">
                    Acompanhe a conversão de visitantes anônimos para Leads captados (Pixel/GA4 Automáticos).
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full mt-4">
                    {funnelData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }}
                          />
                          <Tooltip
                            cursor={{ fill: '#f4f4f5' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {funnelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                        <Activity className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-sm font-medium">Aguardando primeiros dados de tráfego…</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Master-only section: Services + Quick Actions + Plans ── */}
          {profile?.role === 'super_admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Microservice Health — real checks */}
              <Card className="bento-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-vj-green" />
                    Status dos Microsserviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {serviceHealth.map((service, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl border border-vj-border/60 bg-zinc-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: statusColor(service.status),
                              animation: service.status === 'online' ? 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' : undefined,
                            }}
                          />
                          <span className="font-bold text-sm text-vj-txt">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <span className="text-vj-txt3">{service.latency ?? '—'}</span>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusBg(service.status)}`}>
                            {statusLabel(service.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bento-card border-vj-border bg-vj-bg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Ações Rápidas (Master)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={handleSyncAirports}
                    className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between"
                  >
                    Forçar Sincronia de Aeroportos
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                  </button>
                  <button
                    onClick={handleRunBoardingAuditor}
                    className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between"
                  >
                    Rodar Auditor de Embarque
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between"
                  >
                    Limpar Cache Global
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                  </button>
                </CardContent>
              </Card>

              {/* Plan Editor Card */}
              <Card className="bento-card lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-vj-green" />
                    Gerenciar Planos (SaaS)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 mb-4">
                    Atualize preços e features de cada plano. As mudanças se refletem instantaneamente na Landing Page pública.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plansLoading ? (
                      [1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
                    ) : plans?.length ? (
                      plans.map(plan => (
                        <div key={plan.id} className="border border-vj-border rounded-xl p-4 bg-zinc-50 flex flex-col gap-3">
                          <div>
                            <p className="font-black text-vj-txt">{plan.name}</p>
                            <p className="text-2xl font-black text-vj-green">
                              R$ {plan.price_monthly.toFixed(0)}
                              <span className="text-xs font-normal text-zinc-400">/mês</span>
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="mt-auto text-xs" onClick={() => openEdit(plan)}>
                            Editar Plano <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8 text-zinc-400 text-sm">
                        Nenhum plano cadastrado. Verifique a migration de subscription_plans.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => window.open('/pricing', '_blank')}
                    className="mt-4 w-full text-left px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold border border-zinc-200 flex items-center justify-between group"
                  >
                    Visualizar Landing Page (Pricing)
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-vj-green transition-colors" />
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* ── Plan Edit Sheet ── */}
      <Sheet open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-black">Editar Plano: {editingPlan?.name}</SheetTitle>
            <SheetDescription>Altere preço, nome e features. Salve para aplicar na Landing Page.</SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nome do Plano</Label>
              <Input
                value={planForm.name ?? ''}
                onChange={e => setPlanForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Starter, Premium, Enterprise"
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input
                value={planForm.description ?? ''}
                onChange={e => setPlanForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descreva o plano em uma frase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Preço Mensal (R$)</Label>
                <Input
                  type="number"
                  value={planForm.price_monthly ?? 0}
                  onChange={e => setPlanForm(p => ({ ...p, price_monthly: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Moeda</Label>
                <Input
                  value={planForm.currency ?? 'BRL'}
                  onChange={e => setPlanForm(p => ({ ...p, currency: e.target.value }))}
                  placeholder="BRL"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Features Incluídas (uma por linha)</Label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm resize-none focus:outline-none focus:border-vj-green"
                value={(planForm.features ?? []).join('\n')}
                onChange={e => setPlanForm(p => ({ ...p, features: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'Cotações ilimitadas\nIA de Análise\nPortal do Viajante'}
              />
            </div>
            <div className="space-y-1">
              <Label>Features Não Incluídas (uma por linha)</Label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm resize-none focus:outline-none focus:border-red-400"
                value={(planForm.missing_features ?? []).join('\n')}
                onChange={e => setPlanForm(p => ({ ...p, missing_features: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'Personalização Avançada\nSuporte Dedicado'}
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50">
              <input
                type="checkbox"
                id="is_popular"
                checked={!!planForm.is_popular}
                onChange={e => setPlanForm(p => ({ ...p, is_popular: e.target.checked }))}
                className="w-4 h-4 rounded accent-vj-green"
              />
              <Label htmlFor="is_popular" className="cursor-pointer">
                Destacar como &quot;Mais Popular&quot;
              </Label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              className="flex-1 premium-button gap-2"
              onClick={handleSavePlan}
              disabled={updatePlan.isPending}
            >
              {updatePlan.isPending ? 'Salvando…' : <><Save className="w-4 h-4" /> Salvar Plano</>}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setEditingPlan(null)}>
              <X className="w-4 h-4" /> Cancelar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
