import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { usePayments, useUpdatePayment } from '@/hooks/useFinance';
import { PageSkeleton } from '@/components/ui/EmptyState';

export default function Payments() {
 const { profile } = useAuthStore();
 const [filterStatus, setFilterStatus] = useState<string | undefined>();
 const { data: payments, isLoading } = usePayments(profile?.org_id, { status: filterStatus });
 const updatePayment = useUpdatePayment();

 if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

 const handleMarkAsPaid = async (paymentId: string) => {
 await updatePayment.mutateAsync({
 id: paymentId,
 status: 'paid',
 paid_at: new Date().toISOString(),
 });
 };

 const totalPending = payments?.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0) || 0;
 const totalOverdue = payments?.filter(p => p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0) || 0;
 const totalPaid = payments?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) || 0;

 return (
 <AppLayout fullHeight>
 <div className="flex h-full min-h-0 flex-col gap-4">
 <PageHeader
 title="Gestão de Parcelas"
 description="Controle de parcelamentos, boletos e recebimentos dos pacotes de viagem."
 icon={CreditCard}
 />

 {/* Dashboard Cards */}
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
 <Calendar size={18} />
 </div>
 <p className="font-semibold text-sm text-muted-foreground">A Receber (Pendentes)</p>
 </div>
 <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}</p>
 </div>
 <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
 <AlertCircle size={18} />
 </div>
 <p className="font-semibold text-sm text-muted-foreground">Em Atraso</p>
 </div>
 <p className="text-2xl font-bold text-red-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdue)}</p>
 </div>
 <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
 <div className="flex items-center gap-3 mb-2">
 <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl">
 <TrendingUp size={18} />
 </div>
 <p className="font-semibold text-sm text-muted-foreground">Recebidos</p>
 </div>
 <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}</p>
 </div>
 </div>

 <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-white p-4 dark:bg-zinc-900 sm:p-6">
 <div className="mb-4 flex flex-wrap gap-2">
 <Button variant={filterStatus === undefined ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilterStatus(undefined)}>Todas</Button>
 <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} className="rounded-full text-amber-600 border-amber-200" onClick={() => setFilterStatus('pending')}>Pendentes</Button>
 <Button variant={filterStatus === 'paid' ? 'default' : 'outline'} className="rounded-full text-green-600 border-green-200" onClick={() => setFilterStatus('paid')}>Pagas</Button>
 <Button variant={filterStatus === 'overdue' ? 'default' : 'outline'} className="rounded-full text-red-600 border-red-200" onClick={() => setFilterStatus('overdue')}>Vencidas</Button>
 </div>
 
 <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
 <table className="w-full text-sm text-left">
 <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
 <tr>
 <th className="px-4 py-3 font-medium">Status</th>
 <th className="px-4 py-3 font-medium">Viagem / Pacote</th>
 <th className="px-4 py-3 font-medium">Cliente</th>
 <th className="px-4 py-3 font-medium">Parcela</th>
 <th className="px-4 py-3 font-medium">Vencimento</th>
 <th className="px-4 py-3 font-medium text-right">Valor</th>
 <th className="px-4 py-3 font-medium text-right">Ação</th>
 </tr>
 </thead>
 <tbody>
 {(!payments || payments.length === 0) ? (
 <tr>
 <td colSpan={7} className="p-8 text-center text-muted-foreground">
 Nenhuma parcela encontrada.
 </td>
 </tr>
 ) : (
 payments.map(p => (
 <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
 <td className="px-4 py-3">
 {{
 pending: <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Pendente</Badge>,
 paid: <Badge className="bg-green-500 text-white">Paga</Badge>,
 overdue: <Badge variant="destructive">Vencida</Badge>,
 failed: <Badge variant="destructive">Falhou</Badge>,
 refunded: <Badge variant="outline" className="text-zinc-400">Reembolsada</Badge>,
 }[p.status] ?? <Badge variant="secondary">{p.status}</Badge>}
 </td>
 <td className="px-4 py-3 font-medium truncate max-w-[200px]">
 {p.bookings?.quotations?.title || p.bookings?.quotations?.code || '-'}
 </td>
 <td className="px-4 py-3 text-muted-foreground">
 {p.bookings?.clients?.name || '-'}
 </td>
 <td className="px-4 py-3">
 {p.installment_number}ª Parcela
 </td>
 <td className="px-4 py-3">
 {new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
 </td>
 <td className="px-4 py-3 text-right font-bold">
 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
 </td>
 <td className="px-4 py-3 text-right">
 {p.status === 'pending' || p.status === 'overdue' ? (
 <Button 
 variant="outline" 
 size="sm" 
 className="text-green-600 border-green-200 hover:bg-green-50"
 onClick={() => handleMarkAsPaid(p.id)}
 disabled={updatePayment.isPending}
 >
 <CheckCircle2 className="w-4 h-4 mr-1" />
 Dar Baixa
 </Button>
 ) : (
 <span className="text-muted-foreground text-xs">Paga em {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '-'}</span>
 )}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AppLayout>
 );
}
