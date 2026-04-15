import { useState, useEffect } from 'react';
import { Plane, Save, MapPin, Users, Hotel, CreditCard, FileText, Shield } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useUpdateTrip } from '@/hooks/useTrips';

const TRIP_STATUSES: { value: string; label: string }[] = [
  { value: 'quoting',    label: 'Em Cotação' },
  { value: 'booked',    label: 'Reservado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'traveling', label: 'Em Viagem' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

const MEAL_PLANS = [
  { value: 'all_inclusive', label: 'All Inclusive' },
  { value: 'breakfast',     label: 'Café da Manhã' },
  { value: 'half_board',    label: 'Meia Pensão' },
  { value: 'full_board',    label: 'Pensão Completa' },
  { value: 'none',          label: 'Sem Refeição' },
];

interface TripEditSheetProps {
  trip: Record<string, unknown> & {
    id: string;
    title: string;
    status: string;
  };
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TripEditSheet({ trip, open, onClose, onSuccess }: TripEditSheetProps) {
  const updateTrip = useUpdateTrip();

  const str = (v: unknown) => (v as string) ?? '';
  const num = (v: unknown) => v != null ? Number(v) : undefined;

  const [form, setForm] = useState({
    title: str(trip.title),
    status: str(trip.status) || 'quoting',
    primary_client_id: str(trip.primary_client_id),
    destination_city: str(trip.destination_city),
    destination_country: str(trip.destination_country),
    departure_date: str(trip.departure_date),
    return_date: str(trip.return_date),
    num_nights: num(trip.num_nights) ?? '',
    pax_count: num(trip.pax_count) ?? '',
    hotel_name: str(trip.hotel_name),
    hotel_regime: str(trip.hotel_regime),
    meal_plan: str(trip.meal_plan),
    room_type: str(trip.room_type),
    airline: str(trip.airline),
    flight_number: str(trip.flight_number),
    locator_code: str(trip.locator_code),
    total_value: num(trip.total_value) ?? '',
    insurance_company: str(trip.insurance_company),
    insurance_policy: str(trip.insurance_policy),
    notes_internal: str(trip.notes_internal),
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: str(trip.title),
        status: str(trip.status) || 'quoting',
        primary_client_id: str(trip.primary_client_id),
        destination_city: str(trip.destination_city),
        destination_country: str(trip.destination_country),
        departure_date: str(trip.departure_date)?.slice(0, 10) ?? '',
        return_date: str(trip.return_date)?.slice(0, 10) ?? '',
        num_nights: num(trip.num_nights) ?? '',
        pax_count: num(trip.pax_count) ?? 1,
        hotel_name: str(trip.hotel_name),
        hotel_regime: str(trip.hotel_regime),
        meal_plan: str(trip.meal_plan),
        room_type: str(trip.room_type),
        airline: str(trip.airline),
        flight_number: str(trip.flight_number),
        locator_code: str(trip.locator_code),
        total_value: num(trip.total_value) ?? '',
        insurance_company: str(trip.insurance_company),
        insurance_policy: str(trip.insurance_policy),
        notes_internal: str(trip.notes_internal),
      });
    }
  }, [open, trip]);

  const u = (field: string, value: unknown) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    await updateTrip.mutateAsync({
      id: trip.id,
      title: form.title,
      status: form.status,
      primary_client_id: form.primary_client_id || null,
      destination_city: form.destination_city || null,
      destination_country: form.destination_country || null,
      departure_date: form.departure_date || null,
      return_date: form.return_date || null,
      num_nights: form.num_nights !== '' ? Number(form.num_nights) : null,
      pax_count: form.pax_count != null && form.pax_count !== '' ? Number(form.pax_count) : null,
      hotel_name: form.hotel_name || null,
      hotel_regime: form.hotel_regime || null,
      meal_plan: form.meal_plan || null,
      room_type: form.room_type || null,
      airline: form.airline || null,
      flight_number: form.flight_number || null,
      locator_code: form.locator_code || null,
      total_value: form.total_value !== '' ? Number(form.total_value) : null,
      insurance_company: form.insurance_company || null,
      insurance_policy: form.insurance_policy || null,
      notes_internal: form.notes_internal || null,
    });
    onSuccess?.();
    onClose();
  };

  const field = (label: string, key: string, props: Record<string, unknown> = {}) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">{label}</Label>
      <Input
        value={form[key as keyof typeof form] as string}
        onChange={(e) => u(key, e.target.value)}
        className="border-vj-border h-11 text-sm"
        {...props}
      />
    </div>
  );

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={`Editar: ${form.title || 'Viagem'}`}
      subtitle="Dados completos da viagem"
      icon={Plane}
      sections={[
        { id: 'geral',      label: 'Dados Gerais',  icon: MapPin },
        { id: 'hospedagem', label: 'Hospedagem',    icon: Hotel },
        { id: 'voos',       label: 'Voos & Localizador', icon: Plane },
        { id: 'financeiro', label: 'Financeiro',    icon: CreditCard },
        { id: 'seguro',     label: 'Seguro',        icon: Shield },
        { id: 'notas',      label: 'Notas Internas',icon: FileText },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => void handleSave()} disabled={!form.title || updateTrip.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateTrip.isPending ? 'Salvando...' : 'Salvar Viagem'}
          </Button>
        </div>
      }
    >
      {(activeSection) => (
        <div className="space-y-5">
          {activeSection === 'geral' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Nome da Viagem *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => u('title', e.target.value)}
                  className="border-vj-border h-11 text-sm"
                  placeholder="Ex: Cartagena Agosto 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Status</Label>
                  <Select value={form.status} onValueChange={(v) => u('status', v)}>
                    <SelectTrigger className="border-vj-border h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIP_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Nº de Passageiros (Pax)</Label>
                  <Input
                    type="number" min={1}
                    value={form.pax_count}
                    onChange={(e) => u('pax_count', e.target.value)}
                    className="border-vj-border h-11"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Cliente Principal</Label>
                <ClientSearchSelect
                  value={form.primary_client_id}
                  onChange={(v) => u('primary_client_id', v)}
                  placeholder="Buscar cliente..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('Cidade Destino', 'destination_city', { placeholder: 'Ex: Cartagena' })}
                {field('País', 'destination_country', { placeholder: 'Ex: Colômbia' })}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('Data de Ida', 'departure_date', { type: 'date' })}
                {field('Data de Volta', 'return_date', { type: 'date' })}
              </div>
              {field('Número de Noites', 'num_nights', { type: 'number', min: 0 })}
            </>
          )}

          {activeSection === 'hospedagem' && (
            <>
              {field('Nome do Hotel / Resort', 'hotel_name', { placeholder: 'Ex: Iberostar Cartagena' })}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Regime Alimentar</Label>
                  <Select value={form.meal_plan} onValueChange={(v) => u('meal_plan', v)}>
                    <SelectTrigger className="border-vj-border h-11"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {MEAL_PLANS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {field('Tipo de Quarto', 'room_type', { placeholder: 'Ex: Standard Garden View' })}
              </div>
              {field('Regime (Interno)', 'hotel_regime', { placeholder: 'Ex: all_inclusive' })}
            </>
          )}

          {activeSection === 'voos' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {field('Companhia Aérea', 'airline', { placeholder: 'Ex: LATAM' })}
                {field('Número do Voo', 'flight_number', { placeholder: 'Ex: LA 4523' })}
              </div>
              {field('Localizador / PNR', 'locator_code', { placeholder: 'Ex: XBRTJ4', className: 'font-mono uppercase' })}
            </>
          )}

          {activeSection === 'financeiro' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Valor Total (R$)</Label>
              <Input
                type="number" min={0} step="0.01"
                value={form.total_value}
                onChange={(e) => u('total_value', e.target.value)}
                className="border-vj-border h-11"
                placeholder="0,00"
              />
            </div>
          )}

          {activeSection === 'seguro' && (
            <>
              {field('Seguradora', 'insurance_company', { placeholder: 'Ex: Assist Card' })}
              {field('Número da Apólice', 'insurance_policy', { placeholder: 'Ex: AC-2024-00123' })}
            </>
          )}

          {activeSection === 'notas' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-vj-txt2 uppercase tracking-wide">Notas Internas</Label>
              <Textarea
                value={form.notes_internal}
                onChange={(e) => u('notes_internal', e.target.value)}
                className="border-vj-border min-h-[180px] resize-y"
                placeholder="Observações internas sobre esta viagem..."
              />
            </div>
          )}
        </div>
      )}
    </SheetPage>
  );
}
