import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
 MapPin, Calendar, Users, CreditCard, Upload, CheckCircle2,
 AlertCircle, Clock, FileText, Download, MessageSquare,
 ChevronRight, X, Loader2, Camera, Bus, Shield, Star,
 Wallet, XCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetPage } from '@/components/ui/SheetPage';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number, currency = 'BRL') =>
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(v || 0));
const fmtDate = (d: string | null | undefined) =>
 d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtShort = (d: string | null | undefined) =>
 d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—';

// ─── Fetch portal data via Edge Function ─────────────────────────────────────
async function fetchPortalData(token: string) {
 const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-booking-token`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON },
 body: JSON.stringify({ token }),
 });
 if (!res.ok) throw new Error('Reserva não encontrada');
 return res.json();
}

// ─── Status mappers ───────────────────────────────────────────────────────────
const installmentStatusConfig = {
 paid: { label: 'Pago', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
 pending: { label: 'Pendente', className: 'bg-amber-50 text-amber-700 border-amber-100' },
 late: { label: 'Vencido', className: 'bg-red-50 text-red-700 border-red-100' },
 cancelled: { label: 'Cancelado',className: 'bg-zinc-50 text-zinc-500 border-zinc-100' },
} as Record<string, { label: string; className: string }>;

const proofStatusConfig = {
 pending_review: { label: 'Aguardando análise', icon: Clock, color: 'text-amber-600' },
 approved: { label: 'Aprovado', icon: CheckCircle2, color: 'text-emerald-600' },
 rejected: { label: 'Rejeitado', icon: XCircle, color: 'text-red-600' },
 cancelled: { label: 'Cancelado', icon: X, color: 'text-zinc-400' },
} as Record<string, { label: string; icon: React.ElementType; color: string }>;

// ─── Upload Proof Dialog ──────────────────────────────────────────────────────
function UploadProofDialog({
 token, installmentId, installmentNum, amount, onClose, onSuccess,
}: {
 token: string; installmentId: string; installmentNum: number;
 amount: number; onClose: () => void; onSuccess: () => void;
}) {
 const [file, setFile] = useState<File | null>(null);
 const [preview, setPreview] = useState<string | null>(null);
 const [amountInput, setAmountInput] = useState(amount.toFixed(2));
 const [notes, setNotes] = useState('');
 const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState(false);
 const { toast } = useToast();
 const fileRef = useRef<HTMLInputElement>(null);

 const handleFile = (f: File) => {
 setFile(f);
 setPreview(URL.createObjectURL(f));
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 const f = e.dataTransfer.files[0];
 if (f) handleFile(f);
 };

 const handleSubmit = async () => {
 if (!file) return;
 setLoading(true);
 try {
 const fd = new FormData();
 fd.append('token', token);
 fd.append('installment_id', installmentId);
 fd.append('amount_declared', amountInput);
 fd.append('notes', notes);
 fd.append('file', file);

 const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-payment-proof`, {
 method: 'POST',
 headers: { 'apikey': SUPABASE_ANON },
 body: fd,
 });
 if (!res.ok) throw new Error(await res.text());
 setSuccess(true);
 setTimeout(() => { onSuccess(); onClose(); }, 1500);
 } catch (err: any) {
 toast({
 title: 'Erro ao enviar comprovante',
 description: err.message,
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <SheetPage
 open
 onClose={onClose}
 title="Enviar Comprovante"
 subtitle={`Parcela ${installmentNum} — ${fmt(amount)}`}
 icon={Upload}
 footer={
 <div className="flex w-full justify-end">
 <Button variant="ghost" onClick={onClose}>Cancelar</Button>
 </div>
 }
 >
 {() => (
 <div className="space-y-6">
 {success ? (
 <div className="flex flex-col items-center py-12 gap-4 text-center">
 <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
 <CheckCircle2 size={32} />
 </div>
 <div>
 <p className="text-xl font-bold text-zinc-900">Comprovante enviado!</p>
 <p className="text-sm text-zinc-500 mt-1">Aguardando análise do financeiro da agência.</p>
 </div>
 </div>
 ) : (
 <div className="space-y-5">
 <div
 className={cn(
 'border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200',
 preview ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-200 hover:border-vj-green/30 hover:bg-zinc-50',
 )}
 onDrop={handleDrop}
 onDragOver={e => e.preventDefault()}
 onClick={() => fileRef.current?.click()}
 >
 <input ref={fileRef} type="file" className="hidden"
 accept="image/*,.pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
 {preview ? (
 <div className="relative animate-in fade-in zoom-in duration-300">
 <img src={preview} alt="preview" className="max-h-56 mx-auto rounded-2xl border-4 border-white object-cover" />
 <p className="text-sm text-emerald-600 mt-3 font-bold flex items-center justify-center gap-1">
 <CheckCircle2 size={14} /> {file?.name}
 </p>
 </div>
 ) : (
 <div className="space-y-3 py-4">
 <div className="h-16 w-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 group-hover:text-vj-green transition-colors">
 <Camera size={32} />
 </div>
 <div>
 <p className="font-bold text-zinc-800">Selecione o comprovante</p>
 <p className="text-xs text-zinc-400 mt-1">Arraste ou clique para tirar uma foto ou subir PDF</p>
 </div>
 </div>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-bold text-zinc-700">Valor Pago (R$)</label>
 <Input
 value={amountInput}
 onChange={e => setAmountInput(e.target.value)}
 type="number"
 step="0.01"
 className="h-12 rounded-xl bg-zinc-50 border-zinc-200 text-lg font-bold"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-bold text-zinc-700">Anotações extras</label>
 <Textarea
 value={notes}
 onChange={e => setNotes(e.target.value)}
 placeholder="Ex: Paguei via PIX hoje pela manhã..."
 rows={3}
 className="rounded-xl bg-zinc-50 border-zinc-200 resize-none"
 />
 </div>

 <Button
 onClick={handleSubmit}
 disabled={!file || loading}
 className="w-full h-14 rounded-full bg-vj-green hover:bg-emerald-600 text-white font-bold text-lg transition-all active:scale-95"
 >
 {loading ? <><Loader2 size={20} className="animate-spin mr-2" /> Enviando...</> : <>
 <Upload size={20} className="mr-2" /> Confirmar Pagamento
 </>}
 </Button>
 </div>
 )}
 </div>
 )}
 </SheetPage>
 );
}

// ── Cancel Request Dialog ─────────────────────────────────────────────────────
function CancelRequestDialog({
 token, booking, trip, onClose, onSuccess,
}: {
 token: string; booking: any; trip: any; onClose: () => void; onSuccess: () => void;
}) {
 const [reasonCode, setReasonCode] = useState('client_request');
 const [reasonNotes, setReasonNotes] = useState('');
 const [resolution, setResolution] = useState<'full_refund' | 'full_credit'>('full_refund');
 const [loading, setLoading] = useState(false);
 const [fineData, setFineData] = useState<any>(null);
 const [fineLoading, setFineLoading] = useState(false);

 const reasons = [
 { v: 'client_request', l: 'Desistência pessoal' },
 { v: 'health', l: 'Motivo de saúde' },
 { v: 'force_majeure', l: 'Força maior' },
 { v: 'other', l: 'Outro motivo' },
 ];

 const fetchFine = async () => {
 setFineLoading(true);
 try {
 const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-booking-token`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON },
 body: JSON.stringify({ token }),
 });
 const data = await res.json();
 // Calculate fine client-side based on policy
 const policy = (trip.cancellation_policy ?? []) as Record<string, any>[];
 const today = new Date();
 const departure = trip.departure_date ? new Date(trip.departure_date) : null;
 const daysBefore = departure ? Math.ceil((departure.getTime() - today.getTime()) / 86400000) : 999;
 const totalPaid = (data.installments ?? [])
 .filter((i: any) => i.status === 'paid')
 .reduce((s: number, i: any) => s + Number(i.amount), 0);
 let finePct = 100;
 let policyDesc = 'Sem reembolso';
 for (const p of policy.sort((a, b) => b.days_before - a.days_before)) {
 if (daysBefore >= p.days_before) { finePct = p.fine_pct; policyDesc = p.description; break; }
 }
 setFineData({
 total_paid: totalPaid,
 fine_pct: finePct,
 fine_amount: totalPaid * finePct / 100,
 refund_amount: totalPaid * (1 - finePct / 100),
 policy_desc: policyDesc,
 days_before: daysBefore,
 });
 } finally {
 setFineLoading(false);
 }
 };

 const { toast } = useToast();

 const handleSubmit = async () => {
 if (!fineData) { await fetchFine(); return; }
 setLoading(true);
 try {
 // Since this is anon/client, we call verify-booking-token first to get org_id/trip_id,
 // then use the public supabase insert (RLS allows anon INSERT with requested_by = 'client')
 const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/booking_cancellations`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 apikey: SUPABASE_ANON,
 Authorization: `Bearer ${SUPABASE_ANON}`,
 Prefer: 'return=minimal',
 },
 body: JSON.stringify({
 booking_id: booking.id,
 org_id: trip.org_id,
 group_trip_id: trip.id,
 requested_by: 'client',
 reason_code: reasonCode,
 reason_notes: reasonNotes || null,
 total_paid: fineData.total_paid,
 fine_pct: fineData.fine_pct,
 fine_amount: fineData.fine_amount,
 refund_amount: resolution === 'full_refund' ? fineData.refund_amount : 0,
 credit_amount: resolution === 'full_credit' ? fineData.refund_amount : 0,
 finance_resolution: resolution,
 status: 'requested',
 }),
 });
 if (!insertRes.ok) throw new Error('Erro ao enviar solicitação');
 onSuccess();
 onClose();
 } catch (err: any) {
 toast({
 title: 'Erro ao solicitar cancelamento',
 description: err.message,
 variant: 'destructive',
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <SheetPage
 open
 onClose={onClose}
 title="Solicitar Cancelamento"
 subtitle="O cancelamento está sujeito às políticas da viagem"
 icon={XCircle}
 footer={
 <div className="flex w-full justify-end gap-2">
 <Button variant="ghost" onClick={onClose}>Voltar</Button>
 <Button
 onClick={handleSubmit}
 disabled={loading || !fineData}
 className="rounded-full px-8 bg-red-600 hover:bg-red-700 text-white font-bold"
 >
 {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
 Confirmar Cancelamento
 </Button>
 </div>
 }
 >
 {() => (
 <div className="space-y-6">
 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
 <p className="font-bold flex items-center gap-2 mb-1">
 <AlertCircle size={16} /> Atenção
 </p>
 <p>Reveja os cálculos abaixo. Uma vez solicitada, a reserva entrará em processo de baixa permanente.</p>
 </div>

 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-sm font-bold text-zinc-700">Motivo principal</label>
 <Select value={reasonCode} onValueChange={setReasonCode}>
 <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {reasons.map(r => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-bold text-zinc-700">Explique brevemente</label>
 <Textarea
 value={reasonNotes}
 onChange={e => setReasonNotes(e.target.value)}
 placeholder="Descreva o motivo do cancelamento..."
 rows={3}
 className="rounded-xl bg-zinc-50 border-zinc-200 resize-none"
 />
 </div>

 {fineData ? (
 <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
 <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
 <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
 <FileText size={16} />
 </div>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Política Aplicada</p>
 <p className="text-sm font-bold text-amber-800">{fineData.policy_desc}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6 pt-2">
 <div className="space-y-1">
 <p className="text-xs text-zinc-500 font-medium">Total Pago</p>
 <p className="text-lg font-bold text-zinc-900">{fmt(fineData.total_paid)}</p>
 </div>
 <div className="space-y-1">
 <p className="text-xs text-zinc-500 font-medium">Multa ({fineData.fine_pct}%)</p>
 <p className="text-lg font-bold text-red-600">{fmt(fineData.fine_amount)}</p>
 </div>
 </div>

 <div className="bg-white/80 p-4 rounded-2xl border border-amber-100">
 <p className="text-xs text-zinc-500 font-medium mb-1">Saldo a devolver / creditar</p>
 <p className="text-3xl font-black text-vj-green">{fmt(fineData.refund_amount)}</p>
 </div>

 {fineData.refund_amount > 0 && (
 <div className="space-y-3 pt-2">
 <p className="text-sm font-bold text-zinc-800">Como deseja receber o saldo?</p>
 <div className="grid gap-2">
 {[
 { v: 'full_refund', l: '💸 Reembolso via PIX/TED', d: 'Pago pela agência em conta bancária' },
 { v: 'full_credit', l: '🎟️ Crédito na Agência', d: 'Use o valor integral em outra viagem' },
 ].map(opt => (
 <label
 key={opt.v}
 className={cn(
 'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
 resolution === opt.v
 ? 'border-emerald-500 bg-emerald-50'
 : 'border-zinc-100 bg-white hover:border-zinc-200'
 )}
 >
 <input
 type="radio"
 name="resolution"
 value={opt.v}
 checked={resolution === opt.v}
 onChange={() => setResolution(opt.v as 'full_refund' | 'full_credit')}
 className="h-5 w-5 accent-emerald-600"
 />
 <div>
 <p className="font-bold text-zinc-800">{opt.l}</p>
 <p className="text-[11px] text-zinc-500">{opt.d}</p>
 </div>
 </label>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : (
 <Button
 variant="outline"
 onClick={fetchFine}
 disabled={fineLoading}
 className="w-full h-12 rounded-xl border-zinc-200 gap-2"
 >
 {fineLoading ? <Loader2 size={16} className="animate-spin" /> : <Info size={16} />}
 Calcular multa e saldo disponível
 </Button>
 )}
 </div>
 </div>
 )}
 </SheetPage>
 );
}

// ─── Main Portal Page ─────────────────────────────────────────────────────────
export default function TravelerPortal() {
 const { token } = useParams<{ token: string }>();
 const qc = useQueryClient();
 const [uploadDialog, setUploadDialog] = useState<{ installmentId: string; num: number; amount: number } | null>(null);
 const [cancelDialog, setCancelDialog] = useState(false);

 const { data, isLoading, error } = useQuery({
 queryKey: ['traveler_portal', token],
 queryFn: () => fetchPortalData(token!),
 enabled: !!token,
 staleTime: 30_000,
 });

 if (isLoading) {
 return (
 <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
 <div className="text-center space-y-3">
 <Loader2 size={36} className="animate-spin text-zinc-300 mx-auto" />
 <p className="text-zinc-500 text-sm">Carregando sua reserva...</p>
 </div>
 </div>
 );
 }

 if (error || !data?.booking) {
 return (
 <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
 <div className="text-center max-w-sm space-y-4">
 <AlertCircle size={48} className="text-red-400 mx-auto" />
 <h1 className="font-black text-xl text-zinc-800">Reserva não encontrada</h1>
 <p className="text-zinc-500 text-sm">
 O link pode estar expirado ou incorreto. Entre em contato com a agência.
 </p>
 </div>
 </div>
 );
 }

 const { booking, installments, proofs, cancellation, credits, messages, signature } = data;
 const trip = booking.group_trips;
 const org = trip?.organizations;
 const currency = trip?.currency ?? 'BRL';
 const f = (v: number) => fmt(v, currency);

 const totalExpected = Number(booking.total_amount);
 const totalPaid = installments
 .filter((i: any) => i.status === 'paid')
 .reduce((s: number, i: any) => s + Number(i.amount), 0);
 const progress = Math.min(100, Math.round((totalPaid / Math.max(totalExpected, 1)) * 100));

 const pendingInstallments = installments.filter(
 (i: any) => i.status === 'pending' || i.status === 'late'
 );

 const isCancelled = booking.status === 'cancelled';
 const hasPendingCancellation = cancellation?.status === 'requested';
 const totalCredit = credits.reduce((s: number, c: any) => s + Number(c.amount) - Number(c.used_amount), 0);

 return (
 <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">

 {/* 🔵 Header com capa da viagem */}
 <div className="relative h-56 sm:h-72 overflow-hidden">
 {trip?.cover_image_url ? (
 <img src={trip.cover_image_url} alt={trip.title}
 className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
 <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
 {org?.logo_url && (
 <img src={org.logo_url} alt={org.name} className="h-7 mb-2 object-contain" />
 )}
 <h1 className="font-black text-white text-xl sm:text-3xl leading-tight">
 {org?.settings?.portal_title || trip?.title}
 </h1>
 {org?.settings?.portal_subtitle && (
 <p className="text-white/80 text-xs mt-1 max-w-md">
 {org.settings.portal_subtitle}
 </p>
 )}
 <div className="flex items-center gap-3 mt-1.5 flex-wrap">
 {trip?.destination && (
 <span className="flex items-center gap-1 text-white/80 text-xs">
 <MapPin size={11} /> {trip.destination}
 </span>
 )}
 {trip?.departure_date && (
 <span className="flex items-center gap-1 text-white/80 text-xs">
 <Calendar size={11} /> {fmtShort(trip.departure_date)}
 {trip.return_date && ` → ${fmtShort(trip.return_date)}`}
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

 {/* 🔴 Alert cancelamento */}
 {isCancelled && (
 <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex items-start gap-3">
 <XCircle size={20} className="text-red-500 flex-none mt-0.5" />
 <div>
 <p className="font-bold text-red-700">Reserva cancelada</p>
 {cancellation?.finance_resolution && (
 <p className="text-red-600 text-sm mt-1">
 Resolução: {cancellation.finance_resolution === 'full_refund' ? 'Reembolso solicitado' : 'Crédito gerado'}
 </p>
 )}
 </div>
 </div>
 )}

 {hasPendingCancellation && !isCancelled && (
 <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex items-start gap-3">
 <Clock size={20} className="text-amber-600 flex-none mt-0.5" />
 <div>
 <p className="font-bold text-amber-700">Cancelamento em análise</p>
 <p className="text-amber-600 text-sm mt-0.5">Aguardando aprovação do financeiro.</p>
 </div>
 </div>
 )}

 {/* 💳 Card do viajante */}
 <div className="rounded-2xl bg-white border border-zinc-100 p-5 space-y-3">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-black text-lg text-zinc-900">{booking.lead_name}</p>
 <p className="text-xs text-zinc-500">{booking.lead_email ?? booking.lead_phone}</p>
 </div>
 {booking.voucher_code && (
 <div className="text-right">
 <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Voucher</p>
 <p className="font-black font-mono text-sm text-zinc-700">#{booking.voucher_code}</p>
 </div>
 )}
 </div>

 <div className="flex items-center gap-4 text-sm pt-1 border-t border-zinc-50">
 <span className="flex items-center gap-1 text-zinc-600">
 <Users size={13} /> {booking.pax_count} viajante{booking.pax_count > 1 ? 's' : ''}
 </span>
 {booking.seat_numbers?.length > 0 && org?.settings?.portal_seats_enabled !== false && (
 <span className="flex items-center gap-1 text-blue-600 font-medium">
 <Bus size={13} /> Assento{booking.seat_numbers.length > 1 ? 's' : ''}: {booking.seat_numbers.join(', ')}
 </span>
 )}
 {signature && (
 <span className="flex items-center gap-1 text-emerald-600">
 <Shield size={13} /> Contrato assinado
 </span>
 )}
 </div>
 </div>

 {/* 💰 Carnê de Parcelas */}
 <div className="rounded-2xl bg-white border border-zinc-100 overflow-hidden">
 {/* Header */}
 <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <CreditCard size={16} className="text-zinc-400" />
 <h2 className="font-bold text-zinc-800">Carnê de Pagamento</h2>
 </div>
 <div className="text-right">
 <p className="font-black text-vj-green">{f(totalPaid)}</p>
 <p className="text-[10px] text-zinc-400">de {f(totalExpected)}</p>
 </div>
 </div>

 {/* Progress bar */}
 <div className="px-5 py-2">
 <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
 <div
 className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
 style={{ width: `${progress}%` }}
 />
 </div>
 <p className="text-xs text-zinc-400 mt-1">{progress}% pago</p>
 </div>

 {/* Installment rows */}
 <div className="divide-y divide-zinc-50">
 {installments.map((inst: any) => {
 const cfg = installmentStatusConfig[inst.status] ?? installmentStatusConfig.pending;
 const isLate = inst.status === 'late' || (inst.status === 'pending' && new Date(inst.due_date) < new Date());
 const instProofs = proofs.filter((p: any) => p.installment_id === inst.id);
 const hasPendingProof = instProofs.some((p: any) => p.status === 'pending_review');

 return (
 <div key={inst.id} className={cn('px-5 py-3.5', isLate && 'bg-red-50/30')}>
 <div className="flex items-center gap-3">
 <div className={cn(
 'h-7 w-7 rounded-full flex items-center justify-center flex-none text-[11px] font-black border',
 cfg.className
 )}>
 {inst.installment_number}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <p className="font-bold text-sm text-zinc-800">{f(inst.amount)}</p>
 <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', cfg.className)}>
 {cfg.label}
 </span>
 {isLate && inst.status !== 'paid' && (
 <span className="text-[10px] text-red-600 font-medium">⚠ Vencido</span>
 )}
 {hasPendingProof && (
 <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
 <Clock size={9} /> Análise
 </span>
 )}
 </div>
 <p className="text-xs text-zinc-400">Vencimento: {fmtShort(inst.due_date)}</p>
 </div>

 {/* Upload button */}
 {inst.status !== 'paid' && inst.status !== 'cancelled' && !hasPendingProof && !isCancelled && org?.settings?.portal_upload_enabled !== false && (
 <Button
 size="sm"
 onClick={() => setUploadDialog({ installmentId: inst.id, num: inst.installment_number, amount: inst.amount })}
 className="h-8 text-xs gap-1 bg-zinc-900 text-white hover:bg-zinc-800"
 >
 <Upload size={12} /> Comprovante
 </Button>
 )}
 {inst.status === 'paid' && inst.paid_at && (
 <div className="flex items-center gap-1 text-emerald-600">
 <CheckCircle2 size={14} />
 <span className="text-xs">{fmtShort(inst.paid_at)}</span>
 </div>
 )}
 </div>

 {/* Proofs for this installment */}
 {instProofs.length > 0 && (
 <div className="mt-2 ml-10 space-y-1">
 {instProofs.map((p: any) => {
 const pCfg = proofStatusConfig[p.status];
 const PIcon = pCfg.icon;
 return (
 <div key={p.id} className="flex items-center gap-2 text-xs">
 <PIcon size={12} className={pCfg.color} />
 <span className={pCfg.color}>{pCfg.label}</span>
 {p.rejection_reason && (
 <span className="text-zinc-400">— {p.rejection_reason}</span>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* PIX key hint */}
 {org?.pix_key && pendingInstallments.length > 0 && (
 <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100">
 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Chave PIX para pagamento</p>
 <p className="font-mono font-bold text-sm text-zinc-800">{org.pix_key}</p>
 </div>
 )}
 </div>

 {/* 🎟️ Créditos disponíveis */}
 {totalCredit > 0 && (
 <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center gap-3">
 <Wallet size={20} className="text-emerald-600 flex-none" />
 <div>
 <p className="font-bold text-emerald-700">Crédito disponível: {f(totalCredit)}</p>
 <p className="text-xs text-emerald-600">De cancelamentos anteriores. Use na sua próxima reserva.</p>
 </div>
 </div>
 )}

 {/* 💬 Mensagens */}
 {messages.length > 0 && (
 <div className="rounded-2xl bg-white border border-zinc-100 overflow-hidden">
 <div className="px-5 py-3 border-b border-zinc-50 flex items-center gap-2">
 <MessageSquare size={15} className="text-zinc-400" />
 <h2 className="font-bold text-zinc-800">Mensagens</h2>
 </div>
 <div className="divide-y divide-zinc-50 max-h-64 overflow-y-auto">
 {messages.map((msg: any) => (
 <div key={msg.id} className={cn(
 'px-5 py-3',
 msg.sender_type === 'client' ? 'bg-blue-50/30' : ''
 )}>
 <div className="flex items-start justify-between gap-2">
 <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
 {msg.sender_type === 'agent' ? '🏢 Agência' : '👤 Você'}
 </p>
 <p className="text-[10px] text-zinc-400">{fmtShort(msg.created_at)}</p>
 </div>
 <p className="text-sm text-zinc-700 mt-0.5">{msg.body}</p>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* ❌ Cancelamento */}
 {!isCancelled && !hasPendingCancellation && org?.settings?.portal_cancel_enabled !== false && (
 <div className="rounded-2xl border border-zinc-100 bg-white p-4">
 <button
 className="w-full flex items-center justify-between group"
 onClick={() => setCancelDialog(true)}
 >
 <div className="flex items-center gap-2 text-zinc-500 group-hover:text-red-600 transition-colors">
 <XCircle size={16} />
 <span className="text-sm font-medium">Solicitar cancelamento da reserva</span>
 </div>
 <ChevronRight size={16} className="text-zinc-300 group-hover:text-red-400 transition-colors" />
 </button>
 </div>
 )}

 {/* Footer */}
 <div className="text-center py-4">
 <p className="text-[11px] text-zinc-400">
 {org?.name} · Powered by Turis Agências
 </p>
 {org?.whatsapp && (
 <a href={`https://wa.me/${org.whatsapp.replace(/\D/g, '')}`}
 target="_blank" rel="noopener noreferrer"
 className="text-xs text-emerald-600 font-medium hover:underline mt-1 block">
 📲 Falar com a agência no WhatsApp
 </a>
 )}
 </div>
 </div>

 {/* Dialogs */}
 {uploadDialog && (
 <UploadProofDialog
 token={token!}
 installmentId={uploadDialog.installmentId}
 installmentNum={uploadDialog.num}
 amount={uploadDialog.amount}
 onClose={() => setUploadDialog(null)}
 onSuccess={() => qc.invalidateQueries({ queryKey: ['traveler_portal', token] })}
 />
 )}
 {cancelDialog && (
 <CancelRequestDialog
 token={token!}
 booking={booking}
 trip={trip}
 onClose={() => setCancelDialog(false)}
 onSuccess={() => qc.invalidateQueries({ queryKey: ['traveler_portal', token] })}
 />
 )}
 </div>
 );
}
