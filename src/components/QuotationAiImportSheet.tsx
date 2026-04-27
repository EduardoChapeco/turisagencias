import { useState, useRef } from 'react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Upload, FileText, X, Loader2, CheckCircle2,
  ImageIcon, Eye, ExternalLink, Pencil, AlertCircle, Save
} from 'lucide-react';

interface QuotationAiImportSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (quotationId: string) => void;
}

type ExtractedData = {
  id?: string;
  destination?: string;
  hotel_name?: string;
  hotel_stars?: number;
  check_in?: string;
  check_out?: string;
  num_nights?: number;
  meal_plan?: string;
  room_type?: string;
  total_value?: number;
  currency?: string;
  whatsapp_text?: string;
  installments?: any[];
  flights?: any[];
  itinerary?: any[];
};

const MEAL_PLAN_LABELS: Record<string, string> = {
  all_inclusive: 'All Inclusive',
  half_board: 'Meia Pensão',
  bed_breakfast: 'Café da Manhã',
  room_only: 'Somente Apartamento',
};

const MEAL_PLAN_OPTIONS = Object.entries(MEAL_PLAN_LABELS).map(([value, label]) => ({ value, label }));

// ── Componente de campo editável pós-extração ──
function EditableField({
  label, value, onChange, type = 'text', icon, highlight = false,
  options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: string; highlight?: boolean; options?: { value: string; label: string }[];
}) {
  return (
    <div className={`p-3 rounded-vj-lg border ${highlight ? 'border-vj-green/30 bg-vj-green/5' : 'border-vj-border bg-vj-surface'}`}>
      <p className="text-[10px] uppercase tracking-wider text-vj-txt3 font-semibold mb-1.5">
        {icon} {label}
      </p>
      {options ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs border-none  p-0 bg-transparent font-semibold">
            <SelectValue placeholder="Selecionar..." />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`h-8 border-none  p-0 text-sm font-semibold bg-transparent focus-visible:ring-0 ${highlight ? 'text-vj-green' : 'text-vj-txt'}`}
        />
      )}
    </div>
  );
}

