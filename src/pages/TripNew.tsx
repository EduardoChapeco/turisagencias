import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useCreateTrip } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TripNew() {
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

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Nova viagem</h1>
          <p className="text-sm text-muted-foreground">Crie o workspace central da viagem.</p>
        </div>

        <form
          className="space-y-6"
          onSubmit={async (event) => {
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
            navigate(`/trips/${trip.id}`);
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Resumo da viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Cartagena Ago 2026" required />
              </div>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quoting">quoting</SelectItem>
                      <SelectItem value="booked">booked</SelectItem>
                      <SelectItem value="confirmed">confirmed</SelectItem>
                      <SelectItem value="traveling">traveling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cidade destino</Label>
                  <Input value={form.destination_city} onChange={(e) => update('destination_city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>País destino</Label>
                  <Input value={form.destination_country} onChange={(e) => update('destination_country', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data de ida</Label>
                  <Input type="date" value={form.departure_date} onChange={(e) => update('departure_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de volta</Label>
                  <Input type="date" value={form.return_date} onChange={(e) => update('return_date', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hotel</Label>
                  <Input value={form.hotel_name} onChange={(e) => update('hotel_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Regime</Label>
                  <Input value={form.hotel_regime} onChange={(e) => update('hotel_regime', e.target.value)} placeholder="all_inclusive" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea value={form.notes_internal} onChange={(e) => update('notes_internal', e.target.value)} rows={4} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/trips')}>Cancelar</Button>
            <Button type="submit" disabled={createTrip.isPending}>{createTrip.isPending ? 'Salvando...' : 'Criar viagem'}</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
