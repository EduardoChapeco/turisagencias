import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle2, Clock, Loader2, Download, Ticket } from 'lucide-react';
import { usePublicBooking } from '@/hooks/useGroupTrips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PublicBookingVoucher() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading } = usePublicBooking(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vj-bg">
        <Loader2 className="animate-spin text-vj-green" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-vj-bg p-6">
        <h1 className="text-2xl font-bold text-vj-txt mb-2">Reserva não encontrada</h1>
        <p className="text-vj-txt3">Verifique o link ou contate a agência.</p>
      </div>
    );
  }

  const { booking, installments } = data;
  const trip = booking.group_trips;
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: trip?.currency || 'BRL' }).format(Number(v || 0));
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const totalPaid = installments.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalDue = Number(booking.total_amount) - totalPaid;

  return (
    <div className="min-h-screen bg-vj-bg py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Voucher Card */}
        <div className="bg-white rounded-vj-r shadow-lg overflow-hidden border border-vj-border">
          {trip?.cover_image_url && (
            <div className="h-40 bg-vj-bg overflow-hidden">
              <img src={trip.cover_image_url} alt={trip.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="mb-2 gap-1.5">
                  <Ticket size={12} /> Voucher de Reserva
                </Badge>
                <h1 className="text-2xl font-bold text-vj-txt">{trip?.title}</h1>
                <p className="text-sm text-vj-txt3 mt-1">Código: {booking.voucher_code || booking.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'pending' ? 'Aguardando pagamento' : booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-vj-border">
              <Info label="Destino" value={trip?.destination} icon={<MapPin size={14} />} />
              <Info label="Embarque" value={fmtDate(trip?.departure_date)} icon={<Calendar size={14} />} />
              <Info label="Passageiros" value={String(booking.pax_count)} icon={<Users size={14} />} />
              <Info label="Total" value={fmt(Number(booking.total_amount))} highlight />
            </div>

            <div className="bg-vj-bg rounded-vj-r p-4 mt-4">
              <p className="text-xs uppercase text-vj-txt3 tracking-wider mb-1">Titular da reserva</p>
              <p className="font-semibold text-vj-txt">{booking.lead_name}</p>
              {booking.lead_email && <p className="text-xs text-vj-txt3">{booking.lead_email}</p>}
              {booking.lead_phone && <p className="text-xs text-vj-txt3">{booking.lead_phone}</p>}
            </div>
          </div>
        </div>

        {/* Carnê */}
        <div className="bg-white rounded-vj-r shadow-sm border border-vj-border overflow-hidden">
          <div className="px-6 py-4 border-b border-vj-border flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold text-vj-txt">Carnê de pagamento</h2>
              <p className="text-xs text-vj-txt3">{installments.length} parcelas — última vence antes da viagem</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-vj-txt3">Saldo devedor</p>
              <p className="font-bold text-lg text-vj-green">{fmt(totalDue)}</p>
            </div>
          </div>
          <div className="divide-y divide-vj-border">
            {installments.map((inst: any) => {
              const isPaid = inst.status === 'paid';
              const isLate = !isPaid && new Date(inst.due_date) < new Date();
              return (
                <div key={inst.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPaid ? 'bg-vj-green/10 text-vj-green' : isLate ? 'bg-destructive/10 text-destructive' : 'bg-vj-bg text-vj-txt3'
                    }`}>
                      {isPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-vj-txt">Parcela {inst.installment_number}</p>
                      <p className="text-xs text-vj-txt3">Vence em {fmtDate(inst.due_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-vj-txt">{fmt(Number(inst.amount))}</p>
                    <p className="text-[11px] text-vj-txt3">{isPaid ? 'Pago' : isLate ? 'Em atraso' : 'A vencer'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Download size={14} /> Baixar / Imprimir voucher
          </Button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon, highlight }: { label: string; value?: string | null; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-vj-txt3 tracking-wider flex items-center gap-1">{icon}{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? 'font-bold text-vj-green text-base' : 'font-medium text-vj-txt'}`}>{value || '—'}</p>
    </div>
  );
}
