/**
 * src/pages/Vouchers.tsx
 *
 * Módulo de Vouchers / Boarding Pass com OCR multi-arquivo e geração de PDF.
 * Adaptado do aiturisagente para o design OMEGA (Bento/Shadowless + Supabase).
 */
import { useState, useRef } from 'react';
import {
  Plus, Search, Trash2, Edit, Loader2, FileCheck, Download, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  type VoucherRecord,
} from '@/hooks/useVouchers';
import { processOcr, VOUCHER_PROMPT } from '@/lib/ocr';

export default function Vouchers() {
  const { data: vouchers = [], isLoading } = useVouchers();
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteVoucher = useDeleteVoucher();

  const [searchTerm, setSearchTerm]     = useState('');
  const [isSheetOpen, setIsSheetOpen]   = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [formData, setFormData]         = useState<Partial<VoucherRecord>>({});
  const a4Ref = useRef<HTMLDivElement>(null);

  const isEditing = !!formData.id;

  // ── OCR ──────────────────────────────────────────────────────────────────

  const handleOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsOcrLoading(true);

    const result = await processOcr({ files, prompt: VOUCHER_PROMPT });

    if (result.success && result.data) {
      const d = result.data as Record<string, unknown>;
      setFormData(prev => ({
        ...prev,
        destino:       String(d.destino      ?? prev.destino ?? ''),
        localizador:   String(d.localizador  ?? prev.localizador ?? ''),
        passageiros:   String(d.passageiros  ?? prev.passageiros ?? ''),
        data_checkin:  String(d.dataCheckin  ?? prev.data_checkin ?? ''),
        data_checkout: String(d.dataCheckout ?? prev.data_checkout ?? ''),
        hotel:         String(d.hotel        ?? prev.hotel ?? ''),
        voos:          String(d.voos         ?? prev.voos ?? ''),
        transfer:      String(d.transfer     ?? prev.transfer ?? ''),
        emergencia:    String(d.emergencia   ?? prev.emergencia ?? ''),
        ocr_raw_text:  result.rawText,
      }));
      toast.success('Voucher processado pela IA!');
    } else {
      toast.error(result.error ?? 'Erro no OCR');
    }

    setIsOcrLoading(false);
    e.target.value = '';
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const payload = {
      destino:       formData.destino ?? null,
      localizador:   formData.localizador ?? null,
      passageiros:   formData.passageiros ?? null,
      data_checkin:  formData.data_checkin || null,
      data_checkout: formData.data_checkout || null,
      hotel:         formData.hotel ?? null,
      voos:          formData.voos ?? null,
      transfer:      formData.transfer ?? null,
      emergencia:    formData.emergencia ?? null,
      media_url:     formData.media_url ?? null,
      media_name:    formData.media_name ?? null,
      ocr_raw_text:  formData.ocr_raw_text ?? null,
    };

    if (isEditing && formData.id) {
      await updateVoucher.mutateAsync({ id: formData.id, ...payload });
    } else {
      await createVoucher.mutateAsync(payload);
    }
    setIsSheetOpen(false);
    setFormData({});
  };

  // ── PDF ──────────────────────────────────────────────────────────────────

  const downloadPdf = async () => {
    if (!a4Ref.current) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const toastId = toast.loading('Gerando PDF...');
      const clone   = a4Ref.current.cloneNode(true) as HTMLElement;
      clone.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:794px;display:block;';
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdf    = new jsPDF('p', 'mm', 'a4');
      const w      = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`Voucher_${formData.destino || 'Viagem'}.pdf`);
      document.body.removeChild(clone);
      toast.dismiss(toastId);
      toast.success('PDF gerado!');
    } catch {
      toast.error('Erro ao gerar PDF.');
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = vouchers.filter(v =>
    (v.destino     ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.localizador ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <PageHeader title="Vouchers & Boarding" subtitle="Cards de embarque e resumos de viagem para o passageiro" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 bg-white border border-vj-border rounded-xl px-4 py-2 flex-1 max-w-sm shadow-sm">
            <Search className="text-vj-txt3 shrink-0" size={16} />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por destino ou localizador..."
              className="border-none bg-transparent focus-visible:ring-0 px-0 text-sm"
            />
          </div>
          <Button
            onClick={() => { setFormData({}); setIsSheetOpen(true); }}
            className="bg-vj-green text-white hover:bg-vj-green/90 rounded-xl font-bold text-xs"
          >
            <Plus size={16} className="mr-2" /> Novo Voucher
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-vj-txt3" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-vj-border rounded-2xl text-vj-txt3 gap-3">
            <FileCheck size={40} className="opacity-30" />
            <p className="font-medium text-sm">Nenhum voucher gerado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div key={v.id} className="bg-white border border-vj-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-vj-green/40 transition-colors">
                <h3 className="font-bold text-vj-txt line-clamp-1">{v.destino || 'Destino a definir'}</h3>
                <p className="text-xs font-mono font-bold text-vj-txt3 bg-vj-bg px-2 py-0.5 rounded w-fit">
                  LOC: {v.localizador || 'N/A'}
                </p>
                <div className="text-xs text-vj-txt3 mt-1 space-y-0.5">
                  {v.data_checkin && <p>Check-in: {v.data_checkin}</p>}
                  {v.hotel && <p>Hotel: {v.hotel}</p>}
                </div>
                <div className="flex justify-end gap-1 pt-2 border-t border-vj-border mt-auto">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-vj-txt"
                    onClick={() => { setFormData(v); setIsSheetOpen(true); }}>
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-red-600"
                    onClick={() => { if (confirm('Excluir?')) void deleteVoucher.mutateAsync(v.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={v => { setIsSheetOpen(v); if (!v) setFormData({}); }}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col h-full p-0">
          <SheetHeader className="p-6 border-b border-vj-border shrink-0">
            <SheetTitle className="text-xl font-bold">
              {isEditing ? 'Editar Voucher' : 'Novo Voucher'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-vj-bg">

            {/* OCR Drop Zone */}
            <div className="bg-white border-2 border-dashed border-vj-border rounded-2xl p-6 flex flex-col items-center gap-3 relative hover:border-vj-green/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => void handleOcr(e)}
                disabled={isOcrLoading}
              />
              <div className="bg-vj-bg border border-vj-border p-3 rounded-full pointer-events-none">
                {isOcrLoading
                  ? <Loader2 className="animate-spin text-vj-green" size={22} />
                  : <Wand2 className="text-vj-green" size={22} />
                }
              </div>
              <div className="text-center pointer-events-none">
                <p className="text-xs font-bold text-vj-txt uppercase tracking-wider">Processador Multi-arquivo</p>
                <p className="text-[11px] text-vj-txt3 mt-1 max-w-[280px]">
                  Arraste múltiplos bilhetes ou reservas de hotel. A IA interpreta tudo num único resumo.
                </p>
              </div>
            </div>

            {/* Campos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Destino</label>
                <Input value={formData.destino ?? ''} onChange={e => setFormData(p => ({ ...p, destino: e.target.value }))} className="mt-1 bg-white border-vj-border" />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Localizador PNR</label>
                <Input value={formData.localizador ?? ''} onChange={e => setFormData(p => ({ ...p, localizador: e.target.value }))} className="mt-1 bg-white border-vj-border font-mono" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Passageiros</label>
                <Input value={formData.passageiros ?? ''} placeholder="João, Maria..." onChange={e => setFormData(p => ({ ...p, passageiros: e.target.value }))} className="mt-1 bg-white border-vj-border" />
              </div>

              <div className="col-span-2 border-t border-vj-border pt-4">
                <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-widest mb-3">Hospedagem</h4>
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Check-in</label>
                <Input type="date" value={formData.data_checkin ?? ''} onChange={e => setFormData(p => ({ ...p, data_checkin: e.target.value }))} className="mt-1 bg-white border-vj-border" />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Check-out</label>
                <Input type="date" value={formData.data_checkout ?? ''} onChange={e => setFormData(p => ({ ...p, data_checkout: e.target.value }))} className="mt-1 bg-white border-vj-border" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Hotel / Detalhes</label>
                <Input value={formData.hotel ?? ''} onChange={e => setFormData(p => ({ ...p, hotel: e.target.value }))} className="mt-1 bg-white border-vj-border" />
              </div>

              <div className="col-span-2 border-t border-vj-border pt-4">
                <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-widest mb-3">Voos & Transfer</h4>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Voos</label>
                <textarea
                  className="mt-1 w-full min-h-[72px] bg-white border border-vj-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/30 resize-none"
                  value={formData.voos ?? ''}
                  placeholder="Ex: GOL G31234 GRU→CUN 10/10 14:00..."
                  onChange={e => setFormData(p => ({ ...p, voos: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Transfer e Receptivo</label>
                <textarea
                  className="mt-1 w-full min-h-[56px] bg-white border border-vj-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/30 resize-none"
                  value={formData.transfer ?? ''}
                  onChange={e => setFormData(p => ({ ...p, transfer: e.target.value }))}
                />
              </div>

              <div className="col-span-2 border-t border-vj-border pt-4">
                <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-widest mb-3">Seguro & Emergências</h4>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Contatos de Emergência</label>
                <textarea
                  className="mt-1 w-full min-h-[56px] bg-white border border-vj-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/30 resize-none"
                  value={formData.emergencia ?? ''}
                  placeholder="0800 123 456 — Seguro Policy #9999"
                  onChange={e => setFormData(p => ({ ...p, emergencia: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Template A4 oculto para PDF */}
          <div className="hidden">
            <div ref={a4Ref} className="bg-white text-black font-sans" style={{ width: '794px', padding: '60px', minHeight: '1123px' }}>
              <div className="border-4 border-black p-8 text-center mb-12">
                <h1 className="text-5xl font-black mb-3">VOUCHER DE VIAGEM</h1>
                <h2 className="text-2xl font-bold text-gray-600 uppercase mb-8">{formData.destino || 'Destino'}</h2>
                <p className="text-lg"><strong>Passageiros:</strong> {formData.passageiros}</p>
                <p className="bg-black text-white px-6 py-3 inline-block font-mono text-xl font-bold mt-4 tracking-widest">
                  LOC: {formData.localizador || '______'}
                </p>
              </div>
              <div className="space-y-10">
                <div className="border-b-2 border-dashed border-gray-200 pb-8">
                  <h3 className="text-xl font-black bg-black text-white px-4 py-1.5 inline-block mb-4 uppercase">Hospedagem</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-in</p><p className="font-black text-lg">{formData.data_checkin || '—'}</p></div>
                    <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-out</p><p className="font-black text-lg">{formData.data_checkout || '—'}</p></div>
                    <div className="col-span-2"><p className="text-xs text-gray-500 font-bold uppercase mb-1">Hotel</p><p className="font-bold whitespace-pre-wrap">{formData.hotel || '—'}</p></div>
                  </div>
                </div>
                <div className="border-b-2 border-dashed border-gray-200 pb-8">
                  <h3 className="text-xl font-black bg-black text-white px-4 py-1.5 inline-block mb-4 uppercase">Voos & Transfer</h3>
                  <p className="whitespace-pre-wrap font-medium">{formData.voos || '—'}</p>
                  {formData.transfer && <p className="mt-4 whitespace-pre-wrap font-medium text-gray-700">{formData.transfer}</p>}
                </div>
                <div>
                  <h3 className="text-xl font-black bg-red-600 text-white px-4 py-1.5 inline-block mb-4 uppercase">Seguro & Emergências</h3>
                  <p className="whitespace-pre-wrap font-medium">{formData.emergencia || '—'}</p>
                </div>
              </div>
              <div className="mt-12 text-center text-gray-400 text-xs border-t pt-6">
                Documento gerado em {new Date().toLocaleDateString('pt-BR')} — Turis Agências
              </div>
            </div>
          </div>

          <SheetFooter className="p-6 border-t border-vj-border shrink-0 bg-white gap-2">
            <Button variant="outline" onClick={() => void downloadPdf()} className="border-vj-border">
              <Download size={14} className="mr-2" /> Gerar PDF A4
            </Button>
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleSave()}
              disabled={createVoucher.isPending || updateVoucher.isPending}
              className="bg-vj-green text-white hover:bg-vj-green/90 font-bold"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Voucher'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
