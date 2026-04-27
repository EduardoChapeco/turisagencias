import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Activity, Users, Globe2, ShieldAlert, Zap, TrendingUp, Cpu, Server, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Analytics() {
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
                    <p className="text-3xl font-black text-indigo-950">24</p>
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
                    <p className="text-3xl font-black text-vj-txt">1,402</p>
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
                    <p className="text-3xl font-black text-green-950">98%</p>
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
                    <p className="text-sm font-bold text-vj-txt3 uppercase tracking-wider">Alertas de Auditor</p>
                    <p className="text-3xl font-black text-amber-600">3</p>
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

            <Card className="bento-card bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-vj-green" />
                  Gerenciar Planos (SaaS)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 mb-4">Atualize as informações de preço e features de cada plano de assinatura. Isso se reflete instantaneamente na Landing Page pública.</p>
                <div className="space-y-3">
                  <button onClick={() => window.open('/pricing', '_blank')} className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold border border-zinc-200 flex items-center justify-between group">
                    Visualizar Landing Page (Pricing)
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-vj-green transition-colors" />
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold border border-zinc-200 flex items-center justify-between group">
                    Editar Plano: Starter (R$ 149)
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-vj-green transition-colors" />
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-sm font-bold border border-zinc-200 flex items-center justify-between group">
                    Editar Plano: Pro / OMEGA (R$ 399)
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-vj-green transition-colors" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
