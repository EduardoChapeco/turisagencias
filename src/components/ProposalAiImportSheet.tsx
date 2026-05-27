import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCreateProposal } from '@/hooks/useProposals';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import {
 Sparkles, Upload, FileText, X, Loader2, CheckCircle2,
 Eye, Pencil, Save
} from 'lucide-react';

interface ProposalAiImportSheetProps {
 open: boolean;
 onClose: () => void;
 onSuccess?: (proposalId: string) => void;
}

type ExtractedProposalData = {
 package_title?: string;
 destination?: string;
 duration?: string;
 itinerary?: any[];
 hotels?: any[];
 transport?: any[];
 included?: string[];
 not_included?: string[];
 pricing?: any[];
 payment_terms?: string;
 notes?: string[];
 terms?: string[];
 source_pdf_url?: string;
 source_pdf_ocr_text?: string;
};

function EditableField({
 label, value, onChange, type = 'text', icon, highlight = false,
}: {
 label: string; value: string; onChange: (v: string) => void;
 type?: string; icon?: string; highlight?: boolean;
}) {
 return (
 <div className={`p-3 rounded-xl border ${highlight ? 'border-vj-green/30 bg-vj-green/5' : 'border-zinc-200 bg-zinc-50'}`}>
 <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
 {icon} {label}
 </p>
 <Input
 type={type}
 value={value}
 onChange={e => onChange(e.target.value)}
 className="h-8 border-none p-0 text-sm font-semibold bg-transparent focus-visible:ring-0 text-zinc-950"
 />
 </div>
 );
}

