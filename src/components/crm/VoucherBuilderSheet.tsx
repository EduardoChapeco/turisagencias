import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCreateVoucher, useUpdateVoucher } from '@/hooks/useVouchers';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  FileUp, Loader2, AlertCircle, Plane, MapPin, Building,
  Car, MessageCircle, Download, Copy, CheckCircle, Sparkles,
  User, Info, Plus, Trash2, Image as ImageIcon,
  ExternalLink, FileText, AlertTriangle,
  Phone, Clock, ShieldCheck, Luggage, Siren, Ticket,
  HeartPulse, Users, ChevronRight, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SheetPage } from '@/components/ui/SheetPage';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoucherVoo {
  tipo: string; data: string; trecho: string; cia: string; voo: string; horario: string; localizador: string;
}
interface VoucherHospedagem {
  nome: string; checkin: string; checkout: string; localizador: string; regime: string; telefone: string;
}
interface VoucherTransporte {
  fornecedor: string; tipo: string; data: string; horario: string; localizador: string; telefone: string;
}
interface VoucherPasseio {
  nome: string; data: string; horario: string; local: string; localizador: string;
}
interface VoucherSeguro {
  empresa: string; apolice: string; telefone24h: string; vigencia: string;
}
interface VoucherContato {
  nome: string; tipo: string; telefone: string; email?: string;
}
interface VoucherData {
  destino: string;
  passageiros: string[];
  voos: VoucherVoo[];
  hospedagem: VoucherHospedagem[];
  transporte: VoucherTransporte[];
  passeios: VoucherPasseio[];
  seguro: VoucherSeguro[];
  contatosEmergencia: VoucherContato[];
  localizadorGeral: string;
  observacoes: string;
}

const INITIAL_DATA: VoucherData = {
  destino: '', passageiros: [''], voos: [], hospedagem: [],
  transporte: [], passeios: [], seguro: [], contatosEmergencia: [],
  localizadorGeral: '', observacoes: '',
};

const DEFAULT_VOO: VoucherVoo = { tipo: 'Ida', data: '', trecho: '', cia: '', voo: '', horario: '', localizador: '' };
const DEFAULT_HOTEL: VoucherHospedagem = { nome: '', checkin: '', checkout: '', localizador: '', regime: '', telefone: '' };
const DEFAULT_TRANSFER: VoucherTransporte = { fornecedor: '', tipo: 'Transfer', data: '', horario: '', localizador: '', telefone: '' };
const DEFAULT_PASSEIO: VoucherPasseio = { nome: '', data: '', horario: '', local: '', localizador: '' };
const DEFAULT_SEGURO: VoucherSeguro = { empresa: '', apolice: '', telefone24h: '', vigencia: '' };
const DEFAULT_CONTATO: VoucherContato = { nome: '', tipo: 'Hotel', telefone: '', email: '' };

// ─── Section Component ────────────────────────────────────────────────────────