export function QuotationAiImportSheet({ open, onClose, onSuccess }: QuotationAiImportSheetProps) {
  const { profile, organization } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [additionalText, setAdditionalText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [edited, setEdited] = useState<ExtractedData | null>(null);
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza um campo do formulário de revisão
  const updateField = (key: keyof ExtractedData, value: any) => {
    setEdited(prev => ({ ...prev!, [key]: value }));
  };

  // Valor atual (editado ou original)
  const current = edited ?? extracted ?? {};

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setExtracted(null);
    setEdited(null);
    setStep('upload');

    if (f.type === 'application/pdf') {
      setIsPdf(true);
      setFilePreview(null);
    } else if (f.type.startsWith('image/')) {
      setIsPdf(false);
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  const handleExtract = async () => {
    if (!file && !additionalText.trim()) return;
    setExtracting(true);

    try {
      let imageBase64: string | null = null;
      let fileUrl: string | null = null;

      if (file) {
        const ext = file.name.split('.').pop();
        const path = `quotations/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('media').upload(path, file);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
          fileUrl = publicUrl;
        }

        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          bytes.forEach(b => binary += String.fromCharCode(b));
          imageBase64 = btoa(binary);
        }
      }

      const payload = {
        imageBase64,
        mimeType: file?.type || undefined,
        text: additionalText || undefined,
        org_id: organization?.id,
        agent_id: profile?.id,
        source_file_url: fileUrl,
      };

      const { data, error } = await supabase.functions.invoke('extract-quotation', {
        body: payload,
      });

      if (error) throw new Error(error.message || 'Falha na extração pela IA.');

      const result = data;
      setExtracted(result.data);
      setEdited(result.data); // cópia editável começa igual ao extraído
      setStep('review');

      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: '✅ Extração concluída!', description: 'Revise e ajuste os dados antes de confirmar.' });
    } catch (err: any) {
      toast({ title: '❌ Erro na extração', description: err.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  // Salvar alterações editadas de volta ao banco
  const handleSaveEdits = async () => {
    if (!extracted?.id || !edited) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          destination: edited.destination,
          hotel_name: edited.hotel_name,
          hotel_stars: edited.hotel_stars ? Number(edited.hotel_stars) : null,
          check_in: edited.check_in || null,
          check_out: edited.check_out || null,
          num_nights: edited.num_nights ? Number(edited.num_nights) : null,
          meal_plan: edited.meal_plan || null,
          room_type: edited.room_type || null,
          total_value: edited.total_value ? Number(edited.total_value) : null,
          currency: edited.currency || 'BRL',
          whatsapp_text: edited.whatsapp_text || null,
        })
        .eq('id', extracted.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: '✅ Dados corrigidos e salvos!', description: 'Cotação atualizada com suas edições.' });
    } catch (e: any) {
      toast({ title: 'Erro ao salvar edições', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = () => {
    setStep('done');
    if (extracted?.id) onSuccess?.(extracted.id);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setIsPdf(false);
    setAdditionalText('');
    setExtracted(null);
    setEdited(null);
    setStep('upload');
  };

  const formatCurrency = (value?: number, currency = 'BRL') => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title="Importar Cotação por IA"
      subtitle="Upload de PDF ou imagem — extração + revisão editável"
      icon={Sparkles}
      sections={[
        { id: 'upload', label: '1. Upload do Arquivo' },
        { id: 'review', label: '2. Revisão e Edição' },
      ]}
      defaultSection={step === 'review' ? 'review' : 'upload'}
      footer={
        <div className="flex w-full gap-2 justify-between items-center">
          <div className="text-xs text-vj-txt3">
            {step === 'upload' && file && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" /> {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span>}
            {step === 'review' && extracted && <span className="flex items-center gap-1.5 text-vj-green"><CheckCircle2 className="w-3.5 h-3.5" /> Extraído com sucesso — edite se necessário</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            {step === 'upload' && (
              <Button
                onClick={handleExtract}
                disabled={extracting || (!file && !additionalText.trim())}
                className="bg-vj-green text-white hover:bg-vj-green/90 min-w-[160px]"
              >
                {extracting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extraindo com IA...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Extrair com IA</>
                )}
              </Button>
            )}
            {step === 'review' && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <Upload className="mr-2 h-4 w-4" /> Nova Extração
                </Button>
                {extracted?.id && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleSaveEdits}
                      disabled={saving}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Salvando...' : 'Salvar Edições'}
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="bg-vj-green text-white hover:bg-vj-green/90"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar e Abrir
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      }
    >
      {(activeSection) => (
        <>
          {/* ── PASSO 1: UPLOAD ──────────────────────────────────── */}
          {activeSection === 'upload' && (
            <div className="space-y-8">
              <div className="p-4 rounded-vj-lg bg-gradient-to-r from-vj-green/5 to-blue-50 border border-vj-green/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-vj-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-vj-txt text-sm">Extração automática por Inteligência Artificial</p>
                  <p className="text-xs text-vj-txt3 mt-0.5">Faça upload da cotação em PDF ou imagem. A IA extrai destino, hotel, datas, valores, voos, transfers e gera o texto para WhatsApp. Você poderá editar qualquer campo antes de confirmar.</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold text-vj-txt mb-3 block">Arquivo da Cotação *</Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-vj-border hover:border-vj-green/50 hover:bg-vj-green/5 transition-all rounded-vj-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[240px]"
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                      {filePreview && !isPdf ? (
                        <div className="relative w-full max-h-48 rounded-vj-lg overflow-hidden border border-vj-border">
                          <img src={filePreview} alt="Preview" className="w-full object-contain max-h-48" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-vj-lg bg-red-50 border border-red-200 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-red-400" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-semibold text-vj-txt text-sm">{file.name}</p>
                        <p className="text-xs text-vj-txt3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1">
                          <Upload className="w-3.5 h-3.5" /> Trocar Arquivo
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleReset} className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50">
                          <X className="w-3.5 h-3.5" /> Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-vj-bg border border-vj-border flex items-center justify-center">
                        <Upload className="w-7 h-7 text-vj-txt3" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="font-semibold text-vj-txt">Arraste ou clique para fazer upload</p>
                        <p className="text-sm text-vj-txt3">PDF, JPG, PNG, WEBP</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {['PDF', 'JPG', 'PNG', 'WEBP'].map(t => (
                          <Badge key={t} variant="outline" className="text-xs bg-vj-bg border-vj-border text-vj-txt3">{t}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,application/pdf" className="hidden" />
              </div>

              <div className="flex items-center gap-3 text-vj-txt3 text-xs">
                <div className="flex-1 h-px bg-vj-border" />
                <span>ou cole o texto da cotação abaixo</span>
                <div className="flex-1 h-px bg-vj-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-vj-txt2 text-sm">Texto da Cotação (opcional)</Label>
                <Textarea
                  value={additionalText}
                  onChange={(e) => setAdditionalText(e.target.value)}
                  placeholder="Cole aqui o texto copiado da cotação, e-mail ou WhatsApp..."
                  rows={6}
                  className="border-vj-border bg-vj-bg resize-none font-mono text-xs"
                />
                <p className="text-xs text-vj-txt3">Pode combinar arquivo + texto para melhorar a precisão da extração.</p>
              </div>

              {extracting && (
                <div className="p-5 rounded-vj-lg bg-vj-green/5 border border-vj-green/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-vj-green/10 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-vj-green animate-spin" />
                  </div>
                  <div>
                    <p className="font-semibold text-vj-txt text-sm">Analisando com Gemini AI...</p>
                    <p className="text-xs text-vj-txt3 mt-0.5">Extraindo dados de destino, hotel, datas, valores, voos e transfers...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PASSO 2: REVISÃO EDITÁVEL ─────────────────────────── */}
          {activeSection === 'review' && (
            <div className="space-y-6">
              {!extracted ? (
                <div className="text-center py-16 text-vj-txt3 space-y-3">
                  <Sparkles className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm">Nenhuma extração realizada ainda.</p>
                </div>
              ) : (
                <>
                  {/* Banner */}
                  <div className="p-4 rounded-vj-lg bg-vj-green/5 border border-vj-green/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-vj-green flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-vj-green text-sm">Dados extraídos pela IA</p>
                      <p className="text-xs text-vj-txt3 mt-0.5">Revise e edite qualquer campo diretamente abaixo. Clique em "Salvar Edições" para persistir as correções.</p>
                    </div>
                    {extracted.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-vj-green text-vj-green hover:bg-vj-green/5 flex-shrink-0"
                        onClick={() => onSuccess?.(extracted.id!)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir
                      </Button>
                    )}
                  </div>

                  {/* Aviso de editabilidade */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <Pencil className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">Todos os campos são editáveis. Clique para corrigir erros da extração antes de salvar.</p>
                  </div>

                  {/* Grid editável de campos principais */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-vj-txt3 mb-3">📦 Dados Principais</p>
                    <div className="grid grid-cols-2 gap-3">
                      <EditableField label="Destino" icon="📍" value={current.destination ?? ''} onChange={v => updateField('destination', v)} />
                      <EditableField label="Hotel" icon="🏨" value={current.hotel_name ?? ''} onChange={v => updateField('hotel_name', v)} />
                      <EditableField label="Estrelas" icon="⭐" type="number" value={String(current.hotel_stars ?? '')} onChange={v => updateField('hotel_stars', Number(v))} />
                      <EditableField label="Tipo de Quarto" icon="🛏️" value={current.room_type ?? ''} onChange={v => updateField('room_type', v)} />
                      <EditableField label="Check-in" icon="📅" type="date" value={current.check_in ?? ''} onChange={v => updateField('check_in', v)} />
                      <EditableField label="Check-out" icon="📅" type="date" value={current.check_out ?? ''} onChange={v => updateField('check_out', v)} />
                      <EditableField label="Noites" icon="🌙" type="number" value={String(current.num_nights ?? '')} onChange={v => updateField('num_nights', Number(v))} />
                      <EditableField
                        label="Regime de Refeição" icon="🍽️"
                        value={current.meal_plan ?? ''}
                        onChange={v => updateField('meal_plan', v)}
                        options={MEAL_PLAN_OPTIONS}
                      />
                      <EditableField
                        label="Valor Total" icon="💰"
                        type="number"
                        value={String(current.total_value ?? '')}
                        onChange={v => updateField('total_value', Number(v))}
                        highlight
                      />
                      <EditableField label="Moeda" icon="💱" value={current.currency ?? 'BRL'} onChange={v => updateField('currency', v)} />
                    </div>
                  </div>

                  {/* Voos */}
                  {current.flights && current.flights.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-vj-txt text-sm flex items-center gap-2">✈️ Voos Extraídos ({current.flights.length})</p>
                      <div className="space-y-2">
                        {current.flights.map((f: any, i: number) => (
                          <div key={i} className="p-3 rounded-vj-lg border border-vj-border bg-vj-surface flex items-center gap-3">
                            <span className="text-xs font-mono bg-vj-bg border border-vj-border rounded px-2 py-1 text-vj-txt2">
                              {f.direction === 'outbound' ? '→ IDA' : '← VOLTA'}
                            </span>
                            <span className="text-sm text-vj-txt font-medium">{f.airline_name}</span>
                            <span className="text-xs text-vj-txt3">— {f.cabin_class}</span>
                            {f.flight_number && <span className="text-xs font-mono text-vj-txt3">{f.flight_number}</span>}
                            {f.departure_time && <span className="text-xs text-vj-txt3 ml-auto">{f.departure_time}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Roteiro */}
                  {current.itinerary && current.itinerary.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-vj-txt text-sm flex items-center gap-2">🗺️ Roteiro Extraído ({current.itinerary.length} dias)</p>
                      <div className="space-y-2">
                        {current.itinerary.map((day: any, i: number) => (
                          <div key={i} className="p-3 rounded-vj-lg border border-vj-border bg-vj-surface">
                            <p className="text-xs font-bold text-vj-green">Dia {day.day_number} — {day.city}</p>
                            <p className="text-xs text-vj-txt3 mt-1">{day.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Condições de pagamento */}
                  {current.installments && current.installments.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-vj-txt text-sm flex items-center gap-2">💳 Condições de Pagamento ({current.installments.length} opções)</p>
                      <div className="space-y-1.5">
                        {current.installments.map((inst: any, i: number) => (
                          <div key={i} className="p-3 rounded-vj-lg bg-vj-surface border border-vj-border flex justify-between items-center">
                            <span className="text-xs text-vj-txt">{inst.type}</span>
                            <span className="text-xs font-semibold text-vj-txt">
                              {inst.installment_count}× {formatCurrency(inst.value, current.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Preview editável */}
                  {current.whatsapp_text !== undefined && (
                    <div className="space-y-2">
                      <p className="font-semibold text-vj-txt text-sm flex items-center gap-2">💬 Texto para WhatsApp <span className="text-[10px] text-amber-600 font-normal bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">editável</span></p>
                      <div className="p-4 rounded-vj-lg bg-[#dcf8c6] border border-green-200">
                        <Textarea
                          value={current.whatsapp_text ?? ''}
                          onChange={e => updateField('whatsapp_text', e.target.value)}
                          rows={8}
                          className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans bg-transparent border-none  focus-visible:ring-0 resize-none p-0"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </SheetPage>
  );
}
