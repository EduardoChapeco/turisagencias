import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { XCircle, Check, Loader2, ArrowLeft, Search, Eye, AlertCircle, RefreshCcw, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetPage } from '@/components/ui/SheetPage';
import { useOrgPendingCancellations, useProcessCancellation, CancellationRequest } from '@/hooks/useBookingCancellations';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function PendingCancellations() {
 const navigate = useNavigate();
 const { data: cancellations, isLoading } = useOrgPendingCancellations();
 const [search, setSearch] = useState('');
 const [processingId, setProcessingId] = useState<string | null>(null);

 const filtered = (cancellations ?? []).filter((c: any) =>
 (c.group_bookings?.lead_name || '').toLowerCase().includes(search.toLowerCase()) ||
 (c.group_trips?.title || '').toLowerCase().includes(search.toLowerCase())
 );

 return (
 <AppLayout>
 <div className="max-w-6xl mx-auto space-y-6 pb-12">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
 <ArrowLeft size={18} />
 </Button>
 <div className="flex-1">
 <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
 Financeiro / Auditoria
 </p>
 <h1 className="font-heading font-black text-2xl text-vj-txt">
 Cancelamentos Pendentes
 </h1>
 </div>
 </div>

 <div className="bg-white border rounded-2xl p-4 flex gap-3 items-center">
 <Search size={18} className="text-zinc-400" />
 <Input
 className="border-0 focus-visible:ring-0 p-0 h-auto"
 placeholder="Buscar por cliente ou viagem..."
 value={search} onChange={e => setSearch(e.target.value)}
 />
 <Badge variant="secondary" className="bg-zinc-100">{filtered.length} solicitações</Badge>
 </div>

 {isLoading ? (
 <div className="space-y-3">
 {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl w-full" />)}
 </div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-20 border border-dashed rounded-2xl bg-zinc-50 border-zinc-200 text-zinc-400">
 <XCircle size={48} className="mx-auto mb-3 opacity-30 text-vj-txt" />
 <p className="font-medium text-zinc-500">Nenhum cancelamento pendente</p>
 <p className="text-sm">As solicitações dos viajantes ou agentes aparecerão aqui.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filtered.map((c: any) => (
 <CancellationCard
 key={c.id}
 cancellation={c}
 onProcess={() => setProcessingId(c.id)}
 />
 ))}
 </div>
 )}

 {/* Process Dialog */}
 {processingId && (
 <ProcessCancellationDialog
 cancellation={filtered.find((c: any) => c.id === processingId)!}
 onClose={() => setProcessingId(null)}
 />
 )}

 </div>
 </AppLayout>
 );
}

function CancellationCard({ cancellation: c, onProcess }: { cancellation: any, onProcess: () => void }) {
 const isCredit = c.finance_resolution === 'full_credit';
 return (
 <div className="bg-white border rounded-2xl p-5 hover:border-zinc-300 transition-colors flex flex-col items-start gap-4">
 <div className="w-full flex items-start justify-between">
 <div>
 <p className="font-bold text-lg text-zinc-800 line-clamp-1">{c.group_bookings?.lead_name}</p>
 <p className="text-xs text-zinc-500 line-clamp-1">{c.group_trips?.title}</p>
 </div>
 <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
 Aguardando
 </span>
 </div>

 <div className="w-full grid grid-cols-2 gap-3 text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-100">
 <div><p className="text-xs text-zinc-500">Total Pago</p><p className="font-bold">{fmt(c.total_paid)}</p></div>
 <div><p className="text-xs text-zinc-500">Retenção ({c.fine_pct}%)</p><p className="font-bold text-red-600">{fmt(c.fine_amount)}</p></div>
 <div className="col-span-2 border-t pt-2 mt-1">
 <p className="text-xs text-zinc-500">A {isCredit ? 'creditar' : 'reembolsar'}</p>
 <div className="flex items-center gap-1">
 {isCredit ? <Wallet size={14} className="text-emerald-600"/> : <RefreshCcw size={14} className="text-blue-600"/>}
 <p className="font-black text-lg text-zinc-800">{fmt(c.refund_amount || c.credit_amount)}</p>
 </div>
 </div>
 </div>

 <div className="w-full flex justify-between items-center text-xs text-zinc-400">
 <span>Pedido em {fmtDate(c.created_at)}</span>
 <Button size="sm" className="h-8 gap-1 bg-zinc-900 text-white hover:bg-zinc-800" onClick={onProcess}>
 <Eye size={14} /> Avaliar
 </Button>
 </div>
 </div>
 );
}

