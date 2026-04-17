import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TripNewSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();

  const [form, setForm] = useState({
    title: '',
    primary_client_id: '',
    destination_city: '',
    destination_country: '',
    departure_date: '',
    return_date: '',
    hotel_name: '',
    hotel_regime: '',
    status: 'quoting',
    notes_internal: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trip = await createTrip.mutateAsync({
      title: form.title,
      primary_client_id: form.primary_client_id || null,
      destination_city: form.destination_city || null,
      destination_country: form.destination_country || null,
      departure_date: form.departure_date || null,
      return_date: form.return_date || null,
      hotel_name: form.hotel_name || null,
      hotel_regime: form.hotel_regime || null,
      status: form.status,
      notes_internal: form.notes_internal || null,
    });
    
    // Reset form after creation
    setForm({
      title: '', primary_client_id: '', destination_city: '', destination_country: '',
      departure_date: '', return_date: '', hotel_name: '', hotel_regime: '',
      status: 'quoting', notes_internal: ''
    });
    
    onClose();
    navigate(`/trips/${trip.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent style={{ width: '100%', maxWidth: 540 }} className="p-0 flex flex-col items-stretch max-h-screen">
        <div className="p-6 border-b border-zinc-100 flex-shrink-0">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl font-black text-vj-txt">Nova Viagem</SheetTitle>
            <SheetDescription>
              Abra um novo workspace central da viagem para conectar voos e hóspedes.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="new-trip-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ex: Férias em Cartagena (Ago/2026)" className="h-12 rounded-xl bg-zinc-50 border-zinc-200" required />
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cliente principal</Label>
                  <ClientSearchSelect
                    value={form.primary_client_id}
                    onChange={(value) => update('primary_client_id', value)}
                    placeholder="Buscar cliente..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => update('status', value)}>
                    <SelectTrigger className="h-10 border-zinc-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quoting">Em Cotação</SelectItem>
                      <SelectItem value="booked">Reservado</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="traveling">Em Viagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cidade destino</Label>
                  <Input value={form.destination_city} placeholder="Ex: Paris" className="bg-zinc-50 border-zinc-200" onChange={(e) => update('destination_city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>País destino</Label>
                  <Input value={form.destination_country} placeholder="Ex: França" className="bg-zinc-50 border-zinc-200" onChange={(e) => update('destination_country', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data de ida</Label>
                  <Input type="date" value={form.departure_date} className="bg-zinc-50 border-zinc-200" onChange={(e) => update('departure_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de volta</Label>
                  <Input type="date" value={form.return_date} className="bg-zinc-50 border-zinc-200" onChange={(e) => update('return_date', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hotel Previsto</Label>
                  <Input value={form.hotel_name} className="bg-zinc-50 border-zinc-200" onChange={(e) => update('hotel_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Regime (Meals)</Label>
                  <Input value={form.hotel_regime} className="bg-zinc-50 border-zinc-200" onChange={(e) => update('hotel_regime', e.target.value)} placeholder="Ex: All Inclusive" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea value={form.notes_internal} className="bg-zinc-50 border-zinc-200 resize-none h-24" onChange={(e) => update('notes_internal', e.target.value)} placeholder="Passageiro tem pedido de dieta especial..." />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-100 bg-white flex-shrink-0">
          <SheetFooter className="flex items-center gap-3 w-full sm:justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="new-trip-form" className="premium-button w-full sm:w-auto text-base " disabled={createTrip.isPending}>
              {createTrip.isPending ? 'Montando espaço...' : 'Criar Viagem'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
