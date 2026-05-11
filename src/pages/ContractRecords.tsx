/**
 * src/pages/ContractRecords.tsx
 *
 * Gerador de Contratos Jurídicos com OCR de Recibos.
 * Funcionalidade trazida do aiturisagente e adaptada ao design OMEGA (Bento/Shadowless).
 */
import { useState, useRef } from 'react';
import { Plus, Search, Trash2, Edit, Loader2, FileSignature, Download, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  useContractRecords,
  useCreateContractRecord,
  useUpdateContractRecord,
  useDeleteContractRecord,
  type ContractRecord,
} from '@/hooks/useContractRecords';
import { processOcr, CONTRACT_PROMPT } from '@/lib/ocr';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  emitido:  'bg-blue-100 text-blue-700',
  assinado: 'bg-green-100 text-green-700',
  cancelado:'bg-red-100 text-red-600',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ContractRecords() {
  const { data: contracts = [], isLoading } = useContractRecords();
  const createContract = useCreateContractRecord();
  const updateContract = useUpdateContractRecord();
  const deleteContract = useDeleteContractRecord();

  const [searchTerm, setSearchTerm]       = useState('');
  const [isSheetOpen, setIsSheetOpen]     = useState(false);
  const [isOcrLoading, setIsOcrLoading]   = useState(false);
  const [agentInstructions, setAgentInstructions] = useState('');
  const [formData, setFormData]           = useState<Partial<ContractRecord>>({});
  const a4Ref = useRef<HTMLDivElement>(null);

  const isEditing = !!formData.id;

  // ── OCR ──────────────────────────────────────────────────────────────────

  const handleOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsOcrLoading(true);

    const customPrompt = agentInstructions
      ? `INSTRUÇÕES DO AGENTE (prioridade máxima): ${agentInstructions}\n\n${CONTRACT_PROMPT}`
      : CONTRACT_PROMPT;

    const result = await processOcr({ files, prompt: customPrompt });

    if (result.success && result.data) {
      const d = result.data as Record<string, unknown>;
      setFormData(prev => ({
        ...prev,
        contratante:  (d.contratante as Record<string, unknown>) ?? {},
        pagantes:     (d.pagantes as unknown[]) ?? [],
        passageiros:  (d.passageiros as unknown[]) ?? [],
        voos:         (d.voos as unknown[]) ?? [],
        hospedagem:   (d.hospedagem as unknown[]) ?? [],
        financeiro:   (d.financeiro as Record<string, unknown>) ?? {},
        titular:      (d.contratante as { nome?: string })?.nome ?? prev.titular,
        pacote:       ((d.pacote as { destino?: string })?.destino ?? (d.pacote as { nome?: string })?.nome) ?? prev.pacote,
        valor_total:  (d.financeiro as { valorTotal?: number })?.valorTotal ?? prev.valor_total,
        ocr_raw_text: result.rawText,
      }));
      toast.success('Dados do contrato extraídos com sucesso!');
    } else {
      toast.error(result.error ?? 'Erro no OCR');
    }

    setIsOcrLoading(false);
    e.target.value = '';
  };

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const payload = {
      titular:     formData.titular ?? null,
      pacote:      formData.pacote ?? null,
      destino:     (formData.contratante as { endereco?: string } | undefined)?.endereco ?? formData.destino ?? null,
      status:      formData.status ?? 'emitido',
      valor_total: formData.valor_total ?? null,
      contratante: formData.contratante ?? {},
      pagantes:    formData.pagantes ?? [],
      passageiros: formData.passageiros ?? [],
      voos:        formData.voos ?? [],
      hospedagem:  formData.hospedagem ?? [],
      financeiro:  formData.financeiro ?? {},
      ocr_raw_text: formData.ocr_raw_text ?? null,
    };

    if (isEditing && formData.id) {
      await updateContract.mutateAsync({ id: formData.id, ...payload });
    } else {
      await createContract.mutateAsync(payload);
    }
    setIsSheetOpen(false);
    setFormData({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este contrato?')) return;
    await deleteContract.mutateAsync(id);
  };

  // ── PDF ──────────────────────────────────────────────────────────────────

  const downloadPdf = async () => {
    if (!a4Ref.current) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      toast.loading('Gerando PDF...');
      const clone = a4Ref.current.cloneNode(true) as HTMLElement;
      clone.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:794px;height:auto;min-height:1123px;';
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: '#fff' });
      const pdf    = new jsPDF('p', 'mm', 'a4');
      const w      = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
      pdf.save(`Contrato_${formData.titular || 'Cliente'}.pdf`);
      document.body.removeChild(clone);
      toast.dismiss();
      toast.success('PDF gerado!');
    } catch {
      toast.error('Erro ao gerar PDF.');
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = contracts.filter(c =>
    (c.titular ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.pacote  ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.numero  ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const contratante = formData.contratante as Record<string, string> | undefined;
  const pagantes    = (formData.pagantes ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <PageHeader title="Contratos Jurídicos" subtitle="Gerador automático via OCR de recibos e faturas" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 bg-white border border-vj-border rounded-xl px-4 py-2 flex-1 max-w-sm shadow-sm">
            <Search className="text-vj-txt3 shrink-0" size={16} />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, pacote ou número..."
              className="border-none bg-transparent focus-visible:ring-0 px-0 text-sm"
            />
          </div>
          <Button
            onClick={() => { setFormData({}); setAgentInstructions(''); setIsSheetOpen(true); }}
            className="bg-vj-green text-white hover:bg-vj-green/90 rounded-xl font-bold text-xs"
          >
            <Plus size={16} className="mr-2" /> Novo Contrato
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-vj-txt3" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-vj-border rounded-2xl text-vj-txt3 gap-3">
            <FileSignature size={40} className="opacity-30" />
            <p className="font-medium text-sm">Nenhum contrato gerado ainda.</p>
            <p className="text-xs">Clique em "Novo Contrato" e faça upload de um recibo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-white border border-vj-border rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-vj-green/40 transition-colors">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-vj-txt">{c.titular || 'Sem titular'}</h3>
                  <p className="text-xs text-vj-txt3">{c.pacote || 'Pacote não definido'}</p>
                  {c.valor_total && (
                    <p className="text-xs font-bold text-vj-green">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valor_total)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-[10px] font-bold uppercase px-2 py-0.5 ${STATUS_COLORS[c.status]}`}>
                    {c.numero ?? c.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-vj-txt"
                    onClick={() => { setFormData(c); setIsSheetOpen(true); }}>
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-red-600"
                    onClick={() => void handleDelete(c.id)}>
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
              {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-vj-bg">

            {/* Instruções para IA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-vj-txt3 uppercase tracking-widest">
                Instruções Prévias ao OCR (Opcional)
              </label>
              <textarea
                className="w-full min-h-[56px] bg-white border border-vj-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/30 resize-none"
                placeholder="Ex: Agrupamento familiar, 'Ignorar valores do fornecedor Y', 'Pagante principal é o pai'..."
                value={agentInstructions}
                onChange={e => setAgentInstructions(e.target.value)}
              />
            </div>

            {/* Drop zone OCR */}
            <div className="bg-white border-2 border-dashed border-vj-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-vj-green/50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => void handleOcr(e)}
                disabled={isOcrLoading}
              />
              <div className="bg-vj-bg border border-vj-border p-3 rounded-full">
                {isOcrLoading
                  ? <Loader2 className="animate-spin text-vj-green" size={22} />
                  : <Wand2 className="text-vj-green" size={22} />
                }
              </div>
              <div className="text-center pointer-events-none">
                <p className="text-xs font-bold text-vj-txt uppercase tracking-wider">
                  {isOcrLoading ? 'Processando com IA...' : 'Ler via OCR'}
                </p>
                <p className="text-[11px] text-vj-txt3 mt-1 max-w-[240px]">
                  Arraste recibos, faturas ou contratos (PDF/Imagem). A IA preencherá os campos.
                </p>
              </div>
            </div>

            {/* Formulário */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-vj-txt3 uppercase">Nome Contratante Principal</label>
                <Input
                  value={contratante?.nome ?? ''}
                  onChange={e => setFormData(p => ({ ...p, contratante: { ...contratante, nome: e.target.value }, titular: e.target.value }))}
                  className="mt-1 bg-white border-vj-border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">CPF</label>
                <Input
                  value={contratante?.cpf ?? ''}
                  onChange={e => setFormData(p => ({ ...p, contratante: { ...contratante, cpf: e.target.value } }))}
                  className="mt-1 bg-white border-vj-border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Destino / Pacote</label>
                <Input
                  value={formData.pacote ?? ''}
                  onChange={e => setFormData(p => ({ ...p, pacote: e.target.value }))}
                  className="mt-1 bg-white border-vj-border"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Valor Total (R$)</label>
                <Input
                  type="number"
                  value={formData.valor_total ?? ''}
                  onChange={e => setFormData(p => ({ ...p, valor_total: Number(e.target.value) }))}
                  className="mt-1 bg-white border-vj-border font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-vj-txt3 uppercase">Status</label>
                <select
                  className="mt-1 w-full h-10 border border-vj-border rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-vj-green/30 outline-none"
                  value={formData.status ?? 'emitido'}
                  onChange={e => setFormData(p => ({ ...p, status: e.target.value as ContractRecord['status'] }))}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="emitido">Emitido</option>
                  <option value="assinado">Assinado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Pagantes extraídos */}
              {pagantes.length > 0 && (
                <>
                  <div className="col-span-2 border-t border-vj-border pt-4">
                    <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-widest mb-3">
                      Pagantes Extraídos ({pagantes.length})
                    </h4>
                  </div>
                  {pagantes.map((pg, idx) => {
                    const p = pg as Record<string, unknown>;
                    return (
                      <div key={idx} className="col-span-2 grid grid-cols-3 gap-2 p-3 bg-white border border-vj-border rounded-xl">
                        <div>
                          <label className="text-[10px] font-bold text-vj-txt3 uppercase">Nome</label>
                          <p className="text-sm font-medium text-vj-txt mt-0.5">{String(p.nome ?? '—')}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-vj-txt3 uppercase">Valor</label>
                          <p className="text-sm font-bold text-vj-green mt-0.5">
                            {p.valor ? `R$ ${Number(p.valor).toLocaleString()}` : '—'}
                          </p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-vj-txt3 uppercase">Parcelas</label>
                          <p className="text-sm font-medium text-vj-txt mt-0.5">{String(p.parcelas ?? 1)}x</p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Preview A4 miniatura */}
            <div ref={a4Ref} className="hidden bg-white text-black p-8 font-sans" style={{ width: '794px', minHeight: '1123px' }}>
              <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                  <h1 className="text-2xl font-black uppercase">CONTRATO DE PRESTAÇÃO DE SERVIÇOS TURÍSTICOS</h1>
                  <p className="text-gray-500 text-xs mt-1">Emitido em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="space-y-6 text-sm">
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="font-bold mb-2 uppercase text-xs tracking-wider">CONTRATANTE PRINCIPAL</p>
                  <p>Nome: {contratante?.nome || '___'}</p>
                  <p>CPF: {contratante?.cpf || '___'}</p>
                  <p>E-mail: {contratante?.email || '___'}</p>
                  <p>Telefone: {contratante?.telefone || '___'}</p>
                </div>
                {pagantes.length > 0 && (
                  <div>
                    <p className="font-bold mb-2 uppercase text-xs tracking-wider bg-black text-white px-2 py-1 inline-block">PAGANTES</p>
                    {pagantes.map((pg, i) => {
                      const p = pg as Record<string, unknown>;
                      return (
                        <div key={i} className="border-b border-gray-200 py-2">
                          <p>{String(p.nome ?? '')} — CPF: {String(p.cpf ?? '')} — {p.parcelas ?? 1}x — R$ {p.valor ?? 0} — {String(p.formaPagamento ?? '')}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-8 pt-6 border-t font-bold">
                  <p>VALOR TOTAL DO CONTRATO: R$ {formData.valor_total?.toLocaleString() ?? '0'}</p>
                </div>
                <div className="mt-16 flex justify-around">
                  <div className="text-center border-t border-black w-48 pt-2">
                    <p className="text-xs">Assinatura do Contratante</p>
                  </div>
                  <div className="text-center border-t border-black w-48 pt-2">
                    <p className="text-xs">Assinatura da Agência</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <SheetFooter className="p-6 border-t border-vj-border shrink-0 bg-white gap-2">
            <Button variant="outline" onClick={() => void downloadPdf()} className="border-vj-border">
              <Download size={14} className="mr-2" /> Baixar PDF
            </Button>
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleSave()}
              disabled={createContract.isPending || updateContract.isPending}
              className="bg-vj-green text-white hover:bg-vj-green/90 font-bold"
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Contrato'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
