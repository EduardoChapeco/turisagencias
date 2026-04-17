import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Save, Sparkles, Loader2, Plus, Trash2, X,
  Plane, Ship, Bus, Train, MapPin, Hotel, Camera, Star,
  Users, UserCheck, Tent, Image as ImageIcon,
} from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useClients } from '@/hooks/useClients';
import { useHotels } from '@/hooks/useHotels';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { InstallmentOption } from '@/types';

// ─── Types ────────────────────────────────────────────
interface DayItem {
  id: string; day: number; date: string;
  title: string; description: string; location: string;
  accommodation?: string; hotel_id?: string;
}
interface TransportItem {
  id: string; type: 'aereo' | 'maritimo' | 'onibus' | 'trem' | 'carro' | 'outro';
  from: string; to: string; operator: string; departure: string; arrival: string; notes: string;
}
interface ExcursionItem {
  id: string; title: string; description: string; duration: string;
  price_per_person: string; price_per_couple: string; price_per_family: string;
  included: boolean; media_url: string;
}

const TRANSPORT_TYPES = [
  { value: 'aereo', label: 'Aéreo ✈️', icon: Plane },
  { value: 'maritimo', label: 'Marítimo 🚢', icon: Ship },
  { value: 'onibus', label: 'Ônibus 🚌', icon: Bus },
  { value: 'trem', label: 'Trem 🚂', icon: Train },
  { value: 'carro', label: 'Carro / Transfer', icon: Plane },
  { value: 'outro', label: 'Outro', icon: MapPin },
];

const makeId = () => Math.random().toString(36).substring(2, 9);

// ─── Props ────────────────────────────────────────────
export interface QuotationBuilderSheetProps {
  open: boolean;
  onClose: () => void;
  clientId?: string;
}

