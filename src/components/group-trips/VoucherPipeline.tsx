import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { processOcr, VOUCHER_PROMPT } from '@/lib/ocr';
import { useAuthStore } from '@/stores/authStore';
import { Upload, Download, Smartphone, Plane, Hotel, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface VoucherPipelineProps {
  groupTripId: string;
}

export function VoucherPipeline({ groupTripId }: VoucherPipelineProps) {
  const { organization } = useAuthStore();
  const AGENCY_NAME = organization?.name || 'Turis Agências';
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  
  const voucherRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    toast.info('Lendo voucher da operadora com IA...');

    try {
      const result = await processOcr<any>({
        files: [file],
        prompt: VOUCHER_PROMPT,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Falha ao extrair voucher.');
      }

      setVoucherData(result.data);
      toast.success('Voucher extraído e sanitizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const exportVoucher = async () => {
    if (!voucherRef.current) return;
    setIsRendering(true);
    toast.info('Gerando imagem em alta resolução...');

    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 2, // Retinadisplay ready
        useCORS: true,
        backgroundColor: '#0F1C2E',
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Voucher_${voucherData?.destino || 'Viagem'}.png`;
      link.href = imgData;
      link.click();
      
      toast.success('Voucher salvo! (Formato Story 9:16)');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao renderizar o voucher.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_430px] gap-8">
      
      {/* ── PAINEL DE CONTROLE (ESQUERDA) ── */}
      <div className="space-y-6">
        <Card className="p-8 rounded-[2rem] border-dashed border-2 border-vj-blue/30 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center hover:border-vj-blue/60 transition-colors">
          <Upload size={32} className="text-vj-blue mb-3" />
          <h3 className="font-bold text-lg mb-1">OCR de Vouchers</h3>
          <p className="text-sm text-zinc-500 mb-6">
            Faça upload do PDF/Imagem do voucher original (FRT, Orinter, etc). 
            A IA extrairá os dados e removerá multas/cancelamentos para não assustar o cliente.
          </p>
          <Input 
            type="file" 
            accept=".pdf,image/*" 
            onChange={handleUpload} 
            disabled={isExtracting} 
            className="max-w-xs cursor-pointer" 
          />
          {isExtracting && <p className="mt-4 text-sm text-vj-blue font-bold animate-pulse">Lendo documento com IA...</p>}
        </Card>

        {voucherData && (
          <Card className="p-6 rounded-[2rem] border-vj-green/30 bg-vj-green/5 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="font-bold text-vj-green mb-4 flex items-center gap-2">
              <Smartphone size={18} /> Dados Extraídos com Sucesso
            </h3>
            <pre className="text-xs bg-white/80 p-4 rounded-xl border border-vj-green/20 overflow-x-auto max-h-[300px] overflow-y-auto">
              {JSON.stringify(voucherData, null, 2)}
            </pre>
            <Button onClick={exportVoucher} className="mt-4 w-full gap-2 h-12 rounded-xl text-md font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]" disabled={isRendering}>
              <Download size={16} /> Baixar Voucher (Formato Instagram Story)
            </Button>
          </Card>
        )}
      </div>

      {/* ── RENDERIZADOR VISUAL (DIREITA) ── */}
      <div className="flex justify-center bg-zinc-100 p-8 rounded-xl border border-zinc-200 overflow-hidden">
        {!voucherData ? (
          <div className="w-[380px] h-[675px] bg-white rounded-[2rem] border-8 border-zinc-300 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
            <Smartphone size={48} className="mb-4 opacity-50" />
            <p>O voucher formatado aparecerá aqui.</p>
          </div>
        ) : (
          /* CANVAS HTML: Proporção 9:16 (Story) */
          <div 
            ref={voucherRef}
            className="relative w-[380px] h-[675px] bg-[#0F1C2E] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-[#1A2B47] to-transparent">
              <p className="text-[#4A9FD4] text-xs font-bold uppercase tracking-widest mb-1">Seu Voucher</p>
              <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                {voucherData.destino || 'Destino Incrível'}
              </h2>
            </div>

            {/* Content Cards */}
            <div className="flex-1 p-6 space-y-4 overflow-hidden">
              
              {/* Loc ID */}
              <div className="bg-[#D4A017] text-[#0F1C2E] p-3 rounded-xl font-bold flex justify-between items-center shadow-lg">
                <span className="text-sm uppercase opacity-80">Localizador</span>
                <span className="text-lg tracking-wider">{voucherData.localizador || 'A DEFINIR'}</span>
              </div>

              {/* Voos */}
              {voucherData.voos && (
                <div className="bg-[#1A2B47] p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[#4A9FD4] mb-2">
                    <Plane size={16} /> <span className="font-bold text-sm uppercase">Aéreo</span>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{voucherData.voos}</p>
                </div>
              )}

              {/* Hotel */}
              {voucherData.hotel && (
                <div className="bg-[#1A2B47] p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[#4A9FD4] mb-2">
                    <Hotel size={16} /> <span className="font-bold text-sm uppercase">Hospedagem</span>
                  </div>
                  <p className="font-bold">{voucherData.hotel}</p>
                  <div className="flex gap-4 text-xs text-white/60">
                    <span>IN: {voucherData.dataCheckin || '--'}</span>
                    <span>OUT: {voucherData.dataCheckout || '--'}</span>
                  </div>
                </div>
              )}

              {/* Transfer */}
              {voucherData.transfer && (
                <div className="bg-[#1A2B47] p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-[#4A9FD4] mb-2">
                    <Navigation size={16} /> <span className="font-bold text-sm uppercase">Receptivo</span>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{voucherData.transfer}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 text-center border-t border-white/10 bg-[#0F1C2E]">
              <p className="text-[#D4A017] font-serif font-bold italic">{AGENCY_NAME}</p>
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">Excelência em cada detalhe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
