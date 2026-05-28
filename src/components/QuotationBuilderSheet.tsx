import { useState } from 'react';
import {
 Save, Loader2, Plus, X, MapPin, Hotel,
 Plane, Tent, CheckCircle2, Calendar, DollarSign, Image as ImageIcon, Users, Video, Link2
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
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuotationForm } from './quotation-builder/useQuotationForm';
import { LocationCombobox } from '@/components/ui/LocationCombobox';
import { cn } from '@/lib/utils';

const TRANSPORT_TYPES = [
 { value: 'aereo', label: 'Aéreo ✈️' },
 { value: 'maritimo', label: 'Marítimo 🚢' },
 { value: 'onibus', label: 'Ônibus 🚌' },
 { value: 'trem', label: 'Trem 🚂' },
 { value: 'carro', label: 'Carro / Transfer' },
 { value: 'outro', label: 'Outro' },
];

const MEAL_PLANS: Record<string,string> = { all_inclusive:'All Inclusive', half_board:'Meia Pensão', bed_breakfast:'Café da Manhã', room_only:'Só Hospedagem' };
const ROOM_TYPES: Record<string,string> = { standard:'Standard', superior:'Superior', deluxe:'Deluxe', suite:'Suíte', family:'Familiar', twin:'Twin' };

const SECTIONS = [
 { id: 'hospedagem', label: 'Hospedagem', icon: Hotel },
 { id: 'itinerario', label: 'Itinerário', icon: Calendar },
 { id: 'transportes', label: 'Transportes', icon: Plane },
 { id: 'passeios', label: 'Passeios', icon: Tent },
 { id: 'valores', label: 'Valores', icon: DollarSign },
 { id: 'fechamento', label: 'Finalizar', icon: CheckCircle2 },
];

export interface QuotationBuilderSheetProps {
 open: boolean;
 onClose: () => void;
 clientId?: string;
 /** Chamado após criação bem-sucedida com o ID da nova cotação */
 onCreated?: (id: string) => void;
}