function SectionHeader({ id, icon: Icon, label }: { id: string; icon: React.ElementType; label: string }) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 pt-2">
      <div className="w-8 h-8 rounded-xl bg-vj-green/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-vj-green" />
      </div>
      <h3 className="text-sm font-black text-vj-txt uppercase tracking-tight">{label}</h3>
      <div className="flex-1 h-px bg-vj-border" />
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label className="text-[10px] uppercase tracking-wider text-vj-txt3 font-bold mb-1 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-sm bg-white border-vj-border focus:border-vj-green focus:ring-0 rounded-xl"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VoucherBuilderSheet({
  onClose,
  initialData,
  open = true,
}: {
  onClose?: () => void;
  initialData?: any;
  open?: boolean;
}) {
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const { organization } = useAuthStore();
  const AGENCY_NAME = organization?.name || 'Turis Agências';
  const AGENCY_LOGO = (organization as any)?.logo_url || null;

  const [data, setData] = useState<VoucherData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('resumo');

  // ── Carregar dados iniciais ──
  useEffect(() => {
    if (initialData?.ocr_raw_text) {
      try {
        const parsed = JSON.parse(initialData.ocr_raw_text);
        if (parsed?.destino) { setData(parsed); runValidation(parsed); }
      } catch (_) {}
    }
  }, [initialData]);

  const runValidation = useCallback((d: VoucherData) => {
    const w: string[] = [];
    if (!d.destino) w.push('Destino não preenchido.');
    if (!d.passageiros?.[0]) w.push('Nenhum passageiro cadastrado.');
    if (!d.voos.length && !d.hospedagem.length) w.push('Adicione ao menos um voo ou hospedagem.');
    setValidationWarnings(w);
  }, []);

  const updateData = useCallback((patch: Partial<VoucherData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      runValidation(next);
      return next;
    });
  }, [runValidation]);

  // ── Atualizar campos de array ──
  function updateArrayItem(arr: keyof VoucherData, index: number, field: string, value: string) {
    setData(prev => {
      const list = [...(prev[arr] as any[])];
      list[index] = typeof list[index] === 'object' ? { ...list[index], [field]: value } : value;
      return { ...prev, [arr]: list };
    });
  }
  function addArrayItem(arr: keyof VoucherData, defaultObj: any) {
    setData(prev => ({ ...prev, [arr]: [...(prev[arr] as any[]), defaultObj] }));
  }
  function removeArrayItem(arr: keyof VoucherData, index: number) {
    setData(prev => ({ ...prev, [arr]: (prev[arr] as any[]).filter((_, i) => i !== index) }));
  }

  // ── Upload OCR ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setLoading(true);
    setError(null);
    setLoadingMessage(`Processando ${files.length} arquivo(s) via IA...`);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('prompt', `Extraia como JSON canônico: destino, passageiros (array), voos, hospedagem, transporte, passeios, seguro, contatosEmergencia, localizadorGeral, observacoes. NÃO invente dados.`);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${supabase.supabaseUrl}/functions/v1/ocr-extractor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Falha no OCR');
      const extracted = await res.json();
      const merged: VoucherData = {
        destino: extracted.destino || data.destino,
        passageiros: [...new Set([...data.passageiros, ...(extracted.passageiros || [])].filter(Boolean))],
        voos: [...data.voos, ...(extracted.voos || [])],
        hospedagem: [...data.hospedagem, ...(extracted.hospedagem || [])],
        transporte: [...data.transporte, ...(extracted.transporte || [])],
        passeios: [...data.passeios, ...(extracted.passeios || [])],
        seguro: [...data.seguro, ...(extracted.seguro || [])],
        contatosEmergencia: [...data.contatosEmergencia, ...(extracted.contatosEmergencia || [])],
        localizadorGeral: extracted.localizadorGeral || data.localizadorGeral,
        observacoes: [data.observacoes, extracted.observacoes].filter(Boolean).join('\n\n'),
      };
      setData(merged);
      runValidation(merged);
      toast.success('Dados extraídos com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar OCR.');
      toast.error('Falha ao processar arquivo.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
      (e.target as HTMLInputElement).value = '';
    }
  };

  // ── Salvar ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        destino: data.destino,
        localizador: data.localizadorGeral,
        passageiros: data.passageiros.join(', '),
        data_checkin: data.hospedagem[0]?.checkin || null,
        data_checkout: data.hospedagem[0]?.checkout || null,
        hotel: JSON.stringify(data.hospedagem),
        voos: JSON.stringify(data.voos),
        transfer: JSON.stringify(data.transporte),
        emergencia: JSON.stringify(data.contatosEmergencia),
        ocr_raw_text: JSON.stringify(data),
      };
      if (initialData?.id) {
        await updateVoucher.mutateAsync({ id: initialData.id, ...payload });
      } else {
        await createVoucher.mutateAsync(payload);
      }
      toast.success('Voucher salvo com sucesso!');
      onClose?.();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── WhatsApp ──
  const generateWhatsApp = () => {
    const transf = data.transporte[0];
    let text = `Bom dia! Sua viagem para *${data.destino}* está chegando! ✈️✨\n\n`;
    if (data.localizadorGeral) text += `📋 *Localizador:* ${data.localizadorGeral}\n`;
    if (data.voos.length) text += `✈️ *Primeiro voo:* ${data.voos[0].trecho} - ${data.voos[0].data} às ${data.voos[0].horario}\n`;
    if (data.hospedagem.length) text += `🏨 *Hotel:* ${data.hospedagem[0].nome} (${data.hospedagem[0].checkin} → ${data.hospedagem[0].checkout})\n`;
    if (transf) text += `🚗 *Transfer:* ${transf.fornecedor} - ${transf.telefone}\n`;
    text += `\nQualquer dúvida, estamos à disposição! 🥂 — *${AGENCY_NAME}*`;
    return text;
  };

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsApp());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const exportPDF = async () => {
    const printWin = window.open('', '_blank');
    if (!printWin) { toast.error('Permita pop-ups para exportar.'); return; }
    const content = document.getElementById('voucher-preview-area')?.innerHTML || '';
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Voucher - ${data.destino}</title><style>body{font-family:sans-serif;padding:24px;color:#1a1a1a}*{box-sizing:border-box}</style></head><body>${content}</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  // ─── SECTIONS NAVIGATION ──────────────────────────────────────────────────
  const sections = [
    { id: 'resumo', label: 'Resumo', icon: MapPin },
    { id: 'passageiros', label: 'Passageiros', icon: Users },
    { id: 'voos', label: 'Voos', icon: Plane },
    { id: 'hospedagem', label: 'Hospedagem', icon: Building },
    { id: 'transporte', label: 'Transfer', icon: Car },
    { id: 'passeios', label: 'Passeios', icon: MapPin },
    { id: 'seguro', label: 'Seguro', icon: ShieldCheck },
    { id: 'emergencia', label: 'Emergência', icon: Phone },
    { id: 'exportar', label: 'Exportar', icon: Download },
  ];

  const footerActions = (
    <div className="flex items-center gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="border-vj-border font-bold">Fechar</Button>
      <Button onClick={handleSave} disabled={saving} className="bg-vj-green text-white hover:bg-vj-green/90 font-bold ml-auto gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData?.id ? 'Salvar Alterações' : 'Salvar Voucher'}
      </Button>
    </div>
  );

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title="Voucher & Boarding"
      subtitle={data.destino || 'Editor de Voucher Oficial'}
      icon={Ticket}
      sections={sections}
      footer={footerActions}
    >
      {(sec) => {
        const s = sec || activeSection;

        return (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-8 pb-12">
            {/* ─── OCR Upload ─────────────────────────────────────────────── */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-vj-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-black text-vj-txt uppercase tracking-tight">Importar via OCR</p>
                  <p className="text-[11px] text-vj-txt3">Arraste PDFs ou imagens de operadoras (FRT, CVC, Orinter...)</p>
                </div>
                {loading && (
                  <span className="flex items-center gap-2 text-[11px] text-vj-txt3 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-vj-green" />
                    {loadingMessage}
                  </span>
                )}
              </div>
              <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-vj-border rounded-xl bg-white cursor-pointer hover:border-vj-green/50 transition-colors group">
                <FileUp className="w-5 h-5 text-vj-txt3 group-hover:text-vj-green transition-colors" />
                <span className="text-sm font-semibold text-vj-txt2">Selecionar PDFs / Imagens</span>
                <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileUpload} disabled={loading} />
              </label>
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-600 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {validationWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                  <p className="font-bold flex items-center gap-1 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Atenção:</p>
                  <ul className="list-disc pl-4 space-y-0.5">{validationWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              )}
            </div>

            {/* ─── Resumo ─────────────────────────────────────────────────── */}
            {(s === 'resumo' || !s) && (
              <div>
                <SectionHeader id="resumo" icon={MapPin} label="Resumo da Viagem" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldInput label="Destino Principal" value={data.destino} onChange={v => updateData({ destino: v })} placeholder="Ex: Cancún, México" />
                  <FieldInput label="Localizador Geral" value={data.localizadorGeral} onChange={v => updateData({ localizadorGeral: v })} placeholder="ABC123" />
                  <div className="md:col-span-2">
                    <Label className="text-[10px] uppercase tracking-wider text-vj-txt3 font-bold mb-1 block">Observações</Label>
                    <Textarea
                      value={data.observacoes}
                      onChange={e => updateData({ observacoes: e.target.value })}
                      placeholder="Informações adicionais para o passageiro..."
                      rows={3}
                      className="text-sm bg-white border-vj-border focus:border-vj-green rounded-xl resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Passageiros ─────────────────────────────────────────────── */}
            {s === 'passageiros' && (
              <div>
                <SectionHeader id="passageiros" icon={Users} label="Passageiros" />
                <div className="space-y-3">
                  {data.passageiros.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={p}
                        onChange={e => updateArrayItem('passageiros', i, '', e.target.value)}
                        placeholder={`Passageiro ${i + 1}`}
                        className="h-9 text-sm bg-white border-vj-border focus:border-vj-green rounded-xl"
                      />
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-red-500 shrink-0"
                        onClick={() => removeArrayItem('passageiros', i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('passageiros', '')}>
                    <Plus className="w-4 h-4" /> Adicionar Passageiro
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Voos ────────────────────────────────────────────────────── */}
            {s === 'voos' && (
              <div>
                <SectionHeader id="voos" icon={Plane} label="Voos" />
                <div className="space-y-4">
                  {data.voos.map((voo, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('voos', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <FieldInput label="Tipo" value={voo.tipo} onChange={v => updateArrayItem('voos', i, 'tipo', v)} placeholder="Ida / Volta" />
                        <FieldInput label="Trecho" value={voo.trecho} onChange={v => updateArrayItem('voos', i, 'trecho', v)} placeholder="GRU → CUN" />
                        <FieldInput label="Data" value={voo.data} onChange={v => updateArrayItem('voos', i, 'data', v)} type="date" />
                        <FieldInput label="Cia Aérea" value={voo.cia} onChange={v => updateArrayItem('voos', i, 'cia', v)} placeholder="LATAM" />
                        <FieldInput label="Número Voo" value={voo.voo} onChange={v => updateArrayItem('voos', i, 'voo', v)} placeholder="LA3042" />
                        <FieldInput label="Horário" value={voo.horario} onChange={v => updateArrayItem('voos', i, 'horario', v)} placeholder="06:20" />
                        <FieldInput label="Localizador" value={voo.localizador} onChange={v => updateArrayItem('voos', i, 'localizador', v)} placeholder="XYZABC" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('voos', DEFAULT_VOO)}>
                    <Plus className="w-4 h-4" /> Adicionar Voo
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Hospedagem ──────────────────────────────────────────────── */}
            {s === 'hospedagem' && (
              <div>
                <SectionHeader id="hospedagem" icon={Building} label="Hospedagem" />
                <div className="space-y-4">
                  {data.hospedagem.map((h, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('hospedagem', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <FieldInput label="Nome do Hotel" value={h.nome} onChange={v => updateArrayItem('hospedagem', i, 'nome', v)} placeholder="Grand Hyatt" />
                        <FieldInput label="Check-in" value={h.checkin} onChange={v => updateArrayItem('hospedagem', i, 'checkin', v)} type="date" />
                        <FieldInput label="Check-out" value={h.checkout} onChange={v => updateArrayItem('hospedagem', i, 'checkout', v)} type="date" />
                        <FieldInput label="Regime" value={h.regime} onChange={v => updateArrayItem('hospedagem', i, 'regime', v)} placeholder="All Inclusive" />
                        <FieldInput label="Localizador" value={h.localizador} onChange={v => updateArrayItem('hospedagem', i, 'localizador', v)} placeholder="HTL-XYZ" />
                        <FieldInput label="Telefone Hotel" value={h.telefone} onChange={v => updateArrayItem('hospedagem', i, 'telefone', v)} placeholder="+52 998..." />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('hospedagem', DEFAULT_HOTEL)}>
                    <Plus className="w-4 h-4" /> Adicionar Hospedagem
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Transfer ────────────────────────────────────────────────── */}
            {s === 'transporte' && (
              <div>
                <SectionHeader id="transporte" icon={Car} label="Transfer & Transporte" />
                <div className="space-y-4">
                  {data.transporte.map((t, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('transporte', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <FieldInput label="Fornecedor" value={t.fornecedor} onChange={v => updateArrayItem('transporte', i, 'fornecedor', v)} placeholder="Amstar DMC" />
                        <FieldInput label="Tipo" value={t.tipo} onChange={v => updateArrayItem('transporte', i, 'tipo', v)} placeholder="Transfer IN" />
                        <FieldInput label="Data" value={t.data} onChange={v => updateArrayItem('transporte', i, 'data', v)} type="date" />
                        <FieldInput label="Horário" value={t.horario} onChange={v => updateArrayItem('transporte', i, 'horario', v)} placeholder="09:00" />
                        <FieldInput label="Localizador" value={t.localizador} onChange={v => updateArrayItem('transporte', i, 'localizador', v)} placeholder="TRF-001" />
                        <FieldInput label="Telefone Receptivo" value={t.telefone} onChange={v => updateArrayItem('transporte', i, 'telefone', v)} placeholder="+52 998..." />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('transporte', DEFAULT_TRANSFER)}>
                    <Plus className="w-4 h-4" /> Adicionar Transfer
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Passeios ────────────────────────────────────────────────── */}
            {s === 'passeios' && (
              <div>
                <SectionHeader id="passeios" icon={MapPin} label="Passeios & Experiências" />
                <div className="space-y-4">
                  {data.passeios.map((p, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('passeios', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldInput label="Nome do Passeio" value={p.nome} onChange={v => updateArrayItem('passeios', i, 'nome', v)} placeholder="Isla Mujeres Tour" />
                        <FieldInput label="Data" value={p.data} onChange={v => updateArrayItem('passeios', i, 'data', v)} type="date" />
                        <FieldInput label="Horário" value={p.horario} onChange={v => updateArrayItem('passeios', i, 'horario', v)} placeholder="08:00" />
                        <FieldInput label="Local de Embarque" value={p.local} onChange={v => updateArrayItem('passeios', i, 'local', v)} placeholder="Lobby do Hotel" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('passeios', DEFAULT_PASSEIO)}>
                    <Plus className="w-4 h-4" /> Adicionar Passeio
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Seguro ──────────────────────────────────────────────────── */}
            {s === 'seguro' && (
              <div>
                <SectionHeader id="seguro" icon={ShieldCheck} label="Seguro Viagem" />
                <div className="space-y-4">
                  {data.seguro.map((seg, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('seguro', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldInput label="Seguradora" value={seg.empresa} onChange={v => updateArrayItem('seguro', i, 'empresa', v)} placeholder="Assist Card" />
                        <FieldInput label="Nº Apólice" value={seg.apolice} onChange={v => updateArrayItem('seguro', i, 'apolice', v)} placeholder="AC-123456" />
                        <FieldInput label="Central 24h" value={seg.telefone24h} onChange={v => updateArrayItem('seguro', i, 'telefone24h', v)} placeholder="+55 800..." />
                        <FieldInput label="Vigência" value={seg.vigencia} onChange={v => updateArrayItem('seguro', i, 'vigencia', v)} placeholder="01/06 a 15/06" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('seguro', DEFAULT_SEGURO)}>
                    <Plus className="w-4 h-4" /> Adicionar Seguro
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Emergência ──────────────────────────────────────────────── */}
            {s === 'emergencia' && (
              <div>
                <SectionHeader id="emergencia" icon={Phone} label="Contatos de Emergência" />
                <div className="space-y-4">
                  {data.contatosEmergencia.map((c, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-vj-border rounded-2xl space-y-3 relative group">
                      <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-7 w-7 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeArrayItem('contatosEmergencia', i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldInput label="Nome / Empresa" value={c.nome} onChange={v => updateArrayItem('contatosEmergencia', i, 'nome', v)} placeholder="Hotel Grand Hyatt" />
                        <FieldInput label="Tipo" value={c.tipo} onChange={v => updateArrayItem('contatosEmergencia', i, 'tipo', v)} placeholder="Hotel / Receptivo" />
                        <FieldInput label="Telefone / WhatsApp" value={c.telefone} onChange={v => updateArrayItem('contatosEmergencia', i, 'telefone', v)} placeholder="+52 998..." />
                        <FieldInput label="E-mail (opcional)" value={c.email || ''} onChange={v => updateArrayItem('contatosEmergencia', i, 'email', v)} placeholder="contato@hotel.com" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-2 border-dashed border-vj-border text-vj-txt3 hover:border-vj-green hover:text-vj-green"
                    onClick={() => addArrayItem('contatosEmergencia', DEFAULT_CONTATO)}>
                    <Plus className="w-4 h-4" /> Adicionar Contato
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Exportar ────────────────────────────────────────────────── */}
            {s === 'exportar' && (
              <div>
                <SectionHeader id="exportar" icon={Download} label="Exportar & Compartilhar" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="p-5 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      <p className="font-bold text-sm text-zinc-800">Mensagem WhatsApp</p>
                    </div>
                    <pre className="text-xs text-zinc-600 bg-white rounded-xl p-3 border border-zinc-100 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto no-scrollbar">
                      {generateWhatsApp()}
                    </pre>
                    <Button
                      onClick={copyWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#1EA855] text-white font-bold gap-2"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado!' : 'Copiar Mensagem'}
                    </Button>
                  </div>

                  {/* PDF */}
                  <div className="p-5 bg-zinc-50 border border-vj-border rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-vj-txt3" />
                      <p className="font-bold text-sm text-zinc-800">Exportar PDF</p>
                    </div>
                    <p className="text-xs text-vj-txt3">Gera um documento PDF formatado com todos os dados do voucher para impressão ou envio.</p>
                    <Button onClick={exportPDF} variant="outline" className="w-full border-vj-border font-bold gap-2">
                      <Download className="w-4 h-4" /> Gerar PDF / Imprimir
                    </Button>
                  </div>
                </div>

                {/* Prévia */}
                <div id="voucher-preview-area" className="mt-6 p-6 bg-white border border-vj-border rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-vj-txt3 font-bold">Voucher Oficial</p>
                      <h2 className="text-xl font-black text-vj-txt">{data.destino || 'Destino'}</h2>
                    </div>
                    {AGENCY_LOGO && <img src={AGENCY_LOGO} alt={AGENCY_NAME} className="h-10 w-auto object-contain" />}
                  </div>
                  {data.voos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase text-vj-txt3 mb-2">Voos</p>
                      {data.voos.map((v, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-zinc-50 last:border-0">
                          <Plane className="w-3.5 h-3.5 text-vj-green" />
                          <span className="font-bold">{v.tipo}</span>
                          <span className="text-vj-txt2">{v.trecho}</span>
                          <span className="text-vj-txt3">{v.data} {v.horario}</span>
                          {v.localizador && <Badge variant="outline" className="text-[9px] ml-auto">{v.localizador}</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                  {data.hospedagem.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-vj-txt3 mb-2">Hospedagem</p>
                      {data.hospedagem.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-1">
                          <Building className="w-3.5 h-3.5 text-vj-green" />
                          <span className="font-bold">{h.nome}</span>
                          <span className="text-vj-txt3">{h.checkin} → {h.checkout}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </SheetPage>
  );
}
