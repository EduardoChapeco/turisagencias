import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { RoleGuard } from '@/components/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, DollarSign, Loader2, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function CommissionReports() {
 const { organization } = useAuthStore();
 const [period, setPeriod] = useState('current_month');
 const db = supabase;

 // Calculate date range from period selection
 const dateRange = React.useMemo(() => {
 const now = new Date();
 if (period === 'current_month') return { from: startOfMonth(now), to: endOfMonth(now) };
 if (period === 'last_month') {
 const last = subMonths(now, 1);
 return { from: startOfMonth(last), to: endOfMonth(last) };
 }
 if (period === 'ytd') return { from: startOfYear(now), to: now };
 return { from: startOfMonth(now), to: endOfMonth(now) };
 }, [period]);

 // Real query: agent_commission_entries + profiles join
 const { data: entries, isLoading, error } = useQuery({
 queryKey: ['commission_reports_real', organization?.id, period],
 queryFn: async () => {
 const { data, error } = await db
 .from('agent_commission_entries')
 .select(`
 id,
 agent_id,
 gross_sales,
 commissionable_base,
 net_over,
 base_commission_amount,
 over_commission_amount,
 adjustment_amount,
 final_commission,
 status,
 operator_name,
 client_name,
 created_at,
 profiles:agent_id (
 id,
 first_name,
 last_name,
 email
 )
 `)
 .eq('org_id', organization?.id)
 .gte('created_at', dateRange.from.toISOString())
 .lte('created_at', dateRange.to.toISOString())
 .order('created_at', { ascending: false });

 // If table doesn't exist yet (migration pending), return empty array gracefully
 if (error && (error.code === '42P01' || error.code === 'PGRST204')) {
 return [];
 }
 if (error) throw error;
 return data || [];
 },
 enabled: !!organization?.id,
 });

 // Aggregate per agent
 const byAgent = React.useMemo(() => {
 if (!entries?.length) return [];
 const map = new Map<string, {
 agentId: string;
 name: string;
 email: string;
 grossSales: number;
 commissionBase: number;
 commissionOver: number;
 totalCommission: number;
 pending: number;
 approved: number;
 }>();

 for (const e of entries) {
 const agentId = e.agent_id;
 const name = e.profiles
 ? `${e.profiles.first_name || ''} ${e.profiles.last_name || ''}`.trim() || e.profiles.email
 : agentId;

 if (!map.has(agentId)) {
 map.set(agentId, {
 agentId,
 name,
 email: e.profiles?.email || '',
 grossSales: 0,
 commissionBase: 0,
 commissionOver: 0,
 totalCommission: 0,
 pending: 0,
 approved: 0,
 });
 }

 const row = map.get(agentId)!;
 row.grossSales += e.gross_sales || 0;
 row.commissionBase += e.base_commission_amount || 0;
 row.commissionOver += e.over_commission_amount || 0;
 row.totalCommission += e.final_commission || 0;
 if (e.status === 'approved') row.approved += e.final_commission || 0;
 else row.pending += e.final_commission || 0;
 }

 return Array.from(map.values()).sort((a, b) => b.totalCommission - a.totalCommission);
 }, [entries]);

 const totalSales = byAgent.reduce((s, a) => s + a.grossSales, 0);
 const totalCommissions = byAgent.reduce((s, a) => s + a.totalCommission, 0);
 const totalPending = byAgent.reduce((s, a) => s + a.pending, 0);

 const handleExport = () => {
 if (!entries?.length) return;
 const csv = [
 ['Agente', 'Operadora', 'Cliente', 'Venda Bruta', 'Comissão Base', 'Comissão Over', 'Total', 'Status', 'Data'].join(';'),
 ...entries.map((e: any) => [
 e.profiles ? `${e.profiles.first_name} ${e.profiles.last_name}`.trim() : e.agent_id,
 e.operator_name || '',
 e.client_name || '',
 (e.gross_sales || 0).toFixed(2).replace('.', ','),
 (e.base_commission_amount || 0).toFixed(2).replace('.', ','),
 (e.over_commission_amount || 0).toFixed(2).replace('.', ','),
 (e.final_commission || 0).toFixed(2).replace('.', ','),
 e.status,
 format(new Date(e.created_at), 'dd/MM/yyyy'),
 ].join(';'))
 ].join('\n');

 const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `comissoes_${period}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 };

 return (
 <RoleGuard allow={['org_admin', 'super_admin', 'finance']}>
 <AppLayout>
 <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <PageHeader
 title="Gestão de Comissões"
 description="Relatório real de comissões por agente — base de dados ao vivo."
 icon={Wallet}
 />
 <div className="flex items-center gap-2">
 <Select value={period} onValueChange={setPeriod}>
 <SelectTrigger className="w-44 bg-white border-vj-border rounded-xl font-bold h-10">
 <SelectValue placeholder="Período" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="current_month">
 {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
 </SelectItem>
 <SelectItem value="last_month">
 {format(subMonths(new Date(), 1), 'MMMM yyyy', { locale: ptBR })}
 </SelectItem>
 <SelectItem value="ytd">Este Ano (YTD)</SelectItem>
 </SelectContent>
 </Select>
 <Button
 variant="outline"
 className="h-10 rounded-xl bg-white border-vj-border font-bold text-vj-txt"
 onClick={handleExport}
 disabled={!entries?.length}
 >
 <Download className="w-4 h-4 mr-2" />
 Exportar CSV
 </Button>
 </div>
 </div>

 {isLoading ? (
 <div className="flex h-48 items-center justify-center">
 <Loader2 className="w-6 h-6 animate-spin text-vj-txt3" />
 </div>
 ) : error ? (
 <Card className="border-red-200 bg-red-50">
 <CardContent className="p-6 flex items-center gap-3 text-red-700">
 <AlertCircle className="w-5 h-5 shrink-0" />
 <p className="text-sm">Erro ao carregar comissões: {(error as any)?.message}</p>
 </CardContent>
 </Card>
 ) : (
 <div className="space-y-6">
 {/* KPIs reais */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <Card className=" border-vj-border">
 <CardContent className="p-6 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Volume de Vendas</p>
 <p className="text-2xl font-black text-vj-txt">{fmt(totalSales)}</p>
 </div>
 <div className="h-12 w-12 rounded-xl bg-vj-green/10 flex items-center justify-center">
 <DollarSign className="w-6 h-6 text-vj-green" />
 </div>
 </CardContent>
 </Card>

 <Card className=" border-vj-border bg-blue-50/30">
 <CardContent className="p-6 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Comissões Totais</p>
 <p className="text-2xl font-black text-blue-700">{fmt(totalCommissions)}</p>
 </div>
 <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
 <Wallet className="w-6 h-6 text-blue-600" />
 </div>
 </CardContent>
 </Card>

 <Card className=" border-vj-border bg-amber-50/30">
 <CardContent className="p-6 flex items-center justify-between">
 <div>
 <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pendente de Repasse</p>
 <p className="text-2xl font-black text-amber-700">{fmt(totalPending)}</p>
 </div>
 <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
 <TrendingUp className="w-6 h-6 text-amber-600" />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Tabela real por agente */}
 <Card className=" border-vj-border overflow-hidden">
 <CardHeader className="border-b border-vj-border bg-zinc-50/50">
 <CardTitle className="text-sm">
 Relatório por Agente
 {entries?.length ? (
 <span className="ml-2 text-xs font-normal text-muted-foreground">
 ({entries.length} entradas no período)
 </span>
 ) : null}
 </CardTitle>
 </CardHeader>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-zinc-50 border-b border-vj-border text-vj-txt3 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-6 py-4">Agente</th>
 <th className="px-6 py-4 text-right">Volume Bruto</th>
 <th className="px-6 py-4 text-right">Comissão Base</th>
 <th className="px-6 py-4 text-right">Comissão Over</th>
 <th className="px-6 py-4 text-right font-bold">Total</th>
 <th className="px-6 py-4 text-center">Pendente</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-vj-border bg-white">
 {byAgent.map((row) => (
 <tr key={row.agentId} className="hover:bg-zinc-50/50 transition-colors">
 <td className="px-6 py-4">
 <p className="font-bold text-vj-txt">{row.name}</p>
 <p className="text-xs text-vj-txt3">{row.email}</p>
 </td>
 <td className="px-6 py-4 text-right font-mono">{fmt(row.grossSales)}</td>
 <td className="px-6 py-4 text-right text-muted-foreground">{fmt(row.commissionBase)}</td>
 <td className="px-6 py-4 text-right text-muted-foreground">{fmt(row.commissionOver)}</td>
 <td className="px-6 py-4 text-right font-bold text-vj-green">{fmt(row.totalCommission)}</td>
 <td className="px-6 py-4 text-center">
 {row.pending > 0 ? (
 <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
 {fmt(row.pending)}
 </Badge>
 ) : (
 <Badge variant="outline" className="text-vj-green border-green-200 bg-green-50">
 Quitado
 </Badge>
 )}
 </td>
 </tr>
 ))}
 {byAgent.length === 0 && (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-vj-txt3">
 <p className="font-medium">Nenhuma comissão registrada neste período.</p>
 <p className="text-xs mt-1">Adicione entradas em{' '}
 <span className="text-vj-green font-semibold">/app/finance/commissions</span>
 </p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 )}
 </div>
 </AppLayout>
 </RoleGuard>
 );
}