function ProcessCancellationDialog({ cancellation: c, onClose }: { cancellation: any, onClose: () => void }) {
 const process = useProcessCancellation();
 const { organization } = useAuthStore();
 const [notes, setNotes] = useState('');
 const [method, setMethod] = useState('');
 const isCredit = c.finance_resolution === 'full_credit';

 const handleApprove = () => {
 process.mutate({
 cancellationId: c.id,
 bookingId: c.booking_id,
 action: 'approved',
 notesFinance: notes || undefined,
 refundMethod: isCredit ? 'credit_wallet' : (method || 'pix'),
 generateCredit: isCredit,
 creditAmount: isCredit ? c.credit_amount : undefined,
 orgId: organization!.id,
 leadName: c.group_bookings?.lead_name,
 }, { onSuccess: onClose });
 };

 const handleReject = () => {
 process.mutate({
 cancellationId: c.id,
 bookingId: c.booking_id,
 action: 'rejected',
 notesFinance: notes || undefined,
 orgId: organization!.id,
 }, { onSuccess: onClose });
 };

 return (
 <SheetPage
 open
 onClose={onClose}
 title="Avaliar Cancelamento"
 subtitle={`Reserva de ${c.group_bookings?.lead_name} — ${c.group_trips?.title}`}
 icon={XCircle}
 footer={
 <div className="flex items-center gap-3 w-full">
 <Button
 variant="outline"
 className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
 onClick={handleReject}
 disabled={process.isPending}
 >
 <XCircle size={16} className="mr-2" /> Rejeitar Pedido
 </Button>
 <Button
 className="flex-1 bg-vj-green text-white hover:bg-emerald-600"
 onClick={handleApprove}
 disabled={process.isPending}
 >
 {process.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Check size={16} className="mr-2" />}
 Confirmar &amp; Cancelar
 </Button>
 </div>
 }
 >
 {() => (
 <div className="space-y-5">
 <div className="p-4 bg-zinc-50 border rounded-2xl text-sm space-y-1.5">
 <p><strong>Motivo:</strong> {c.reason_code}</p>
 {c.reason_notes && <p className="text-zinc-500 italic">"{c.reason_notes}"</p>}
 </div>

 <div>
 <label className="text-xs font-bold uppercase text-zinc-500 mb-2 block">Ação solicitada pelo cliente:</label>
 {isCredit ? (
 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
 <Wallet size={28} className="text-emerald-500" />
 <div>
 <p className="font-bold text-emerald-800">Gerar Crédito na Agência</p>
 <p className="text-sm text-emerald-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.credit_amount || 0))}</p>
 </div>
 </div>
 ) : (
 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
 <RefreshCcw size={28} className="text-blue-500" />
 <div>
 <p className="font-bold text-blue-800">Transferir Reembolso (PIX/TED)</p>
 <p className="text-sm text-blue-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(c.refund_amount || 0))}</p>
 </div>
 </div>
 )}
 </div>

 {!isCredit && (
 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase text-zinc-500">Como você enviou o reembolso?</label>
 <Input
 value={method}
 onChange={e => setMethod(e.target.value)}
 placeholder="Ex: PIX no Banco Itaú do cliente"
 className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
 />
 </div>
 )}

 <div className="space-y-1.5">
 <label className="text-xs font-bold uppercase text-zinc-500">Anotação Interna (Financeiro)</label>
 <Input
 value={notes}
 onChange={e => setNotes(e.target.value)}
 placeholder="Notas internas da auditoria (opcional)"
 className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
 />
 </div>
 </div>
 )}
 </SheetPage>
 );
}
