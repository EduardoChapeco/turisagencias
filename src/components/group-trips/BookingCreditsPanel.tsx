import { useState } from 'react';
import { Gift, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingCreditsForBooking, useCreateBookingCredit } from '@/hooks/useBookingCredits';
import { cn } from '@/lib/utils';

const fmt = (v: number, cur = 'BRL') =>
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(v);

function sourceLabel(s: string | null) {
 if (!s) return 'Manual';
 const map: Record<string, string> = {
 cancellation: '🔄 Cancelamento',
 manual: '✏️ Manual',
 refund: '💸 Estorno',
 };
 return map[s] ?? s;
}

export function BookingCreditsPanel({ bookingId, currency = 'BRL' }: { bookingId: string; currency?: string }) {
 const { data: credits, isLoading } = useBookingCreditsForBooking(bookingId);
 const create = useCreateBookingCredit();
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ amount: '', client_name: '', notes: '' });

 const available = credits?.reduce((s, c) => s + (Number(c.amount) - Number(c.used_amount)), 0) ?? 0;

 const handleCreate = async () => {
 await create.mutateAsync({
 booking_id: bookingId,
 amount: Number(form.amount),
 client_name: form.client_name || null,
 notes: form.notes || null,
 source: 'manual',
 currency,
 });
 setForm({ amount: '', client_name: '', notes: '' });
 setShowForm(false);
 };

 return (
 <div className="space-y-3">
 {/* Summary bar */}
 <div className={cn(
 'flex items-center justify-between px-4 py-3 rounded-xl border',
 available > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-zinc-50 border-zinc-100'
 )}>
 <div className="flex items-center gap-2">
 <Gift size={16} className={available > 0 ? 'text-emerald-600' : 'text-zinc-400'} />
 <span className="text-sm font-bold">
 {available > 0 ? `${fmt(available, currency)} disponível em créditos` : 'Sem créditos disponíveis'}
 </span>
 </div>
 <Button
 size="sm"
 variant="outline"
 className="h-7 text-xs gap-1"
 onClick={() => setShowForm(v => !v)}
 >
 <Plus size={12} /> Novo crédito
 </Button>
 </div>

 {/* Create form */}
 {showForm && (
 <div className="border border-zinc-100 rounded-xl p-4 space-y-3 bg-zinc-50/50">
 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Novo crédito manual</p>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] text-zinc-400 font-bold uppercase">Valor (R$)</label>
 <Input
 type="number" step="0.01" placeholder="0,00"
 value={form.amount}
 onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
 className="mt-1 h-8 text-sm"
 />
 </div>
 <div>
 <label className="text-[10px] text-zinc-400 font-bold uppercase">Nome do cliente</label>
 <Input
 placeholder="Opcional"
 value={form.client_name}
 onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
 className="mt-1 h-8 text-sm"
 />
 </div>
 </div>
 <div>
 <label className="text-[10px] text-zinc-400 font-bold uppercase">Observações</label>
 <Input
 placeholder="Motivo do crédito..."
 value={form.notes}
 onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
 className="mt-1 h-8 text-sm"
 />
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
 <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
 disabled={!form.amount || create.isPending}
 onClick={handleCreate}
 >
 {create.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
 Registrar
 </Button>
 </div>
 </div>
 )}

 {/* Credits list */}
 {isLoading ? (
 <Skeleton className="h-16 rounded-xl" />
 ) : credits?.length === 0 ? (
 <div className="text-center py-6 text-zinc-400 text-xs">
 <AlertCircle size={20} className="mx-auto mb-1 opacity-30" />
 Nenhum crédito registrado para esta reserva
 </div>
 ) : (
 <div className="space-y-1.5">
 {credits!.map(c => {
 const remaining = Number(c.amount) - Number(c.used_amount);
 return (
 <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 bg-white border border-zinc-100 rounded-xl text-sm">
 <Gift size={14} className={remaining > 0 ? 'text-emerald-500' : 'text-zinc-300'} />
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-zinc-800 truncate">{c.client_name || 'Sem nome'}</p>
 <p className="text-[10px] text-zinc-400">{sourceLabel(c.source)} · {c.notes ?? '—'}</p>
 </div>
 <div className="text-right flex-none">
 <p className={cn('font-bold text-sm', remaining > 0 ? 'text-emerald-600' : 'text-zinc-400')}>
 {fmt(remaining, c.currency)}
 </p>
 {Number(c.used_amount) > 0 && (
 <p className="text-[9px] text-zinc-400">usado: {fmt(Number(c.used_amount), c.currency)}</p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
