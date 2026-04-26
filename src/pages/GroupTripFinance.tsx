import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, TrendingDown, Users, Clock, CheckCircle2,
  AlertCircle, Upload, Eye, X, Check, ChevronDown, ChevronRight,
  Wallet, FileText, Bus, Loader2, Plus, DollarSign, MessageSquare, ArrowRightLeft, Download
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { SheetPage } from '@/components/ui/SheetPage';
import {
  useGroupTripFinancialSummary,
  useGroupTripBookings,
  useUpdateInstallmentStatus,
} from '@/hooks/useGroupTripFinance';
import { useGroupTrip, useGroupTrips, useTransferBooking } from '@/hooks/useGroupTrips';
import { useReviewPaymentProof, useBookingPaymentProofs } from '@/hooks/useBookingPaymentProofs';
import { BookingMessagesPanel } from '@/components/group-trips/BookingMessagesPanel';
import { BookingCreditsPanel } from '@/components/group-trips/BookingCreditsPanel';
import { cn } from '@/lib/utils';

// ── Formatadores ─────────────────────────────────────────────────────────────
const fmt = (v: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(v || 0));
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—';

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color = 'zinc', trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color?: string; trend?: 'up' | 'down' | 'neutral';
}) {
  const colors: Record<string, string> = {
    green:  'bg-emerald-50  border-emerald-100 text-emerald-600',
    red:    'bg-red-50      border-red-100     text-red-600',
    amber:  'bg-amber-50   border-amber-100   text-amber-600',
    blue:   'bg-blue-50    border-blue-100    text-blue-600',
    zinc:   'bg-zinc-50    border-zinc-100    text-zinc-500',
  };
  return (
    <div className={cn('rounded-xl border p-5 space-y-3', colors[color])}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</p>
        <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-xs opacity-60">{sub}</p>}
    </div>
  );
}

