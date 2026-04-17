import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePublicBooking } from '@/hooks/useGroupTrips';

interface Props {
  tripId: string;
  orgId: string;
  pricePerPax: number;
  onSuccess?: (token: string) => void;
}

export function PublicBookingForm({ tripId, orgId, pricePerPax, onSuccess }: Props) {
  const create = useCreatePublicBooking();
  const [form, setForm] = useState({
    lead_name: '', lead_email: '', lead_phone: '', lead_cpf: '', pax_count: 1,
  });
  const [done, setDone] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await create.mutateAsync({
      group_trip_id: tripId,
      org_id: orgId,
      lead_name: form.lead_name,
      lead_email: form.lead_email || undefined,
      lead_phone: form.lead_phone || undefined,
      lead_cpf: form.lead_cpf || undefined,
      pax_count: Number(form.pax_count),
      total_amount: Number(form.pax_count) * pricePerPax,
    });
    setDone(result.public_token);
    onSuccess?.(result.public_token);
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="h-12 w-12 mx-auto rounded-full bg-vj-green/10 text-vj-green flex items-center justify-center">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h3 className="font-bold text-vj-txt text-lg">Reserva criada!</h3>
          <p className="text-sm text-vj-txt3 mt-1">Seu voucher e carnê foram gerados.</p>
        </div>
        <Button onClick={() => window.location.href = `/voucher/${done}`} className="w-full">
          Ver meu voucher
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label>Nome completo *</Label>
        <Input required value={form.lead_name} onChange={e => setForm({ ...form, lead_name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>WhatsApp</Label>
          <Input value={form.lead_phone} onChange={e => setForm({ ...form, lead_phone: e.target.value })} />
        </div>
        <div>
          <Label>CPF</Label>
          <Input value={form.lead_cpf} onChange={e => setForm({ ...form, lead_cpf: e.target.value })} />
        </div>
      </div>
      <div>
        <Label>E-mail</Label>
        <Input type="email" value={form.lead_email} onChange={e => setForm({ ...form, lead_email: e.target.value })} />
      </div>
      <div>
        <Label>Quantidade de passageiros</Label>
        <Input type="number" min={1} value={form.pax_count}
          onChange={e => setForm({ ...form, pax_count: Number(e.target.value) })} />
        <p className="text-xs text-vj-txt3 mt-1">
          Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(form.pax_count) * pricePerPax)}
        </p>
      </div>
      <Button type="submit" className="w-full gap-2" disabled={create.isPending}>
        {create.isPending && <Loader2 className="animate-spin" size={14} />}
        Reservar e gerar carnê
      </Button>
      <p className="text-[11px] text-vj-txt3 text-center">
        Você receberá um voucher e carnê com parcelas até a data de embarque.
      </p>
    </form>
  );
}
