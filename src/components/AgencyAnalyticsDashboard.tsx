import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Users, Target, CalendarDays, Award } from 'lucide-react';

const funnelData = [
  { name: 'Leads (CRM)', value: 1200, color: '#3b82f6' },
  { name: 'Cotações (WIP)', value: 450, color: '#8b5cf6' },
  { name: 'Propostas (Enviadas)', value: 280, color: '#f59e0b' },
  { name: 'Vendas (Fechadas)', value: 95, color: '#10b981' },
];

const revenueData = [
  { name: 'Jan', total: 125000 },
  { name: 'Fev', total: 142000 },
  { name: 'Mar', total: 110000 },
  { name: 'Abr', total: 185000 },
  { name: 'Mai', total: 210000 },
  { name: 'Jun', total: 198000 },
];

const destinationsData = [
  { name: 'Paris', value: 400, color: '#10b981' },
  { name: 'Orlando', value: 300, color: '#3b82f6' },
  { name: 'Lisboa', value: 300, color: '#8b5cf6' },
  { name: 'Punta Cana', value: 200, color: '#f59e0b' },
];

export function AgencyAnalyticsDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Resumo Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bento-card bg-vj-bg-dark border-none text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-vj-green mb-1">Faturamento (Mês)</p>
                <p className="text-3xl font-black tracking-tighter">R$ 210k</p>
                <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-vj-green"/> +12% vs. mês anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Novos Leads</p>
                <p className="text-3xl font-black text-zinc-800 tracking-tighter">184</p>
                <p className="text-xs text-vj-green mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Alta captação B2C</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-black text-zinc-800 tracking-tighter">21%</p>
                <p className="text-xs text-zinc-500 mt-2">Acima da média do mercado (15%)</p>
              </div>
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bento-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Embarques (30d)</p>
                <p className="text-3xl font-black text-zinc-800 tracking-tighter">32</p>
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">Operacional Saudável</p>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Receita */}
        <Card className="bento-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-vj-green" /> Evolução de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funil B2C/B2B */}
        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-vj-primary" /> Funil Comercial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Ranking de Agentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['João Pereira', 'Maria Silva', 'Carlos Santos'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs">{name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-sm text-zinc-800">{name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{(10-i)*3} vendas fechadas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-vj-green">R$ {(100-i*15)}k</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bento-card">
          <CardHeader>
            <CardTitle className="text-sm font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-500" /> Top Destinos Cotados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={destinationsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {destinationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