// ── Proof Image Dialog ────────────────────────────────────────────────────────
function ProofsDialog({ bookingId, installmentId, onClose }: {
  bookingId: string; installmentId: string | null; onClose: () => void;
}) {
  const { data: proofs, isLoading } = useBookingPaymentProofs(bookingId);
  const review = useReviewPaymentProof();
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pending = proofs?.filter(p => p.status === 'pending_review') ?? [];

  return (
    <SheetPage
      open
      onClose={onClose}
      title="Comprovantes de Pagamento"
      subtitle="Aguardando revisão do agente"
      icon={Upload}
      footer={
        <div className="flex w-full justify-end">
          <Button variant="ghost" onClick={onClose}>Fechar</Button>
        </div>
      }
    >
      {() => (
        <>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : pending.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <CheckCircle2 size={48} className="mx-auto mb-3 text-vj-green/50" />
              <p className="font-medium">Nenhum comprovante pendente</p>
              <p className="text-sm mt-1">Todos os pagamentos desta reserva já foram revisados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(proof => (
                <div key={proof.id} className="border border-zinc-100 rounded-2xl overflow-hidden">
                  {proof.file_url && (
                    <a href={proof.file_url} target="_blank" rel="noopener noreferrer">
                      <div className="relative h-52 bg-zinc-100 flex items-center justify-center group">
                        {proof.file_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                          <img src={proof.file_url} alt="Comprovante" className="h-full w-full object-cover group-hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-zinc-400">
                            <FileText size={40} />
                            <span className="text-sm">{proof.file_name ?? 'Ver arquivo'}</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-2 py-0.5 text-[10px] font-bold text-zinc-600 flex items-center gap-1">
                          <Eye size={10} /> Ver
                        </div>
                      </div>
                    </a>
                  )}
                  <div className="p-4 space-y-3">
                    {proof.amount_declared && (
                      <p className="text-sm font-bold text-vj-green">Valor declarado: {fmt(proof.amount_declared)}</p>
                    )}
                    {proof.notes_client && (
                      <p className="text-xs text-zinc-500 italic">"{proof.notes_client}"</p>
                    )}
                    <p className="text-[10px] text-zinc-400">{fmtDate(proof.created_at)}</p>
                    {rejectingId === proof.id ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Motivo da rejeição..."
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          className="rounded-xl"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancelar</Button>
                          <Button size="sm" variant="destructive" className="flex-1"
                            disabled={!rejectReason.trim() || review.isPending}
                            onClick={() => review.mutate({
                              proofId: proof.id, bookingId, installmentId,
                              action: 'rejected', rejectionReason: rejectReason,
                            }, { onSuccess: () => { setRejectingId(null); setRejectReason(''); } })}>
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-red-500 border-red-100 hover:bg-red-50" onClick={() => setRejectingId(proof.id)}>
                          <X size={12} className="mr-1" /> Rejeitar
                        </Button>
                        <Button size="sm" className="flex-1 bg-vj-green text-white hover:bg-vj-green/90"
                          disabled={review.isPending}
                          onClick={() => review.mutate({ proofId: proof.id, bookingId, installmentId, action: 'approved' })}>
                          {review.isPending ? <Loader2 size={12} className="animate-spin mr-1" /> : <Check size={12} className="mr-1" />}
                          Aprovar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SheetPage>
  );
}

// ── Transfer Dialog ────────────────────────────────────────────────────────
function TransferBookingDialog({ booking, currentTripId, onClose }: {
  booking: any; currentTripId: string; onClose: () => void;
}) {
  const { data: trips, isLoading } = useGroupTrips();
  const transfer = useTransferBooking();
  const [selectedTrip, setSelectedTrip] = useState('');
  const [reason, setReason] = useState('Cliente solicitou mudança');

  const otherTrips = trips?.filter((t: any) => t.id !== currentTripId && t.status === 'published') || [];

  const handleTransfer = () => {
    if (!selectedTrip || !reason) return;
    transfer.mutate({
      bookingId: booking.id,
      newTripId: selectedTrip,
      reason,
    }, { onSuccess: onClose });
  };

  return (
    <SheetPage
      open
      onClose={onClose}
      title="Transferir Reserva de Viagem"
      subtitle={`Mover ${booking.lead_name} para outro pacote publicado`}
      icon={ArrowRightLeft}
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleTransfer}
            disabled={transfer.isPending || !selectedTrip}
            className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {transfer.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Confirmar Transferência
          </Button>
        </div>
      }
    >
      {() => (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-bold text-amber-800">⚠️ Atenção</p>
            <p className="text-sm text-amber-700 mt-1">
              As <strong>cadeiras do ônibus atuais serão liberadas</strong>. O histórico financeiro será mantido.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Novo Pacote de Destino</label>
            {isLoading ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : (
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                  <SelectValue placeholder="Selecione o pacote de destino..." />
                </SelectTrigger>
                <SelectContent>
                  {otherTrips.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.title} ({fmtDate(t.departure_date)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-700">Motivo da Transferência</label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
            />
          </div>
        </div>
      )}
    </SheetPage>
  );
}

// ── Installment Row ───────────────────────────────────────────────────────────
function InstallmentRow({ inst, tripId }: {
  inst: any; tripId: string;
}) {
  const updateStatus = useUpdateInstallmentStatus(tripId);
  const isPaid = inst.status === 'paid';
  const isLate = !isPaid && (inst.status === 'late' || new Date(inst.due_date) < new Date());

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 text-sm border-t border-zinc-50 first:border-0',
      isLate && 'bg-red-50/30',
    )}>
      <div className={cn(
        'h-6 w-6 rounded-full flex items-center justify-center flex-none text-[10px] font-bold',
        isPaid ? 'bg-vj-green/10 text-vj-green'
          : isLate ? 'bg-red-100 text-red-600'
          : 'bg-zinc-100 text-zinc-500'
      )}>
        {inst.installment_number}
      </div>
      <span className="text-zinc-400 text-xs w-20 flex-none">{fmtDate(inst.due_date)}</span>
      <span className="font-bold text-vj-txt flex-1">{fmt(inst.amount)}</span>
      <span className={cn(
        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
        isPaid ? 'bg-vj-green/10 text-vj-green'
          : isLate ? 'bg-red-100 text-red-600'
          : 'bg-zinc-100 text-zinc-500'
      )}>
        {isPaid ? 'Pago' : isLate ? 'Atraso' : 'Pendente'}
      </span>
      {/* Quick actions */}
      {!isPaid && (
        <Button variant="ghost" size="sm" className="h-7 text-xs text-vj-green hover:bg-vj-green/10 rounded-lg"
          disabled={updateStatus.isPending}
          onClick={() => updateStatus.mutate({
            installmentId: inst.id, status: 'paid', paid_at: new Date().toISOString()
          })}>
          <Check size={12} className="mr-1" /> Marcar pago
        </Button>
      )}
      {isPaid && inst.paid_at && (
        <span className="text-[10px] text-zinc-400">{fmtDate(inst.paid_at)}</span>
      )}
    </div>
  );
}

// ── Booking Row ───────────────────────────────────────────────────────────────
function BookingRow({ booking, tripId }: { booking: any; tripId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'installments' | 'messages' | 'credits'>('installments');
  const [proofDialog, setProofDialog] = useState<{ bookingId: string; installmentId: string | null } | null>(null);
  const [transferDialog, setTransferDialog] = useState(false);

  const paymentColor = {
    fully_paid: 'bg-vj-green/10 text-vj-green',
    partial:    'bg-amber-50 text-amber-700',
    pending:    'bg-zinc-100 text-zinc-500',
    refunded:   'bg-blue-50 text-blue-600',
  }[booking.payment_status] ?? 'bg-zinc-100 text-zinc-500';

  const totalPaid = booking.installments
    .filter((i: any) => i.status === 'paid')
    .reduce((s: number, i: any) => s + Number(i.amount), 0);

  return (
    <>
      <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white hover:border-zinc-200 transition-colors">
        {/* Header row */}
        <button
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded
            ? <ChevronDown size={16} className="text-zinc-400 flex-none" />
            : <ChevronRight size={16} className="text-zinc-400 flex-none" />
          }
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-vj-txt truncate">{booking.lead_name}</p>
            <p className="text-xs text-zinc-400">{booking.lead_phone ?? booking.lead_email ?? '—'} · {booking.pax_count} pax</p>
          </div>
          {booking.seat_numbers?.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Bus size={10} /> {booking.seat_numbers.join(', ')}
            </span>
          )}
          <div className="text-right flex-none">
            <p className="font-black text-sm">{fmt(totalPaid)}</p>
            <p className="text-[10px] text-zinc-400">de {fmt(booking.total_amount)}</p>
          </div>
          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-none', paymentColor)}>
            {booking.payment_status === 'fully_paid' ? 'Pago' : booking.payment_status === 'partial' ? 'Parcial' : 'Pendente'}
          </span>
          {booking.proofs_pending_count > 0 && (
            <button
              className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 hover:bg-amber-100 transition-colors"
              onClick={e => { e.stopPropagation(); setProofDialog({ bookingId: booking.id, installmentId: null }); }}
            >
              <Upload size={10} /> {booking.proofs_pending_count} comprov.
            </button>
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-zinc-50 bg-zinc-50/50">
            {/* Tabs */}
            <div className="flex gap-0 border-b border-zinc-100">
              {(['installments', 'messages', 'credits'] as const).map(tab => {
                const labels = { installments: '💳 Parcelas', messages: '💬 Chat', credits: '🎁 Créditos' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 text-[11px] font-bold py-2 transition-colors',
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                        : 'text-zinc-400 hover:text-zinc-600',
                    )}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Installments tab */}
            {activeTab === 'installments' && (
              <div>
                {booking.installments.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">Sem parcelas geradas</p>
                ) : (
                  booking.installments
                    .sort((a: any, b: any) => a.installment_number - b.installment_number)
                    .map((inst: any) => (
                      <InstallmentRow key={inst.id} inst={inst} tripId={tripId} />
                    ))
                )}
                <div className="px-4 py-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-blue-600 hover:bg-blue-50 border-blue-100"
                    onClick={() => setTransferDialog(true)}>
                    <ArrowRightLeft size={12} /> Mudar pacote
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                    onClick={() => setProofDialog({ bookingId: booking.id, installmentId: null })}>
                    <Eye size={12} /> Ver comprovantes
                  </Button>
                </div>
              </div>
            )}

            {/* Messages tab */}
            {activeTab === 'messages' && (
              <div className="p-2">
                <BookingMessagesPanel bookingId={booking.id} leadName={booking.lead_name} />
              </div>
            )}

            {/* Credits tab */}
            {activeTab === 'credits' && (
              <div className="p-4">
                <BookingCreditsPanel bookingId={booking.id} currency={booking.currency ?? 'BRL'} />
              </div>
            )}
          </div>
        )}
      </div>

      {proofDialog && (
        <ProofsDialog
          bookingId={proofDialog.bookingId}
          installmentId={proofDialog.installmentId}
          onClose={() => setProofDialog(null)}
        />
      )}
      {transferDialog && (
        <TransferBookingDialog
          booking={booking}
          currentTripId={tripId}
          onClose={() => setTransferDialog(false)}
        />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GroupTripFinance() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: trip } = useGroupTrip(tripId);
  const { data: summary, isLoading: summaryLoading } = useGroupTripFinancialSummary(tripId);
  const { data: bookings, isLoading: bookingsLoading } = useGroupTripBookings(tripId);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = (bookings ?? []).filter(b => {
    const matchSearch = !search || b.lead_name.toLowerCase().includes(search.toLowerCase())
      || b.lead_phone?.includes(search);
    const matchStatus = filterStatus === 'all' || b.payment_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const exportToCsv = () => {
    if (!filtered || filtered.length === 0) return;
    const headers = ['Passageiro', 'Telefone', 'Email', 'Assentos', 'Status Pagamento', 'Total Viagem', 'Total Pago'];
    const csv = [
      headers.join(','),
      ...filtered.map(b => {
        const totalPaid = b.installments.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0);
        return [
          `"${b.lead_name}"`,
          `"${b.lead_phone || ''}"`,
          `"${b.lead_email || ''}"`,
          `"${b.seat_numbers?.join(';') || ''}"`,
          `"${b.payment_status}"`,
          b.total_amount,
          totalPaid
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fechamento_${trip?.title || 'viagem'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const currency = trip?.currency ?? 'BRL';
  const f = (v: number) => fmt(v, currency);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
              Financeiro da Viagem
            </p>
            <h1 className="font-heading font-black text-2xl text-vj-txt line-clamp-1">
              {trip?.title ?? 'Carregando...'}
            </h1>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/group-trips`)}>
            <ArrowLeft size={14} /> Voltar
          </Button>
        </div>

        {/* KPI Cards */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              label="Total previsto"
              value={f(summary.total_expected)}
              sub={`${summary.total_bookings} reservas · ${summary.total_pax} pax`}
              icon={DollarSign} color="zinc"
            />
            <KpiCard
              label="Arrecadado"
              value={f(summary.total_received)}
              sub={`${summary.bookings_paid} totalmente pagos`}
              icon={TrendingUp} color="green"
            />
            <KpiCard
              label="A receber"
              value={f(summary.total_pending)}
              sub={`${summary.bookings_partial} parciais · ${summary.bookings_pending} pendentes`}
              icon={Clock} color="blue"
            />
            <KpiCard
              label="Em atraso"
              value={f(summary.total_late)}
              sub={summary.proofs_pending > 0 ? `⚠ ${summary.proofs_pending} comprov. p/ revisar` : undefined}
              icon={AlertCircle} color={summary.total_late > 0 ? 'red' : 'zinc'}
            />
          </div>
        ) : null}

        {/* Margin card */}
        {summary && (
          <div className="bg-zinc-900 rounded-xl p-5 flex items-center justify-between text-white border border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Progresso de arrecadação</p>
              <p className="font-black text-3xl text-vj-green">
                {Math.round((summary.total_received / Math.max(summary.total_expected, 1)) * 100)}%
              </p>
              <p className="text-sm text-zinc-400">{f(summary.total_received)} de {f(summary.total_expected)}</p>
            </div>
            <div className="w-32 h-32 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="#22c55e" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${Math.round((summary.total_received / Math.max(summary.total_expected, 1)) * 100)} 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Wallet size={22} className="text-zinc-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Buscar passageiro..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="max-w-xs rounded-xl"
          />
          <div className="flex gap-1">
            {[
              { v: 'all', l: 'Todos' },
              { v: 'pending', l: 'Pendentes' },
              { v: 'partial', l: 'Parciais' },
              { v: 'fully_paid', l: 'Pagos' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setFilterStatus(v)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                  filterStatus === v
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportToCsv} className="ml-auto flex items-center gap-2">
            <Download size={14} /> Fechamento Excel
          </Button>
          <p className="text-xs text-zinc-400 ml-2">{filtered.length} registros</p>
        </div>

        {/* Bookings list */}
        {bookingsLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <Users size={40} className="mx-auto mb-2 opacity-30" />
            <p>Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(booking => (
              <BookingRow key={booking.id} booking={booking} tripId={tripId!} />
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