export function ProposalAiImportSheet({ open, onClose, onSuccess }: ProposalAiImportSheetProps) {
 const { organization, profile } = useAuthStore();
 const { toast } = useToast();
 const navigate = useNavigate();
 const createProposalMut = useCreateProposal();

 const [file, setFile] = useState<File | null>(null);
 const [isPdf, setIsPdf] = useState(true);
 const [additionalText, setAdditionalText] = useState('');
 const [extracting, setExtracting] = useState(false);
 const [saving, setSaving] = useState(false);
 
 const [extracted, setExtracted] = useState<ExtractedProposalData | null>(null);
 const [edited, setEdited] = useState<ExtractedProposalData | null>(null);
 const [step, setStep] = useState<'upload' | 'review'>('upload');
 const fileInputRef = useRef<HTMLInputElement>(null);

 const updateField = (key: keyof ExtractedProposalData, value: any) => {
 setEdited(prev => ({ ...prev!, [key]: value }));
 };

 const current = edited ?? extracted ?? {};

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const f = e.target.files?.[0];
 if (!f) return;
 setFile(f);
 setExtracted(null);
 setEdited(null);
 setStep('upload');
 setIsPdf(f.type === 'application/pdf');
 };

 const handleExtract = async () => {
 if (!file && !additionalText.trim()) return;
 setExtracting(true);

 try {
 let fileUrl: string | null = null;
 let imageBase64: string | null = null;

 if (file) {
 // 1. Upload do arquivo original no bucket media
 const ext = file.name.split('.').pop();
 const path = `operator_proposals/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
 const { error: uploadErr } = await supabase.storage.from('media').upload(path, file);
 if (!uploadErr) {
 const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
 fileUrl = publicUrl;
 }

 // Converter arquivo em Base64 para OCR da Edge Function se for imagem ou PDF leve
 const buffer = await file.arrayBuffer();
 const bytes = new Uint8Array(buffer);
 let binary = '';
 bytes.forEach(b => binary += String.fromCharCode(b));
 imageBase64 = btoa(binary);
 }

 // 2. Chamar a Edge Function de OCR & Extração
 // Chamamos extract-quotation porque ela é nossa engine global de leitura de itinerários e PDFs B2B
 const { data, error } = await supabase.functions.invoke('extract-quotation', {
 body: {
 imageBase64,
 mimeType: file?.type || 'application/pdf',
 text: additionalText || undefined,
 org_id: organization?.id,
 agent_id: profile?.id,
 source_file_url: fileUrl,
 },
 });

 if (error) throw error;

 // Adaptar resposta da IA da cotação para o formato de proposta
 const rawData = data?.data || {};
 const proposalData: ExtractedProposalData = {
 package_title: rawData.destination ? `Roteiro Especial: ${rawData.destination}` : 'Proposta de Viagem',
 destination: rawData.destination || '',
 duration: rawData.num_nights ? `${rawData.num_nights} Noites` : '',
 included: rawData.meal_plan ? [`Regime de alimentação: ${rawData.meal_plan}`] : [],
 not_included: ['Despesas pessoais', 'Seguro viagem opcional'],
 pricing: rawData.total_value ? [{ label: 'Pacote Completo', price: rawData.total_value, currency: rawData.currency || 'BRL' }] : [],
 payment_terms: rawData.whatsapp_text || '',
 itinerary: rawData.itinerary || [],
 hotels: rawData.hotel_name ? [{ name: rawData.hotel_name, stars: rawData.hotel_stars, room: rawData.room_type }] : [],
 transport: rawData.flights || [],
 source_pdf_url: fileUrl || undefined,
 };

 setExtracted(proposalData);
 setEdited(proposalData);
 setStep('review');
 toast({ title: '✅ Extração concluída!', description: 'Revise os dados antes de preencher a proposta no editor.' });
 } catch (err: any) {
 console.error(err);
 toast({ title: '❌ Falha no parser OCR', description: err.message || 'Erro ao extrair dados do PDF.', variant: 'destructive' });
 } finally {
 setExtracting(false);
 }
 };

 const handleConfirmAndCreate = async () => {
 if (!edited) return;
 setSaving(true);

 try {
 // 1. Mapear o JSON revisado para o content_schema estruturado de blocos
 const contentBlocks: any[] = [
 {
 id: `hero-${Date.now()}`,
 type: 'hero',
 name: 'Capa da Proposta',
 settings: {
 title: edited.package_title || 'Viagem dos Sonhos',
 subtitle: edited.destination ? `Roteiro exclusivo para ${edited.destination}` : 'Roteiro de Viagem Personalizado',
 image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
 overlay_opacity: 50,
 }
 }
 ];

 // Bloco Hotéis
 if (edited.hotels && edited.hotels.length > 0) {
 contentBlocks.push({
 id: `hotel-${Date.now()}`,
 type: 'hotel',
 name: 'Hospedagem Recomendada',
 settings: {
 hotels: edited.hotels.map(h => ({
 name: h.name || 'Hotel Selecionado',
 stars: h.stars || 4,
 description: h.room ? `Acomodação: ${h.room}` : 'Hotel categoria turística com excelente localização.',
 image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
 }))
 }
 });
 }

 // Bloco Voos
 if (edited.transport && edited.transport.length > 0) {
 contentBlocks.push({
 id: `flight-${Date.now()}`,
 type: 'flight',
 name: 'Malha Aérea Sugerida',
 settings: {
 flights: edited.transport.map(f => ({
 airline: f.airline_name || 'Companhia Aérea',
 code: f.flight_number || 'N/A',
 from: f.from_airport || 'Origem',
 to: f.to_airport || 'Destino',
 departure: f.departure_time || '',
 cabin: f.cabin_class || 'Econômica'
 }))
 }
 });
 }

 // Bloco Roteiro
 if (edited.itinerary && edited.itinerary.length > 0) {
 contentBlocks.push({
 id: `itinerary-${Date.now()}`,
 type: 'itinerary',
 name: 'Roteiro Diário',
 settings: {
 days: edited.itinerary.map(i => ({
 day: i.day_number || 1,
 title: i.city || 'Destino',
 description: i.label || 'Dia livre para passeios e atividades independentes.'
 }))
 }
 });
 }

 // Bloco Preço
 const totalVal = edited.pricing?.[0]?.price || 0;
 contentBlocks.push({
 id: `pricing-${Date.now()}`,
 type: 'pricing',
 name: 'Investimento e Condições',
 settings: {
 price: totalVal,
 currency: edited.pricing?.[0]?.currency || 'BRL',
 installments: edited.payment_terms || 'Consulte parcelamento e taxas de embarque.',
 notes: 'Preços por pessoa sujeitos a reajustes sem prévio aviso até a emissão.'
 }
 });

 // Bloco Inclui
 if (edited.included && edited.included.length > 0) {
 contentBlocks.push({
 id: `inclusions-${Date.now()}`,
 type: 'inclusions',
 name: 'Serviços Inclusos',
 settings: {
 items: edited.included
 }
 });
 }

 // Bloco Exclui
 if (edited.not_included && edited.not_included.length > 0) {
 contentBlocks.push({
 id: `exclusions-${Date.now()}`,
 type: 'exclusions',
 name: 'Não Incluso',
 settings: {
 items: edited.not_included
 }
 });
 }

 // 2. Persistir no banco de dados na tabela proposals
 createProposalMut.mutate({
 title: edited.package_title || 'Proposta de Viagem',
 destination: edited.destination || '',
 content_schema: contentBlocks,
 pricing_schema: { total: totalVal, currency: edited.pricing?.[0]?.currency || 'BRL', terms: edited.payment_terms },
 itinerary_schema: edited.itinerary || [],
 source_pdf_url: edited.source_pdf_url || null,
 ai_extracted_data: edited
 }, {
 onSuccess: (newProp) => {
 toast({ title: '✅ Proposta gerada com sucesso!', description: 'Redirecionando para o editor visual.' });
 onSuccess?.(newProp.id);
 onClose();
 navigate(`/proposals/${newProp.id}/edit`);
 }
 });

 } catch (e: any) {
 toast({ title: 'Erro ao gerar proposta', description: e.message, variant: 'destructive' });
 } finally {
 setSaving(false);
 }
 };

 const handleReset = () => {
 setFile(null);
 setExtracted(null);
 setEdited(null);
 setStep('upload');
 };

 return (
 <SheetPage
 open={open}
 onClose={onClose}
 title="Criar Proposta por PDF / IA"
 subtitle="Importe PDFs de operadoras e converta em propostas premium estruturadas"
 icon={Sparkles}
 sections={[
 { id: 'upload', label: '1. Carregar PDF' },
 { id: 'review', label: '2. Revisar e Gerar' },
 ]}
 defaultSection={step === 'review' ? 'review' : 'upload'}
 footer={
 <div className="flex w-full gap-2 justify-between items-center">
 <div className="text-xs text-zinc-500">
 {step === 'upload' && file && <span>📄 {file.name}</span>}
 {step === 'review' && <span className="text-vj-green font-semibold flex items-center gap-1">✓ IA Processada — Revise os blocos</span>}
 </div>
 <div className="flex gap-2">
 <Button variant="outline" onClick={onClose}>Cancelar</Button>
 {step === 'upload' && (
 <Button
 onClick={handleExtract}
 disabled={extracting || (!file && !additionalText.trim())}
 className="bg-vj-green text-white hover:bg-vj-green/90 min-w-[150px]"
 >
 {extracting ? (
 <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Lendo PDF...</>
 ) : (
 <><Sparkles className="mr-2 h-4 w-4" />Extrair com IA</>
 )}
 </Button>
 )}
 {step === 'review' && (
 <>
 <Button variant="outline" onClick={handleReset}>Recarregar</Button>
 <Button
 onClick={handleConfirmAndCreate}
 disabled={saving}
 className="bg-vj-green text-white hover:bg-vj-green/90"
 >
 {saving ? (
 <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando...</>
 ) : (
 <><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar e Criar</>
 )}
 </Button>
 </>
 )}
 </div>
 </div>
 }
 >
 {(activeSection) => (
 <>
 {/* UPLOAD STEP */}
 {activeSection === 'upload' && (
 <div className="space-y-6">
 <div className="p-4 rounded-xl bg-emerald-50/20 border border-emerald-100/50 flex gap-3 text-sm text-zinc-700">
 <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
 <div>
 <p className="font-bold">Conversão de Propostas da Operadora</p>
 <p className="text-xs text-zinc-500 mt-1">Sobe o PDF de qualquer operadora (Orinter, Viagens Promo, CVC, etc.). A IA estruturará hotéis, voos, roteiro diário e preços automaticamente, criando blocos no editor visual.</p>
 </div>
 </div>

 <div>
 <Label className="font-bold text-zinc-800 mb-2 block">Upload do PDF ou Imagem *</Label>
 <div
 onClick={() => fileInputRef.current?.click()}
 className="cursor-pointer border-2 border-dashed border-zinc-200 hover:border-vj-green/40 hover:bg-emerald-50/5 transition-all rounded-2xl p-8 flex flex-col items-center justify-center gap-4 min-h-[220px]"
 >
 {file ? (
 <div className="text-center space-y-2">
 <FileText className="w-12 h-12 text-rose-500 mx-auto" />
 <p className="font-bold text-zinc-800 text-sm">{file.name}</p>
 <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
 <Button size="sm" variant="outline" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
 Trocar PDF
 </Button>
 </div>
 ) : (
 <>
 <Upload className="w-8 h-8 text-zinc-400" />
 <div className="text-center space-y-1">
 <p className="font-bold text-zinc-800 text-sm">Arraste ou clique para selecionar arquivo</p>
 <p className="text-xs text-zinc-400">Suporta PDF, JPG, PNG até 10MB</p>
 </div>
 </>
 )}
 </div>
 <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf,image/*" className="hidden" />
 </div>

 <div className="flex items-center gap-3 text-zinc-400 text-xs py-2">
 <div className="flex-1 h-px bg-zinc-200" />
 <span>ou cole texto descritivo do pacote</span>
 <div className="flex-1 h-px bg-zinc-200" />
 </div>

 <div className="space-y-1">
 <Label className="text-xs font-bold text-zinc-500 uppercase">Texto do Pacote</Label>
 <Textarea
 value={additionalText}
 onChange={(e) => setAdditionalText(e.target.value)}
 placeholder="Cole detalhes de roteiro, inclusões e tarifas copiados de e-mails ou mensagens..."
 rows={5}
 />
 </div>

 {extracting && (
 <div className="p-4 rounded-xl bg-zinc-900 text-white flex gap-3 items-center">
 <Loader2 className="w-5 h-5 text-vj-green animate-spin shrink-0" />
 <p className="text-xs font-semibold">Gemini AI realizando OCR e interpretando a estrutura do roteiro...</p>
 </div>
 )}
 </div>
 )}

 {/* REVIEW STEP */}
 {activeSection === 'review' && (
 <div className="space-y-6">
 <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-semibold flex items-center gap-2">
 <Pencil className="w-4 h-4" />
 Revise os blocos mapeados pela IA antes de gerar a proposta interativa.
 </div>

 <div className="space-y-4">
 <EditableField 
 label="Título da Proposta" 
 value={current.package_title || ''} 
 onChange={v => updateField('package_title', v)} 
 />

 <EditableField 
 label="Destino de Viagem" 
 value={current.destination || ''} 
 onChange={v => updateField('destination', v)} 
 />

 <EditableField 
 label="Duração Sugerida" 
 value={current.duration || ''} 
 onChange={v => updateField('duration', v)} 
 />

 {/* Hotéis */}
 {current.hotels && current.hotels.length > 0 && (
 <div className="space-y-2 p-4 border border-zinc-200 rounded-xl bg-white">
 <p className="text-xs font-bold uppercase text-zinc-500">🏨 Hotéis Mapeados</p>
 {current.hotels.map((h: any, i: number) => (
 <div key={i} className="flex gap-2">
 <Input 
 value={h.name || ''} 
 placeholder="Nome do Hotel"
 onChange={(e) => {
 const copy = [...(current.hotels || [])];
 copy[i].name = e.target.value;
 updateField('hotels', copy);
 }} 
 className="h-8 text-xs font-semibold text-zinc-800"
 />
 <Input 
 value={h.room || ''} 
 placeholder="Acomodação"
 onChange={(e) => {
 const copy = [...(current.hotels || [])];
 copy[i].room = e.target.value;
 updateField('hotels', copy);
 }} 
 className="h-8 text-xs text-zinc-600 w-40"
 />
 </div>
 ))}
 </div>
 )}

 {/* Inclusões */}
 {current.included && current.included.length > 0 && (
 <div className="space-y-1">
 <span className="text-xs font-bold text-zinc-500 uppercase">Serviços Inclusos</span>
 <Textarea 
 value={current.included.join('\n')}
 onChange={(e) => updateField('included', e.target.value.split('\n'))}
 rows={4}
 className="text-xs text-zinc-700 leading-relaxed font-sans"
 />
 </div>
 )}

 {/* Exclusões */}
 {current.not_included && current.not_included.length > 0 && (
 <div className="space-y-1">
 <span className="text-xs font-bold text-zinc-500 uppercase">Serviços Não Inclusos</span>
 <Textarea 
 value={current.not_included.join('\n')}
 onChange={(e) => updateField('not_included', e.target.value.split('\n'))}
 rows={3}
 className="text-xs text-zinc-700 leading-relaxed font-sans"
 />
 </div>
 )}

 {/* Parcelamento e Financeiro */}
 <div className="space-y-1">
 <span className="text-xs font-bold text-emerald-600 uppercase">Condições de Pagamento / Parcelas</span>
 <Textarea
 value={current.payment_terms || ''}
 onChange={(e) => updateField('payment_terms', e.target.value)}
 rows={4}
 className="text-xs text-zinc-800 bg-emerald-50/10 border-emerald-200"
 />
 </div>
 </div>
 </div>
 )}
 </>
 )}
 </SheetPage>
 );
}
