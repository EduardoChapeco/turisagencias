import React, { useState } from 'react';
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

export default function Analytics() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({});
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const updatePlan = useUpdatePlan();
  const { profile } = useAuthStore();
  const { data: aiTasks } = useAiTasks(profile?.org_id, 5);

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

  return (
    <AppLayout>
      <div className="w-full h-full min-h-screen bg-vj-bg flex flex-col">
        <PageHeader 
          title="Painel Master" 
          description="Auditoria Global, Status do Motor Turis AI e Métricas de Uso"
          icon={Activity}
          className="bg-indigo-900 text-white border-b-0"
        />

        <div className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Header Stats Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bento-card bg-indigo-50 border-indigo-100">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Agências Ativas</p>
                    <p className="text-3xl font-black text-indigo-950">—</p>
                  </div>
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
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

            <Card className="bento-card bg-green-50 border-green-100">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bento-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-vj-green" />
                  Status dos Microsserviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Python Engine (FastAPI)', status: 'Online', latency: '45ms' },
                    { name: 'Supabase Edge Functions', status: 'Online', latency: '12ms' },
                    { name: 'Boarding Auditor (Cron)', status: 'Online', latency: '-' },
                    { name: 'PostgreSQL Realtime', status: 'Online', latency: '18ms' },
                  ].map((service, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-vj-border/60 bg-zinc-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-vj-green animate-pulse" />
                        <span className="font-bold text-sm text-vj-txt">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-vj-txt3">{service.latency}</span>
                        <span className="text-vj-green bg-green-50 px-2 py-1 rounded-md">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card bg-zinc-950 text-white border-zinc-900">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Ações Rápidas (Master)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between">
                  Forçar Sincronia de Aeroportos
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between">
                  Rodar Auditor de Embarque
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 border border-zinc-800 flex items-center justify-between">
                  Limpar Cache Global
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                </button>
              </CardContent>
            </Card>

            {/* Plan Editor Card */}
            <Card className="bento-card bg-white lg:col-span-3">
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-auto text-xs"
                          onClick={() => openEdit(plan)}
                        >
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
        </div>
      </div>

      {/* Plan Edit Sheet */}
      <Sheet open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-black">Editar Plano: {editingPlan?.name}</SheetTitle>
            <SheetDescription>
              Altere preço, nome e features. Salve para aplicar na Landing Page.
            </SheetDescription>
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
                placeholder="Cotações ilimitadas&#10;IA de Análise&#10;Portal do Viajante"
              />
            </div>
            <div className="space-y-1">
              <Label>Features Não Incluídas (uma por linha)</Label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm resize-none focus:outline-none focus:border-red-400"
                value={(planForm.missing_features ?? []).join('\n')}
                onChange={e => setPlanForm(p => ({ ...p, missing_features: e.target.value.split('\n').filter(Boolean) }))}
                placeholder="Personalização Avançada&#10;Suporte Dedicado"
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
              <Label htmlFor="is_popular" className="cursor-pointer">Destacar como "Mais Popular"</Label>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              className="flex-1 premium-button gap-2"
              onClick={handleSavePlan}
              disabled={updatePlan.isPending}
            >
              {updatePlan.isPending ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Plano</>}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setEditingPlan(null)}
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