export function QuotationBuilderSheet({ open, onClose, clientId, onCreated }: QuotationBuilderSheetProps) {
 const createQuotation = useCreateQuotation();
 const { data: clients } = useClients();
 const { organization } = useAuthStore();
 const { toast } = useToast();

 const [currentStep, setCurrentStep] = useState(0);
 const [extracting, setExtracting] = useState(false);

 // Use separated state hook
 const state = useQuotationForm(clientId);
 const {
 form, updateForm,
 itinerary, addDay, updateDay, removeDay,
 transports, addTransport, updateTransport, removeTransport,
 excursions, addExcursion, updateExcursion, removeExcursion,
 installments, addInstallment, removeInstallment,
 aiExtracted, setAiExtracted, aiRawResponse, setAiRawResponse, reset
 } = state;

 const [includeInput, setIncludeInput] = useState('');
 const [excludeInput, setExcludeInput] = useState('');
 const [instType, setInstType] = useState('');
 const [instCount, setInstCount] = useState('');
 const [instValue, setInstValue] = useState('');

 const handleOpen = () => { reset(); if (clientId) updateForm('client_id', clientId); };

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
 updateForm('destination', d.destination || form.destination);
 updateForm('hotel_name', d.hotel_name || form.hotel_name);
 if (d.hotel_stars) updateForm('hotel_stars', d.hotel_stars.toString());
 if (d.check_in) updateForm('check_in', d.check_in);
 if (d.check_out) updateForm('check_out', d.check_out);
 if (d.num_nights) updateForm('num_nights', d.num_nights.toString());
 if (d.num_adults) updateForm('num_adults', d.num_adults.toString());
 if (d.num_children) updateForm('num_children', d.num_children.toString());
 if (d.meal_plan) updateForm('meal_plan', d.meal_plan);
 if (d.room_type) updateForm('room_type', d.room_type);
 if (d.total_value) updateForm('total_value', d.total_value.toString());
 if (d.currency) updateForm('currency', d.currency);
 if (d.whatsapp_text) updateForm('whatsapp_text', d.whatsapp_text);
 if (d.installments?.length) state.setInstallments(d.installments);
 
 setAiExtracted(true);
 setAiRawResponse(d);
 toast({ title: '✨ IA extraiu os dados!', description: 'Revise e siga para a próxima etapa.' });
 }
 } catch (err: any) {
 toast({ title: 'Erro na extração', description: err.message, variant: 'destructive' });
 } finally {
 setExtracting(false);
 }
 };

 const SECTION_STEP: Record<string,number> = { hospedagem:0, itinerario:1, transportes:2, passeios:3, valores:4, fechamento:5 };

 const handleSave = async () => {
 const numAdults = form.num_adults ? parseInt(form.num_adults) : 1;
 const numChildren = form.num_children ? parseInt(form.num_children) : 0;
 const numSeniores = form.num_seniores ? parseInt(form.num_seniores) : 0;
 const numInfantil = form.num_infantil ? parseInt(form.num_infantil) : 0;
 const result = await createQuotation.mutateAsync({
 destination: form.destination || undefined,
 hotel_name: form.hotel_name || undefined,
 hotel_stars: form.hotel_stars ? parseInt(form.hotel_stars) : undefined,
 check_in: form.check_in || undefined,
 check_out: form.check_out || undefined,
 num_nights: form.num_nights ? parseInt(form.num_nights) : undefined,
 num_adults: numAdults,
 pax_seniores: numSeniores,
 num_children: numChildren,
 pax_infantil: numInfantil,
 total_pax: numAdults + numSeniores + numChildren + numInfantil,
 meal_plan: form.meal_plan || undefined,
 room_type: form.room_type || undefined,
 total_value: form.total_value ? parseFloat(form.total_value) : undefined,
 currency: form.currency,
 client_id: form.client_id || undefined,
 whatsapp_text: form.whatsapp_text || undefined,
 installments: installments.length > 0 ? installments : undefined,
 ai_extracted: aiExtracted,
 ai_raw_response: aiRawResponse,
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
 layout_mode: form.layout_mode,
 } as any);
 if (result) { onClose(); onCreated?.(result.id); }
 };

 // Map activeSection to step index for StepContent switch
 const sectionToStep = (s: string) => SECTION_STEP[s] ?? 0;


 const StepContent = ({ currentStep }: { currentStep: number }) => {
 switch (currentStep) {
 case 0:
 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="flex justify-end">
 <label className="cursor-pointer">
 <div className="px-4 py-2 rounded-full text-sm font-bold text-vj-green border border-vj-green/30 hover:bg-vj-green/10 transition-colors flex items-center gap-2">
 {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
 {extracting ? 'Analisando...' : (aiExtracted ? 'Anexar outro arquivo' : 'Upload IA')}
 </div>
 <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAiExtract} disabled={extracting} />
 </label>
 </div>

 <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
 <div className="min-w-0 space-y-4">
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Destino Principal *</Label>
 <LocationCombobox value={form.destination} onChange={(v) => updateForm('destination', v)} placeholder="Ex: Paris, França" />
 </div>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Check-in</Label>
 <Input type="date" value={form.check_in} onChange={(e) => updateForm('check_in', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Check-out</Label>
 <Input type="date" value={form.check_out} onChange={(e) => updateForm('check_out', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Adultos (ADT)</Label>
 <Input type="number" min="0" value={form.num_adults} onChange={(e) => updateForm('num_adults', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Seniores (SNR)</Label>
 <Input type="number" min="0" value={form.num_seniores ?? '0'} onChange={(e) => updateForm('num_seniores', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Crianças (CHD)</Label>
 <Input type="number" min="0" value={form.num_children} onChange={(e) => updateForm('num_children', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="font-bold text-zinc-700">Infantis (INF)</Label>
 <Input type="number" min="0" value={form.num_infantil ?? '0'} onChange={(e) => updateForm('num_infantil', e.target.value)} className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" />
 </div>
 </div>
 </div>
 
 <div className="min-w-0 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
 <h3 className="font-bold flex items-center gap-2"><Hotel className="text-zinc-400" /> Detalhes da Hospedagem</h3>
 <div className="space-y-1.5">
 <Label>Nome do Hotel Base</Label>
 <Input value={form.hotel_name} onChange={(e) => updateForm('hotel_name', e.target.value)} className="bg-white border-zinc-200 rounded-xl" />
 </div>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label>Categoria</Label>
 <Select value={form.hotel_stars} onValueChange={(v) => updateForm('hotel_stars', v)}>
 <SelectTrigger className="bg-white border-zinc-200 rounded-xl"><SelectValue placeholder="Estrelas" /></SelectTrigger>
 <SelectContent>
 {[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s}★</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label>Regime</Label>
 <Select value={form.meal_plan} onValueChange={(v) => updateForm('meal_plan', v)}>
 <SelectTrigger className="bg-white border-zinc-200 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all_inclusive">All Inclusive</SelectItem>
 <SelectItem value="half_board">Meia Pensão</SelectItem>
 <SelectItem value="bed_breakfast">Café da Manhã</SelectItem>
 <SelectItem value="room_only">Só Hospedagem</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs">Galeria de Fotos (Hotel/Destino)</Label>
 <MediaUploader
 multiple={true}
 existingUrls={form.media_urls || []}
 onUploadComplete={(urls) => updateForm('media_urls', urls)}
 folder="quotations/gallery"
 aspectRatio={16 / 9}
 ownerType="quotation"
 ownerId={null}
 fieldName="media_urls"
 />
 </div>
 </div>
 </div>
 </div>
 );
 case 1:
 return (
 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200">
 <p className="text-sm text-zinc-600 font-medium">Crie a narrativa da viagem adicionando o itinerário dia a dia.</p>
 <Button onClick={addDay} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/> Novo Dia</Button>
 </div>
 {itinerary.length === 0 ? (
 <div className="py-12 text-center text-zinc-400">Clique acima para adicionar o 1º dia.</div>
 ) : (
 <div className="space-y-4">
 {itinerary.map(day => (
 <div key={day.id} className="p-4 rounded-xl border border-zinc-200 relative group bg-white">
 <button onClick={() => removeDay(day.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
 <div className="flex gap-4">
 <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center font-black text-xl text-zinc-400 shrink-0">{day.day}</div>
 <div className="flex-1 space-y-3">
 <Input value={day.title} onChange={(e) => updateDay(day.id, { title: e.target.value })} className="font-bold text-lg border-0 px-0 h-auto focus-visible:ring-0 rounded-none border-b border-dashed border-zinc-200" placeholder="Título do dia (Ex: Chegada em Paris)"/>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <Input type="date" value={day.date} onChange={(e) => updateDay(day.id, { date: e.target.value })} className="bg-zinc-50 rounded-xl border-zinc-200 h-9" />
 <LocationCombobox value={day.location} onChange={(v) => updateDay(day.id, { location: v })} placeholder="Local/Cidade" />
 </div>
 <Textarea value={day.description} onChange={(e) => updateDay(day.id, { description: e.target.value })} rows={2} placeholder="O que vai acontecer neste dia..." className="bg-zinc-50 rounded-xl border-zinc-200 resize-none text-sm"/>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
   <div className="space-y-1.5">
     <Label className="text-xs text-zinc-500 flex items-center gap-1"><Video className="w-3.5 h-3.5" /> URL do Vídeo (YouTube / Vimeo)</Label>
     <Input value={(day as any).video_url || ''} onChange={(e) => updateDay(day.id, { video_url: e.target.value } as any)} placeholder="https://youtube.com/embed/..." className="bg-zinc-50 rounded-xl border-zinc-200 h-9 text-xs" />
   </div>
   <div className="space-y-1.5">
     <Label className="text-xs text-zinc-500 flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> Foto do Dia (URL)</Label>
     <Input value={(day as any).image_url || ''} onChange={(e) => updateDay(day.id, { image_url: e.target.value } as any)} placeholder="https://..." className="bg-zinc-50 rounded-xl border-zinc-200 h-9 text-xs" />
   </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 case 2:
 return (
 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="flex justify-end mb-4"><Button onClick={addTransport} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/> Novo Transporte</Button></div>
 {transports.length === 0 ? <div className="py-12 text-center text-zinc-400">Nenhum transporte inserido.</div> : (
 <div className="space-y-4">
 {transports.map(t => (
 <div key={t.id} className="relative grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 group md:grid-cols-3">
 <button onClick={() => removeTransport(t.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100"><X className="w-3 h-3"/></button>
 <Select value={t.type} onValueChange={(v) => updateTransport(t.id, { type: v })}>
 <SelectTrigger className="bg-zinc-50 rounded-xl border-zinc-200"><SelectValue /></SelectTrigger>
 <SelectContent>{TRANSPORT_TYPES.map(tt => <SelectItem key={tt.value} value={tt.value}>{tt.label}</SelectItem>)}</SelectContent>
 </Select>
 <LocationCombobox value={t.from} onChange={(v) => updateTransport(t.id, { from: v })} placeholder="Origem (ex: GRU)" />
 <LocationCombobox value={t.to} onChange={(v) => updateTransport(t.id, { to: v })} placeholder="Destino (ex: CDG)" />
 <Input value={t.operator} onChange={(e) => updateTransport(t.id, { operator: e.target.value })} placeholder="Cia Aérea / Op." className="bg-zinc-50 rounded-xl border-zinc-200" />
 <Input type="datetime-local" value={t.departure} onChange={(e) => updateTransport(t.id, { departure: e.target.value })} className="bg-zinc-50 rounded-xl border-zinc-200 text-xs" />
 <Input type="datetime-local" value={t.arrival} onChange={(e) => updateTransport(t.id, { arrival: e.target.value })} className="bg-zinc-50 rounded-xl border-zinc-200 text-xs" />
 </div>
 ))}
 </div>
 )}
 </div>
 );
 case 3:
 return (
 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="flex justify-end mb-4"><Button onClick={addExcursion} className="rounded-xl"><Plus className="w-4 h-4 mr-2"/> Adicionar Passeio</Button></div>
 {excursions.length === 0 ? <div className="py-12 text-center text-zinc-400">Nenhum passeio inserido.</div> : (
 <div className="space-y-4">
 {excursions.map(exc => (
 <div key={exc.id} className="p-4 rounded-xl border border-zinc-200 bg-white relative group space-y-3">
 <button onClick={() => removeExcursion(exc.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100"><X className="w-3 h-3"/></button>
 <div className="grid md:grid-cols-3 gap-3">
 <Input value={exc.title} onChange={(e) => updateExcursion(exc.id, { title: e.target.value })} placeholder="Nome do Passeio" className="md:col-span-2 font-bold bg-zinc-50 rounded-xl border-zinc-200" />
 <Input value={exc.duration} onChange={(e) => updateExcursion(exc.id, { duration: e.target.value })} placeholder="Duração (ex: 4h)" className="bg-zinc-50 rounded-xl border-zinc-200" />
 </div>
 <Textarea value={exc.description} onChange={(e) => updateExcursion(exc.id, { description: e.target.value })} placeholder="Descrição..." className="bg-zinc-50 rounded-xl border-zinc-200 text-sm" rows={2}/>
 </div>
 ))}
 </div>
 )}
 {/* O que inclui */}
 <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 mt-6">
 <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
 <Label className="text-green-800 font-bold mb-2 block">✅ O que está incluído</Label>
 <div className="flex gap-2 mb-3">
 <Input value={includeInput} onChange={(e) => setIncludeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && includeInput) { e.preventDefault(); updateForm('included_items', [...form.included_items, includeInput]); setIncludeInput(''); }}} placeholder="Adicionar item..." className="bg-white rounded-xl" />
 </div>
 <div className="flex flex-wrap gap-1.5">
 {form.included_items.map((item: string, i: number) => (
 <Badge key={i} className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
 {item} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateForm('included_items', form.included_items.filter((_:any, idx:number) => idx !== i))}/>
 </Badge>
 ))}
 </div>
 </div>
 <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
 <Label className="text-red-800 font-bold mb-2 block">❌ Não incluído</Label>
 <div className="flex gap-2 mb-3">
 <Input value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && excludeInput) { e.preventDefault(); updateForm('excluded_items', [...form.excluded_items, excludeInput]); setExcludeInput(''); }}} placeholder="Adicionar item..." className="bg-white rounded-xl" />
 </div>
 <div className="flex flex-wrap gap-1.5">
 {form.excluded_items.map((item: string, i: number) => (
 <Badge key={i} className="bg-red-100 text-red-700 hover:bg-red-200 border-0">
 {item} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateForm('excluded_items', form.excluded_items.filter((_:any, idx:number) => idx !== i))}/>
 </Badge>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
 case 4:
 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
 <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 xl:col-span-1">
 <h3 className="font-bold flex items-center gap-2 text-zinc-800"><DollarSign className="text-zinc-400" /> Precificação</h3>
 <div className="space-y-1.5">
 <Label>Valor Total Final</Label>
 <Input type="number" step="0.01" value={form.total_value} onChange={(e) => updateForm('total_value', e.target.value)} placeholder="0.00" className="bg-white border-zinc-200 rounded-xl h-12 text-lg font-bold text-green-600" />
 </div>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label>Moeda</Label>
 <Select value={form.currency} onValueChange={(v) => updateForm('currency', v)}>
 <SelectTrigger className="bg-white border-zinc-200 rounded-xl"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="BRL">BRL (R$)</SelectItem>
 <SelectItem value="USD">USD ($)</SelectItem>
 <SelectItem value="EUR">EUR (€)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label>Por</Label>
 <Select value={form.pricing_mode} onValueChange={(v) => updateForm('pricing_mode', v)}>
 <SelectTrigger className="bg-white border-zinc-200 rounded-xl"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="per_person">Pessoa</SelectItem>
 <SelectItem value="per_couple">Casal</SelectItem>
 <SelectItem value="total">Pacote</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="space-y-1.5">
 <Label>Validade da Cotação</Label>
 <Input type="date" value={form.valid_until} onChange={(e) => updateForm('valid_until', e.target.value)} className="bg-white border-zinc-200 rounded-xl" />
 </div>
 <div className="space-y-1.5 mt-4 pt-4 border-t border-zinc-200">
 <Label>Layout da Proposta</Label>
 <Select value={form.layout_mode} onValueChange={(v) => updateForm('layout_mode', v)}>
 <SelectTrigger className="bg-white border-zinc-200 rounded-xl"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="classico">Clássico (Padrão)</SelectItem>
 <SelectItem value="executivo">Executivo (Tabela/Dados)</SelectItem>
 <SelectItem value="apresentacao">Apresentação (Imersivo)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 xl:col-span-2">
 <h3 className="font-bold text-zinc-800">Formas de Pagamento (Parcelamento)</h3>
 <div className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-[minmax(0,1fr)_88px_140px_auto] sm:items-end">
 <div className="min-w-0 space-y-1.5">
 <Label className="text-xs text-zinc-500">Tipo (ex: Boleto, Cartão)</Label>
 <Input value={instType} onChange={(e) => setInstType(e.target.value)} className="bg-white rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs text-zinc-500">Qtd.</Label>
 <Input type="number" value={instCount} onChange={(e) => setInstCount(e.target.value)} placeholder="12" className="bg-white rounded-xl" />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs text-zinc-500">Valor (R$)</Label>
 <Input type="number" value={instValue} onChange={(e) => setInstValue(e.target.value)} placeholder="0.00" className="bg-white rounded-xl" />
 </div>
 <Button onClick={() => { if(instType&&instCount&&instValue){ addInstallment(instType, Number(instCount), Number(instValue)); setInstType(''); setInstCount(''); setInstValue('');} }} className="rounded-xl"><Plus className="w-4 h-4"/></Button>
 </div>

 <div className="space-y-2 mt-4">
 {installments.map((inst, i) => (
 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100 text-sm">
 <span className="font-medium text-zinc-700"><Badge variant="outline" className="mr-2">{inst.type}</Badge> {inst.installment_count}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: form.currency }).format(inst.value)}</span>
 <Button variant="ghost" size="icon" onClick={() => removeInstallment(i)} className="text-red-400 h-8 w-8"><X className="h-4 w-4" /></Button>
 </div>
 ))}
 </div>
 </div>
 </div>
 <div className="space-y-1.5">
 <Label className="text-zinc-600 font-bold">Observações Internas (Não vai pro cliente)</Label>
 <Textarea value={form.notes_internal} onChange={(e) => updateForm('notes_internal', e.target.value)} rows={3} placeholder="Notas sobre margem, fornecedor..." className="bg-zinc-50 border-zinc-200 rounded-xl resize-none" />
 </div>
 </div>
 );
 case 5:
 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
 <div className="space-y-6">
 <div>
 <h3 className="font-bold text-lg mb-2">Cliente Final</h3>
 <Select value={form.client_id} onValueChange={(v) => updateForm('client_id', v)}>
 <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-12">
 <SelectValue placeholder="Vincular cliente existente..." />
 </SelectTrigger>
 <SelectContent>
 {clients?.map((c) => (
 <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-vj-green"/> Imagem de Capa</h3>
 <p className="text-sm text-zinc-500 mb-3">Esta imagem será o banner principal da cotação online.</p>
 <MediaUploader
 multiple={false}
 existingUrls={form.cover_image_url ? [form.cover_image_url] : []}
 onUploadComplete={(urls) => updateForm('cover_image_url', urls[0])}
 folder="quotations/covers"
 aspectRatio={16 / 9}
 ownerType="quotation"
 ownerId={null}
 fieldName="cover_image_url"
 />
 </div>
 
 <div>
 <h3 className="font-bold text-lg mb-2">Formato Visual (PDF / Link Público)</h3>
 <Select value={form.layout_mode || 'classico'} onValueChange={(v) => updateForm('layout_mode', v)}>
 <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-12">
 <SelectValue placeholder="Selecione o template visual" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="classico">Modelo Executivo (Padrão)</SelectItem>
 <SelectItem value="presentation">Modelo Apresentação (Imagens Grandes)</SelectItem>
 <SelectItem value="template_excetur">Modelo Exce Tur (Premium)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="p-6 rounded-xl bg-green-50/50 border border-green-100 flex flex-col justify-center items-center text-center space-y-4">
 <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
 <CheckCircle2 className="w-8 h-8" />
 </div>
 <div>
 <h3 className="text-xl font-bold text-green-900 mb-1">Tudo Pronto!</h3>
 <p className="text-sm text-green-700">A cotação está montada e pronta para ser gerada como um link público e PDF.</p>
 </div>
 </div>
 </div>
 </div>
 );
 default:
 return null;
 }
 };

 return (
 <SheetPage
 open={open}
 onClose={onClose}
 title="Construtor de Cotação"
 subtitle="Crie uma proposta comercial completa"
 icon={MapPin}
 sections={SECTIONS}
 defaultSection="hospedagem"
 className="lg:w-[74vw] xl:w-[70vw]"
 footer={
 <div className="flex w-full flex-wrap items-center justify-end gap-3">
 <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>
 <Button
 onClick={handleSave}
 disabled={createQuotation.isPending || !form.destination}
 className="rounded-full bg-vj-green px-8 font-bold hover:bg-vj-green/90"
 >
 {createQuotation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Salvando...</> : <><Save className="w-4 h-4 mr-2"/>Gerar Cotação</>}
 </Button>
 </div>
 }
 >
 {(activeSection) => {
 const step = sectionToStep(activeSection);
 return <StepContent currentStep={step} />;
 }}
 </SheetPage>
 );
}
