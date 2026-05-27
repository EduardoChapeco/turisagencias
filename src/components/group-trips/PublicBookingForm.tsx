import { useState } from 'react';
import { Loader2, CheckCircle2, Armchair, FileSignature, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePublicBooking } from '@/hooks/useGroupTrips';
import { ContractSignatureFlow } from './ContractSignatureFlow';
import type { BusLayout } from './BusSeatMap';
import { BusSeatMap } from './BusSeatMap';

interface Props {
 tripId: string;
 orgId: string;
 tripTitle: string;
 pricePerPax: number;
 installmentsCount?: number;
 currency?: string;
 /** If provided, shows seat selection step */
 busLayout?: BusLayout | null;
 /** Already occupied seats */
 occupiedSeats?: string[];
 onSuccess?: (token: string) => void;
}

type Step = 'form' | 'seats' | 'contract' | 'done';

export function PublicBookingForm({
 tripId, orgId, tripTitle, pricePerPax, installmentsCount = 1,
 currency = 'BRL', busLayout = null, occupiedSeats = [], onSuccess,
}: Props) {
 const create = useCreatePublicBooking();

 const [step, setStep] = useState<Step>('form');
 const [form, setForm] = useState({
 lead_name: '', lead_email: '', lead_phone: '', lead_cpf: '', pax_count: 1,
 });
 const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
 const [publicToken, setPublicToken] = useState<string | null>(null);
 const [bookingId, setBookingId] = useState<string | null>(null);

 const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v);
 const totalAmount = Number(form.pax_count) * pricePerPax;
 const installmentValue = installmentsCount > 1 ? totalAmount / installmentsCount : 0;

 const set = (p: Partial<typeof form>) => setForm(f => ({ ...f, ...p }));
 const hasBusLayout = !!busLayout;

 // Step 1: Dados pessoais → criar booking
 const handleFormSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const result = await create.mutateAsync({
 group_trip_id: tripId,
 org_id: orgId,
 lead_name: form.lead_name,
 lead_email: form.lead_email || undefined,
 lead_phone: form.lead_phone || undefined,
 lead_cpf: form.lead_cpf || undefined,
 pax_count: Number(form.pax_count),
 total_amount: totalAmount,
 });
 setPublicToken(result.public_token);
 setBookingId(result.id);

 if (hasBusLayout) {
 setStep('seats');
 } else {
 setStep('contract');
 }
 };

 // Step 2 (opcional): Seleção de assento → já criou booking, só salva assentos
 const handleSeatConfirm = () => {
 // seat_numbers will be stored when signature is done
 setStep('contract');
 };

 // Step 3: Assinatura → done
 const handleSigned = () => {
 setStep('done');
 if (publicToken) onSuccess?.(publicToken);
 };

 // ── DONE ──────────────────────────────────────────────────────────────────
 if (step === 'done') {
 return (
 <div className="text-center space-y-4 py-6">
 <div className="h-16 w-16 mx-auto rounded-full bg-vj-green/10 text-vj-green flex items-center justify-center">
 <CheckCircle2 size={36} />
 </div>
 <div>
 <h3 className="font-bold text-vj-txt text-xl">Reserva confirmada! 🎉</h3>
 <p className="text-sm text-vj-txt3 mt-1">
 Contrato assinado · Carnê gerado · Voucher criado
 </p>
 </div>
 {publicToken && (
 <Button
 className="w-full"
 onClick={() => window.location.href = `/voucher/${publicToken}`}
 >
 Ver meu voucher e carnê
 </Button>
 )}
 </div>
 );
 }

 // ── PROGRESS HEADER ───────────────────────────────────────────────────────
 const steps: { key: Step; label: string; icon: typeof User }[] = [
 { key: 'form', label: 'Dados', icon: User },
 ...(hasBusLayout ? [{ key: 'seats' as Step, label: 'Assento', icon: Armchair }] : []),
 { key: 'contract', label: 'Contrato', icon: FileSignature },
 { key: 'done', label: 'Confirmado', icon: CreditCard },
 ];

 const currentIdx = steps.findIndex(s => s.key === step);

 return (
 <div className="space-y-5">
 {/* Step progress */}
 <div className="flex items-center gap-1 justify-between">
 {steps.map((s, i) => {
 const Icon = s.icon;
 const done = i < currentIdx;
 const active = i === currentIdx;
 return (
 <div key={s.key} className="flex items-center gap-1 flex-1">
 <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
 active ? 'bg-vj-green text-white'
 : done ? 'bg-vj-green/20 text-vj-green'
 : 'bg-vj-bg text-vj-txt3'
 }`}>
 <Icon size={10} />
 <span className="hidden sm:inline">{s.label}</span>
 </div>
 {i < steps.length - 1 && (
 <div className={`h-0.5 flex-1 rounded-full ${done || active ? 'bg-vj-green/40' : 'bg-vj-border'}`} />
 )}
 </div>
 );
 })}
 </div>

 {/* ── STEP 1: Dados pessoais ─────────────────────────────────────────── */}
 {step === 'form' && (
 <form onSubmit={handleFormSubmit} className="space-y-3">
 <div>
 <Label>Nome completo *</Label>
 <Input required value={form.lead_name} onChange={e => set({ lead_name: e.target.value })}
 placeholder="Seu nome completo" />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <Label>WhatsApp</Label>
 <Input value={form.lead_phone} onChange={e => set({ lead_phone: e.target.value })}
 placeholder="(00) 00000-0000" />
 </div>
 <div>
 <Label>CPF</Label>
 <Input value={form.lead_cpf} onChange={e => set({ lead_cpf: e.target.value })}
 placeholder="000.000.000-00" />
 </div>
 </div>
 <div>
 <Label>E-mail</Label>
 <Input type="email" value={form.lead_email} onChange={e => set({ lead_email: e.target.value })}
 placeholder="seu@email.com" />
 </div>
 <div>
 <Label>Passageiros</Label>
 <Input type="number" min={1} max={10} value={form.pax_count}
 onChange={e => set({ pax_count: Number(e.target.value) })} />
 </div>

 {/* Price summary */}
 <div className="p-3 bg-vj-bg rounded-xl border border-vj-border">
 <div className="flex justify-between text-sm">
 <span className="text-vj-txt3">{form.pax_count} × {fmt(pricePerPax)}</span>
 <span className="font-black text-vj-green">{fmt(totalAmount)}</span>
 </div>
 {installmentValue > 0 && (
 <p className="text-xs text-vj-txt3 mt-0.5 text-right">
 ou {installmentsCount}x de {fmt(installmentValue)}
 </p>
 )}
 </div>

 <Button type="submit" className="w-full gap-2" disabled={create.isPending}>
 {create.isPending && <Loader2 className="animate-spin" size={14} />}
 {hasBusLayout ? 'Próximo: escolher assento' : 'Próximo: assinar contrato'}
 </Button>

 <p className="text-[11px] text-vj-txt3 text-center">
 Você receberá voucher e carnê após assinar o contrato.
 </p>
 </form>
 )}

 {/* ── STEP 2: Seleção de assento (opcional) ─────────────────────────── */}
 {step === 'seats' && busLayout && (
 <div className="space-y-4">
 <div className="p-3 bg-vj-bg rounded-xl border border-vj-border">
 <p className="text-sm font-semibold text-vj-txt mb-1">Escolha seu(s) assento(s)</p>
 <p className="text-xs text-vj-txt3">Selecione {form.pax_count} assento(s)</p>
 </div>

 <div className="overflow-x-auto pb-2">
 <BusSeatMap
 layout={busLayout}
 occupied={occupiedSeats}
 selected={selectedSeats}
 maxSelect={Number(form.pax_count)}
 onSelect={setSelectedSeats}
 />
 </div>

 <div className="flex gap-2">
 <Button variant="outline" className="flex-1" onClick={() => setStep('form')}>Voltar</Button>
 <Button
 className="flex-1 gap-2"
 disabled={selectedSeats.length !== Number(form.pax_count)}
 onClick={handleSeatConfirm}
 >
 <FileSignature size={14} />
 Confirmar assentos
 </Button>
 </div>
 </div>
 )}

 {/* ── STEP 3: Assinatura do contrato ────────────────────────────────── */}
 {step === 'contract' && bookingId && publicToken && (
 <div className="space-y-3">
 {hasBusLayout && (
 <Button type="button" variant="outline" size="sm" onClick={() => setStep('seats')}>
 Alterar assentos selecionados
 </Button>
 )}
 <ContractSignatureFlow
 bookingId={bookingId}
 bookingToken={publicToken}
 tripTitle={tripTitle}
 signerNamePrefill={form.lead_name}
 selectedSeats={selectedSeats}
 onSigned={handleSigned}
 />
 </div>
 )}
 </div>
 );
}
