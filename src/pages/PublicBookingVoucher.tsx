import { useParams } from 'react-router-dom';
import {
 Calendar, MapPin, Users, CheckCircle2, Clock, Loader2,
 Download, Ticket, AlertCircle, QrCode, Printer
} from 'lucide-react';
import { usePublicBooking } from '@/hooks/useGroupTrips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

// ── QR Code via Google Charts API (no dependency needed) ─────────────────────
function QRCodeImg({ value, size = 120 }: { value: string; size?: number }) {
 const encoded = encodeURIComponent(value);
 const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=1a1a1a&format=png&qzone=1`;
 return (
 <img
 src={src}
 alt="QR Code"
 width={size}
 height={size}
 className="rounded-lg border border-zinc-100"
 loading="lazy"
 />
 );
}

export default function PublicBookingVoucher() {
 const { token } = useParams<{ token: string }>();
 const { data, isLoading } = usePublicBooking(token);

 // Dynamic page title for print
 useEffect(() => {
 if (data?.booking?.group_trips?.title) {
 document.title = `Voucher — ${data.booking.group_trips.title}`;
 }
 return () => { document.title = 'Turis Agências'; };
 }, [data]);

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-vj-bg">
 <div className="text-center space-y-3">
 <Loader2 className="animate-spin text-vj-green mx-auto" size={36} />
 <p className="text-sm text-vj-txt3 font-medium">Carregando seu voucher...</p>
 </div>
 </div>
 );
 }

 if (!data) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-vj-bg p-6 text-center">
 <AlertCircle className="text-destructive mb-3" size={40} />
 <h1 className="text-2xl font-bold text-vj-txt mb-2">Reserva não encontrada</h1>
 <p className="text-vj-txt3">Verifique o link ou contate a agência.</p>
 </div>
 );
 }

 const { booking, installments } = data;
 const trip = booking.group_trips as any;
 const voucherCode = booking.voucher_code || booking.id.slice(0, 8).toUpperCase();
 const voucherUrl = `${window.location.origin}/voucher/${booking.public_token}`;

 const fmt = (v: number) =>
 new Intl.NumberFormat('pt-BR', { style: 'currency', currency: trip?.currency || 'BRL' }).format(Number(v || 0));

 const fmtDate = (d: string | null) =>
 d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

 const totalPaid = installments.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0);
 const totalDue = Number(booking.total_amount) - totalPaid;
 const paidCount = installments.filter((i: any) => i.status === 'paid').length;
 const lateCount = installments.filter((i: any) => i.status === 'late' || (!i.paid_at && new Date(i.due_date) < new Date())).length;
 const isFullyPaid = totalDue <= 0;

 return (
 <>
 {/* ── Print CSS injected inline ─────────────────────────────────── */}
 <style>{`
 @media print {
 body { background: white !important; }
 .no-print { display: none !important; }
 .print-break { page-break-before: always; }
 .print-page { 
 box-shadow: none !important; 
 border: 1px solid #e5e7eb !important;
 }
 }
 @page {
 size: A4;
 margin: 1.5cm;
 }
 `}</style>

 <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-8 px-4 print:bg-white print:py-0">
 <div className="max-w-2xl mx-auto space-y-4">

 {/* ── Agency branding strip ─────────────────────────────────── */}
 {(trip?.org_logo || trip?.org_name) && (
 <div className="flex items-center gap-3 px-4 py-2 no-print">
 {trip.org_logo && (
 <img src={trip.org_logo} alt={trip.org_name ?? 'Agência'} className="h-8 object-contain" />
 )}
 {trip.org_name && !trip.org_logo && (
 <span className="font-semibold text-sm text-vj-txt">{trip.org_name}</span>
 )}
 </div>
 )}

 {/* ── VOUCHER CARD ──────────────────────────────────────────── */}
 <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 print-page">
 {/* Hero image */}
 {trip?.cover_image_url && (
 <div className="h-36 overflow-hidden relative">
 <img src={trip.cover_image_url} alt={trip.title} className="w-full h-full object-cover" />
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
 <div className="absolute bottom-4 left-5">
 <p className="text-white/70 text-[11px] uppercase tracking-widest font-bold mb-0.5">Voucher de Viagem</p>
 <h1 className="text-white font-black text-xl leading-tight">{trip.title}</h1>
 </div>
 </div>
 )}

 {/* Main content */}
 <div className="p-6 space-y-5">
 {/* Header row */}
 {!trip?.cover_image_url && (
 <div className="flex items-start justify-between gap-3">
 <div>
 <Badge variant="outline" className="mb-2 gap-1.5 text-vj-green border-vj-green/30">
 <Ticket size={11} /> Voucher de Viagem
 </Badge>
 <h1 className="text-2xl font-bold text-vj-txt">{trip?.title}</h1>
 </div>
 </div>
 )}

 {/* Status + code */}
 <div className="flex items-center justify-between flex-wrap gap-3">
 <div>
 <p className="text-[10px] text-vj-txt3 uppercase tracking-widest font-bold mb-0.5">Código da Reserva</p>
 <p className="font-black text-2xl tracking-widest text-vj-txt font-mono">{voucherCode}</p>
 </div>
 <Badge
 className={`text-sm px-4 py-1.5 rounded-full font-bold ${
 booking.status === 'confirmed' ? 'bg-vj-green text-white'
 : booking.status === 'cancelled' ? 'bg-red-100 text-red-700'
 : booking.status === 'transferred' ? 'bg-blue-100 text-blue-700'
 : 'bg-amber-50 text-amber-700 border border-amber-200'
 }`}
 >
 {booking.status === 'confirmed' ? '✅ Confirmada'
 : booking.status === 'cancelled' ? '❌ Cancelada'
 : booking.status === 'transferred' ? '↔ Transferida'
 : '⏳ Aguardando'}
 </Badge>
 </div>

 {/* Trip details grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-zinc-100">
 <InfoCell icon={<MapPin size={14} />} label="Destino" value={trip?.destination} />
 <InfoCell icon={<Calendar size={14} />} label="Embarque" value={fmtDate(trip?.departure_date)} />
 <InfoCell icon={<Calendar size={14} />} label="Retorno" value={fmtDate(trip?.return_date)} />
 <InfoCell icon={<Users size={14} />} label="Passageiros" value={`${booking.pax_count} pax`} />
 </div>

 {/* Passenger card */}
 <div className="bg-zinc-50 rounded-xl p-4 flex items-start justify-between gap-4">
 <div className="flex-1">
 <p className="text-[10px] uppercase text-vj-txt3 tracking-wider mb-1 font-bold">Titular da Reserva</p>
 <p className="font-bold text-vj-txt text-lg">{booking.lead_name}</p>
 {booking.lead_cpf && <p className="text-sm text-vj-txt3">CPF: {booking.lead_cpf}</p>}
 {booking.lead_email && <p className="text-xs text-vj-txt3 mt-0.5">{booking.lead_email}</p>}
 {booking.lead_phone && <p className="text-xs text-vj-txt3">{booking.lead_phone}</p>}
 </div>
 {/* QR Code */}
 <div className="text-center no-print">
 <QRCodeImg value={voucherUrl} size={96} />
 <p className="text-[9px] text-vj-txt3 mt-1 max-w-[96px]">Scan para ver voucher</p>
 </div>
 {/* Print-only large QR */}
 <div className="text-center hidden print:block">
 <QRCodeImg value={voucherUrl} size={120} />
 </div>
 </div>

 {/* Seat numbers */}
 {booking.seat_numbers?.length > 0 && (
 <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
 <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Assentos reservados</p>
 <div className="flex gap-2 flex-wrap">
 {booking.seat_numbers.map((s: string) => (
 <span key={s} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">{s}</span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* ── CARNÊ DE PAGAMENTO ────────────────────────────────────── */}
 <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden print-page">
 {/* Header */}
 <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-white">
 <div>
 <h2 className="font-bold text-vj-txt text-base">Carnê de Pagamento</h2>
 <p className="text-xs text-vj-txt3">
 {installments.length} parcela{installments.length !== 1 ? 's' : ''} —{' '}
 {paidCount}/{installments.length} pagas
 {lateCount > 0 && <span className="text-destructive font-bold"> · {lateCount} em atraso</span>}
 </p>
 </div>
 <div className="text-right">
 <p className="text-[10px] text-vj-txt3 uppercase tracking-wider">
 {isFullyPaid ? 'Totalmente pago' : 'Saldo devedor'}
 </p>
 <p className={`font-black text-xl ${isFullyPaid ? 'text-vj-green' : 'text-vj-txt'}`}>
 {isFullyPaid ? '✓ Pago' : fmt(totalDue)}
 </p>
 </div>
 </div>

 {/* Progress bar */}
 <div className="h-1.5 bg-zinc-100">
 <div
 className="h-full bg-vj-green transition-all duration-500"
 style={{ width: `${Math.round((totalPaid / Number(booking.total_amount)) * 100)}%` }}
 />
 </div>

 {/* Installment rows */}
 <div className="divide-y divide-zinc-50">
 {installments.map((inst: any) => {
 const isPaid = inst.status === 'paid';
 const isLate = !isPaid && (inst.status === 'late' || new Date(inst.due_date) < new Date());
 return (
 <div key={inst.id} className={`px-6 py-3.5 flex items-center justify-between ${isLate ? 'bg-red-50/40' : ''}`}>
 <div className="flex items-center gap-3">
 <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-none ${
 isPaid ? 'bg-vj-green/10 text-vj-green'
 : isLate ? 'bg-destructive/10 text-destructive'
 : 'bg-zinc-100 text-zinc-400'
 }`}>
 {isPaid ? <CheckCircle2 size={18} /> : <Clock size={16} />}
 </div>
 <div>
 <p className="text-sm font-semibold text-vj-txt">Parcela {inst.installment_number}</p>
 <p className="text-xs text-vj-txt3">
 Vence {fmtDate(inst.due_date)}
 {inst.paid_at && <span className="text-vj-green"> · Paga em {fmtDate(inst.paid_at)}</span>}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="font-bold text-vj-txt">{fmt(Number(inst.amount))}</p>
 <p className={`text-[11px] font-semibold ${
 isPaid ? 'text-vj-green'
 : isLate ? 'text-destructive'
 : 'text-zinc-400'
 }`}>
 {isPaid ? '✓ Pago' : isLate ? '⚠ Atraso' : 'A vencer'}
 </p>
 </div>
 </div>
 );
 })}
 </div>

 {/* Footer total */}
 <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-between items-center">
 <p className="text-sm text-vj-txt3">Total da viagem</p>
 <p className="font-black text-vj-txt text-lg">{fmt(Number(booking.total_amount))}</p>
 </div>
 </div>

 {/* ── Actions ────────────────────────────────────────────────── */}
 <div className="flex gap-3 justify-center flex-wrap no-print pb-8">
 <Button variant="outline" className="gap-2 rounded-full px-6" onClick={() => window.print()}>
 <Printer size={14} /> Imprimir / Salvar PDF
 </Button>
 <Button
 variant="outline"
 className="gap-2 rounded-full px-6"
 onClick={() => {
 navigator.share?.({
 title: `Voucher — ${trip?.title}`,
 url: voucherUrl,
 }) ?? navigator.clipboard.writeText(voucherUrl);
 }}
 >
 <QrCode size={14} /> Compartilhar link
 </Button>
 </div>

 {/* Print footer */}
 <div className="hidden print:block text-center text-xs text-zinc-400 mt-4">
 <p>Gerado por Turis Agências · {new Date().toLocaleString('pt-BR')}</p>
 <p className="font-mono mt-0.5">{voucherUrl}</p>
 </div>
 </div>
 </div>
 </>
 );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
 return (
 <div className="bg-zinc-50 rounded-xl p-3">
 <p className="text-[10px] uppercase text-vj-txt3 tracking-wider flex items-center gap-1 mb-1 font-bold">
 <span className="text-zinc-400">{icon}</span>{label}
 </p>
 <p className="text-sm font-semibold text-vj-txt">{value || '—'}</p>
 </div>
 );
}