export function QuotationBuilderSheet({ open, onClose, clientId }: QuotationBuilderSheetProps) {
  const navigate = useNavigate();
  const createQuotation = useCreateQuotation();
  const { data: clients } = useClients();
  const { data: hotels } = useHotels();
  const { organization } = useAuthStore();
  const { toast } = useToast();

  const [extracting, setExtracting] = useState(false);
  const [aiExtracted, setAiExtracted] = useState(false);
  const [aiRawResponse, setAiRawResponse] = useState<any>(null);
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);

  // ── Core fields
  const [form, setForm] = useState<any>({
    client_id: clientId || '',
    destination: '',
    hotel_name: '',
    hotel_stars: '',
    hotel_id: '',
    check_in: '',
    check_out: '',
    num_nights: '',
    meal_plan: '',
    room_type: '',
    total_value: '',
    currency: 'BRL',
    pricing_mode: 'per_person',
    valid_until: '',
    notes_internal: '',
    whatsapp_text: '',
    cover_image_url: '',
    media_urls: [] as string[],
    included_items: [] as string[],
    excluded_items: [] as string[],
  });

  // ── Multi-day
  const [itinerary, setItinerary] = useState<DayItem[]>([]);
  // ── Transports
  const [transports, setTransports] = useState<TransportItem[]>([]);
  // ── Excursions
  const [excursions, setExcursions] = useState<ExcursionItem[]>([]);
  // ── Includes/Excludes
  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  // ── Installments manual
  const [instType, setInstType] = useState('');
  const [instCount, setInstCount] = useState('');
  const [instValue, setInstValue] = useState('');

  useEffect(() => {
    if (open) {
      setForm((p: any) => ({ ...p, client_id: clientId || '' }));
    }
  }, [open, clientId]);

  const update = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }));

  // ── AI Extraction
  const handleAiExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((res) => {
        reader.onload = () => res((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke('extract-quotation', {
        body: { imageBase64: base64, org_id: organization?.id, client_id: form.client_id || null },
      });
      if (error) throw error;
      if (data?.data) {
        const d = data.data;
        setForm((p: any) => ({
          ...p,
          destination: d.destination || p.destination,
          hotel_name: d.hotel_name || p.hotel_name,
          hotel_stars: d.hotel_stars?.toString() || p.hotel_stars,
          check_in: d.check_in || p.check_in,
          check_out: d.check_out || p.check_out,
          num_nights: d.num_nights?.toString() || p.num_nights,
          meal_plan: d.meal_plan || p.meal_plan,
          room_type: d.room_type || p.room_type,
          total_value: d.total_value?.toString() || p.total_value,
          currency: d.currency || p.currency,
          whatsapp_text: d.whatsapp_text || p.whatsapp_text,
        }));
        if (d.installments?.length) setInstallments(d.installments);
        setAiExtracted(true);
        setAiRawResponse(d);
        toast({ title: '✨ IA extraiu os dados!', description: 'Revise e personalize antes de salvar.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na extração', description: err.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  // ── Itinerary helpers
  const addDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary(p => [...p, {
      id: makeId(), day: nextDay, date: '', title: `Dia ${nextDay}`,
      description: '', location: '', accommodation: '', hotel_id: '',
    }]);
  };
  const updateDay = (id: string, data: Partial<DayItem>) =>
    setItinerary(p => p.map(d => d.id === id ? { ...d, ...data } : d));
  const removeDay = (id: string) => setItinerary(p => p.filter(d => d.id !== id));

  // ── Transport helpers
  const addTransport = () => setTransports(p => [...p, {
    id: makeId(), type: 'aereo', from: '', to: '', operator: '', departure: '', arrival: '', notes: '',
  }]);
  const updateTransport = (id: string, data: Partial<TransportItem>) =>
    setTransports(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  const removeTransport = (id: string) => setTransports(p => p.filter(t => t.id !== id));

  // ── Excursion helpers
  const addExcursion = () => setExcursions(p => [...p, {
    id: makeId(), title: '', description: '', duration: '',
    price_per_person: '', price_per_couple: '', price_per_family: '',
    included: true, media_url: '',
  }]);
  const updateExcursion = (id: string, data: Partial<ExcursionItem>) =>
    setExcursions(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const removeExcursion = (id: string) => setExcursions(p => p.filter(e => e.id !== id));

  // ── Installment helpers
  const addInstallment = () => {
    if (!instType || !instCount || !instValue) return;
    setInstallments(p => [...p, { type: instType, installment_count: Number(instCount), value: Number(instValue) }]);
    setInstType(''); setInstCount(''); setInstValue('');
  };
  const removeInstallment = (i: number) => setInstallments(p => p.filter((_, idx) => idx !== i));

  // ── Save
  const handleSave = async () => {
    const result = await createQuotation.mutateAsync({
      destination: form.destination || undefined,
      hotel_name: form.hotel_name || undefined,
      hotel_stars: form.hotel_stars ? parseInt(form.hotel_stars) : undefined,
      check_in: form.check_in || undefined,
      check_out: form.check_out || undefined,
      num_nights: form.num_nights ? parseInt(form.num_nights) : undefined,
      meal_plan: form.meal_plan || undefined,
      room_type: form.room_type || undefined,
      total_value: form.total_value ? parseFloat(form.total_value) : undefined,
      currency: form.currency,
      client_id: form.client_id || undefined,
      whatsapp_text: form.whatsapp_text || undefined,
      installments: installments.length > 0 ? JSON.parse(JSON.stringify(installments)) : undefined,
      ai_extracted: aiExtracted,
      ai_raw_response: aiRawResponse,
      // Extended fields (new columns)
      cover_image_url: form.cover_image_url || undefined,
      itinerary: itinerary.length > 0 ? itinerary as any : undefined,
      transports: transports.length > 0 ? transports as any : undefined,
      excursions: excursions.length > 0 ? excursions as any : undefined,
      pricing_mode: form.pricing_mode || undefined,
      valid_until: form.valid_until || undefined,
      notes_internal: form.notes_internal || undefined,
      included_items: form.included_items,
      excluded_items: form.excluded_items,
      media_urls: form.media_urls,
    } as any);
    if (result) {
      onClose();
      navigate(`/quotations/${result.id}`);
    }
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title="Nova Cotação"
      subtitle="Construtor ultra-personalizado de orçamentos de viagem"
      icon={FileText}
      sections={[
        { id: 'destino', label: 'Destino & Hotel' },
        { id: 'itinerario', label: 'Itinerário Dia-a-Dia' },
        { id: 'transportes', label: 'Transportes' },
        { id: 'passeios', label: 'Passeios & Serviços' },
        { id: 'valores', label: 'Valores & Parcelas' },
        { id: 'midia', label: 'Mídia & Visual' },
        { id: 'cliente', label: 'Cliente & Envio' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!form.destination || createQuotation.isPending}
            className="bg-vj-green text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {createQuotation.isPending ? 'Salvando...' : 'Salvar Cotação'}
          </Button>
        </div>
      }
    >
      {(activeSection) => (
        <>
          {/* ══ DESTINO & HOTEL ══ */}
          {activeSection === 'destino' && (
            <div className="space-y-6">
              {/* AI Extraction */}
              <div className="p-4 rounded-2xl bg-vj-green/5 border border-vj-green/10">
                <p className="font-semibold text-sm text-vj-txt flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-vj-green" /> Extração por IA (upload de imagem/PDF)
                </p>
                <label className="cursor-pointer block">
                  <div className="flex items-center justify-center border-2 border-dashed border-vj-green/20 rounded-xl p-5 hover:bg-vj-green/5 transition-colors">
                    {extracting ? (
                      <span className="flex items-center gap-2 text-vj-green text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Extraindo com IA...
                      </span>
                    ) : (
                      <span className="text-sm text-vj-txt3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {aiExtracted ? '✅ Dados extraídos! Clique para extrair outro' : 'Clique para enviar cotação (print/PDF)'}
                      </span>
                    )}
                  </div>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAiExtract} disabled={extracting} />
                </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Destino *</Label>
                  <Input value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Cancún, México" className="border-vj-border bg-vj-bg" />
                </div>

                {/* Hotel Section */}
                <div className="p-4 rounded-2xl bg-vj-bg border border-vj-border space-y-3">
                  <Label className="font-semibold flex items-center gap-2 text-vj-txt">
                    <Hotel className="h-4 w-4 text-vj-green" /> Hospedagem
                  </Label>

                  {hotels && hotels.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-vj-txt3">Vincular hotel cadastrado</Label>
                      <Select value={form.hotel_id} onValueChange={(v) => {
                        const h = hotels.find((x: any) => x.id === v);
                        if (h) {
                          update('hotel_id', v);
                          update('hotel_name', h.name);
                          if (h.category) update('hotel_stars', h.category.toString());
                        }
                      }}>
                        <SelectTrigger className="border-vj-border bg-white">
                          <SelectValue placeholder="Selecionar hotel do banco..." />
                        </SelectTrigger>
                        <SelectContent>
                          {hotels.map((h: any) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} {h.city ? `— ${h.city}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Nome do Hotel</Label>
                      <Input value={form.hotel_name} onChange={(e) => update('hotel_name', e.target.value)} className="border-vj-border bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estrelas</Label>
                      <Select value={form.hotel_stars} onValueChange={(v) => update('hotel_stars', v)}>
                        <SelectTrigger className="border-vj-border bg-white"><SelectValue placeholder="★" /></SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s}★</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Check-in</Label>
                      <Input type="date" value={form.check_in} onChange={(e) => update('check_in', e.target.value)} className="border-vj-border bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Check-out</Label>
                      <Input type="date" value={form.check_out} onChange={(e) => update('check_out', e.target.value)} className="border-vj-border bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Noites</Label>
                      <Input type="number" value={form.num_nights} onChange={(e) => update('num_nights', e.target.value)} className="border-vj-border bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Regime</Label>
                      <Select value={form.meal_plan} onValueChange={(v) => update('meal_plan', v)}>
                        <SelectTrigger className="border-vj-border bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_inclusive">All Inclusive</SelectItem>
                          <SelectItem value="half_board">Meia Pensão</SelectItem>
                          <SelectItem value="bed_breakfast">Café da Manhã</SelectItem>
                          <SelectItem value="room_only">Só Hospedagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo de Quarto</Label>
                      <Input value={form.room_type} onChange={(e) => update('room_type', e.target.value)} placeholder="Superior, Deluxe..." className="border-vj-border bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ITINERÁRIO ══ */}
          {activeSection === 'itinerario' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-vj-txt">Itinerário Dia-a-Dia</h3>
                  <p className="text-xs text-vj-txt3">Crie o roteiro completo da viagem</p>
                </div>
                <Button variant="outline" size="sm" onClick={addDay}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Dia
                </Button>
              </div>

              <div className="space-y-4">
                {itinerary.map((day, idx) => (
                  <div key={day.id} className="relative p-5 rounded-2xl border border-vj-green/10 bg-vj-bg/50 group space-y-3">
                    <button
                      onClick={() => removeDay(day.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity "
                    >
                      <X className="h-3 w-3" />
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-vj-green text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {day.day}
                      </div>
                      <Input
                        value={day.title}
                        onChange={(e) => updateDay(day.id, { title: e.target.value })}
                        placeholder="Título do dia"
                        className="border-none bg-transparent font-bold text-vj-txt focus:ring-0 "
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Data</Label>
                        <Input type="date" value={day.date} onChange={(e) => updateDay(day.id, { date: e.target.value })} className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Local / Cidade</Label>
                        <Input value={day.location} onChange={(e) => updateDay(day.id, { location: e.target.value })} placeholder="Paris, França" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                    </div>

                    <Textarea
                      value={day.description}
                      onChange={(e) => updateDay(day.id, { description: e.target.value })}
                      placeholder="Descrição das atividades do dia..."
                      rows={3}
                      className="border-vj-border bg-vj-bg text-sm resize-none"
                    />

                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Hotel className="h-3 w-3" /> Acomodação do dia</Label>
                      {hotels && hotels.length > 0 ? (
                        <Select value={day.hotel_id} onValueChange={(v) => {
                          const h = hotels.find((x: any) => x.id === v);
                          updateDay(day.id, { hotel_id: v, accommodation: h?.name || '' });
                        }}>
                          <SelectTrigger className="border-vj-border bg-vj-bg h-8 text-sm">
                            <SelectValue placeholder="Selecionar hotel..." />
                          </SelectTrigger>
                          <SelectContent>
                            {hotels.map((h: any) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={day.accommodation} onChange={(e) => updateDay(day.id, { accommodation: e.target.value })} placeholder="Nome do hotel/pousada..." className="border-vj-border bg-vj-bg h-8 text-sm" />
                      )}
                    </div>
                  </div>
                ))}

                {itinerary.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-vj-border rounded-2xl">
                    <MapPin className="h-10 w-10 text-vj-txt3/20 mx-auto mb-3" />
                    <p className="text-vj-txt3 text-sm italic">Clique em "Adicionar Dia" para construir o roteiro</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ TRANSPORTES ══ */}
          {activeSection === 'transportes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-vj-txt">Transportes</h3>
                  <p className="text-xs text-vj-txt3">Aéreo, marítimo, terrestre e conexões</p>
                </div>
                <Button variant="outline" size="sm" onClick={addTransport}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Trecho
                </Button>
              </div>

              <div className="space-y-4">
                {transports.map((t) => (
                  <div key={t.id} className="relative p-5 rounded-2xl border border-vj-green/10 bg-vj-bg/50 group space-y-3">
                    <button onClick={() => removeTransport(t.id)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ">
                      <X className="h-3 w-3" />
                    </button>

                    <Select value={t.type} onValueChange={(v) => updateTransport(t.id, { type: v as any })}>
                      <SelectTrigger className="border-vj-border bg-vj-bg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSPORT_TYPES.map(tt => (
                          <SelectItem key={tt.value} value={tt.value}>{tt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">De</Label>
                        <Input value={t.from} onChange={(e) => updateTransport(t.id, { from: e.target.value })} placeholder="Florianópolis (FLN)" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Para</Label>
                        <Input value={t.to} onChange={(e) => updateTransport(t.id, { to: e.target.value })} placeholder="Cancún (CUN)" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Operadora</Label>
                        <Input value={t.operator} onChange={(e) => updateTransport(t.id, { operator: e.target.value })} placeholder="LATAM" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Partida</Label>
                        <Input type="datetime-local" value={t.departure} onChange={(e) => updateTransport(t.id, { departure: e.target.value })} className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Chegada</Label>
                        <Input type="datetime-local" value={t.arrival} onChange={(e) => updateTransport(t.id, { arrival: e.target.value })} className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                    </div>

                    <Input value={t.notes} onChange={(e) => updateTransport(t.id, { notes: e.target.value })} placeholder="Notas (voo, bagagem, escala...)" className="border-vj-border bg-vj-bg text-sm" />
                  </div>
                ))}

                {transports.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-vj-border rounded-2xl">
                    <Plane className="h-10 w-10 text-vj-txt3/20 mx-auto mb-3" />
                    <p className="text-vj-txt3 text-sm italic">Nenhum transporte adicionado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ PASSEIOS ══ */}
          {activeSection === 'passeios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-vj-txt">Passeios & Serviços</h3>
                  <p className="text-xs text-vj-txt3">Excursões, city tours, transfers, seguros...</p>
                </div>
                <Button variant="outline" size="sm" onClick={addExcursion}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Item
                </Button>
              </div>

              <div className="space-y-4">
                {excursions.map((exc) => (
                  <div key={exc.id} className="relative p-5 rounded-2xl border border-vj-green/10 bg-vj-bg/50 group space-y-3">
                    <button onClick={() => removeExcursion(exc.id)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ">
                      <X className="h-3 w-3" />
                    </button>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs">Nome do Passeio/Serviço</Label>
                        <Input value={exc.title} onChange={(e) => updateExcursion(exc.id, { title: e.target.value })} placeholder="City Tour Paris, Seguro Viagem..." className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Duração</Label>
                        <Input value={exc.duration} onChange={(e) => updateExcursion(exc.id, { duration: e.target.value })} placeholder="4h, 1 dia..." className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                    </div>

                    <Textarea value={exc.description} onChange={(e) => updateExcursion(exc.id, { description: e.target.value })} placeholder="Descrição do passeio..." rows={2} className="border-vj-border bg-vj-bg text-sm resize-none" />

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1"><UserCheck className="h-3 w-3" /> Por Pessoa</Label>
                        <Input value={exc.price_per_person} onChange={(e) => updateExcursion(exc.id, { price_per_person: e.target.value })} placeholder="R$ 0" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1"><Users className="h-3 w-3" /> Por Casal</Label>
                        <Input value={exc.price_per_couple} onChange={(e) => updateExcursion(exc.id, { price_per_couple: e.target.value })} placeholder="R$ 0" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs flex items-center gap-1"><Tent className="h-3 w-3" /> Por Família</Label>
                        <Input value={exc.price_per_family} onChange={(e) => updateExcursion(exc.id, { price_per_family: e.target.value })} placeholder="R$ 0" className="border-vj-border bg-vj-bg h-8 text-sm" />
                      </div>
                    </div>
                  </div>
                ))}

                {excursions.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-vj-border rounded-2xl">
                    <Star className="h-10 w-10 text-vj-txt3/20 mx-auto mb-3" />
                    <p className="text-vj-txt3 text-sm italic">Nenhum passeio ou serviço adicionado</p>
                  </div>
                )}
              </div>

              {/* Included / Excluded */}
              <div className="pt-6 border-t border-vj-border space-y-4">
                <div className="space-y-2">
                  <Label className="text-vj-txt font-semibold">✅ O que está incluído</Label>
                  <div className="flex gap-2">
                    <Input value={includeInput} onChange={(e) => setIncludeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && includeInput) { e.preventDefault(); update('included_items', [...form.included_items, includeInput]); setIncludeInput(''); }}} placeholder="Traslados, Seguro..." className="border-vj-border bg-vj-bg" />
                    <Button variant="outline" size="sm" onClick={() => { if (includeInput) { update('included_items', [...form.included_items, includeInput]); setIncludeInput(''); }}}>+</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.included_items.map((item: string, i: number) => (
                      <Badge key={i} className="gap-1 bg-green-500/10 text-green-700 border-green-200">
                        {item} <button onClick={() => update('included_items', form.included_items.filter((_: any, idx: number) => idx !== i))}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-vj-txt font-semibold">❌ Não está incluído</Label>
                  <div className="flex gap-2">
                    <Input value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && excludeInput) { e.preventDefault(); update('excluded_items', [...form.excluded_items, excludeInput]); setExcludeInput(''); }}} placeholder="Passagem aérea, Alimentação..." className="border-vj-border bg-vj-bg" />
                    <Button variant="outline" size="sm" onClick={() => { if (excludeInput) { update('excluded_items', [...form.excluded_items, excludeInput]); setExcludeInput(''); }}}>+</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.excluded_items.map((item: string, i: number) => (
                      <Badge key={i} className="gap-1 bg-red-500/10 text-red-700 border-red-200">
                        {item} <button onClick={() => update('excluded_items', form.excluded_items.filter((_: any, idx: number) => idx !== i))}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ VALORES ══ */}
          {activeSection === 'valores' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Valor Total</Label>
                  <Input type="number" step="0.01" value={form.total_value} onChange={(e) => update('total_value', e.target.value)} placeholder="0.00" className="border-vj-border bg-vj-bg" />
                </div>
                <div className="space-y-1.5">
                  <Label>Moeda</Label>
                  <Select value={form.currency} onValueChange={(v) => update('currency', v)}>
                    <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Precificação por</Label>
                  <Select value={form.pricing_mode} onValueChange={(v) => update('pricing_mode', v)}>
                    <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_person">Por Pessoa</SelectItem>
                      <SelectItem value="per_couple">Por Casal</SelectItem>
                      <SelectItem value="per_family">Por Família</SelectItem>
                      <SelectItem value="total">Pacote Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Válida até</Label>
                  <Input type="date" value={form.valid_until} onChange={(e) => update('valid_until', e.target.value)} className="border-vj-border bg-vj-bg" />
                </div>
              </div>

              {/* Parcelamentos */}
              <div className="pt-4 border-t border-vj-border space-y-4">
                <Label className="font-bold text-vj-txt">Opções de Parcelamento</Label>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo</Label>
                    <Input value={instType} onChange={(e) => setInstType(e.target.value)} placeholder="Ex: Cartão" className="border-vj-border bg-vj-bg h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Parcelas</Label>
                    <Input type="number" value={instCount} onChange={(e) => setInstCount(e.target.value)} placeholder="12" className="border-vj-border bg-vj-bg h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Valor/parcela</Label>
                    <Input type="number" value={instValue} onChange={(e) => setInstValue(e.target.value)} placeholder="0.00" className="border-vj-border bg-vj-bg h-8 text-sm" />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={addInstallment} disabled={!instType || !instCount || !instValue}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar parcela
                </Button>

                <div className="space-y-2">
                  {installments.map((inst, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-vj-bg border border-vj-border text-sm">
                      <span className="text-vj-txt">{inst.type} — {inst.installment_count}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: form.currency }).format(inst.value)}</span>
                      <button onClick={() => removeInstallment(i)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Observações Internas</Label>
                <Textarea value={form.notes_internal} onChange={(e) => update('notes_internal', e.target.value)} rows={3} placeholder="Notas privadas sobre a cotação..." className="border-vj-border bg-vj-bg resize-none" />
              </div>
            </div>
          )}

          {/* ══ MÍDIA ══ */}
          {activeSection === 'midia' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="font-semibold text-vj-txt flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-vj-green" /> Imagem de Capa do Orçamento
                </Label>
                <MediaUploader
                  multiple={false}
                  existingUrls={form.cover_image_url ? [form.cover_image_url] : []}
                  onUploadComplete={(urls) => update('cover_image_url', urls[0])}
                  folder="quotations/covers"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-semibold text-vj-txt flex items-center gap-2">
                  <Camera className="h-4 w-4 text-vj-green" /> Galeria de Fotos do Destino
                </Label>
                <MediaUploader
                  multiple
                  existingUrls={form.media_urls}
                  onUploadComplete={(urls) => update('media_urls', urls)}
                  folder="quotations/gallery"
                />
              </div>
            </div>
          )}

          {/* ══ CLIENTE ══ */}
          {activeSection === 'cliente' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <Label>Cliente</Label>
                <Select value={form.client_id} onValueChange={(v) => update('client_id', v)}>
                  <SelectTrigger className="border-vj-border bg-vj-bg">
                    <SelectValue placeholder="Selecione um cliente (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Texto para WhatsApp</Label>
                <Textarea
                  value={form.whatsapp_text}
                  onChange={(e) => update('whatsapp_text', e.target.value)}
                  rows={10}
                  placeholder="Olá! Preparamos uma cotação exclusiva para você..."
                  className="border-vj-border bg-vj-bg"
                />
              </div>
            </div>
          )}
        </>
      )}
    </SheetPage>
  );
}
