import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGroupClients } from '@/hooks/useGroupClients';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { useAuthStore } from '@/stores/authStore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FileSignature, Download, Printer, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GroupContractGeneratorProps {
  groupTripId: string;
}

export function GroupContractGenerator({ groupTripId }: GroupContractGeneratorProps) {
  const { data: clients, isLoading } = useGroupClients(groupTripId);
  const { data: trips } = useGroupTrips();
  const { organization } = useAuthStore();
  const trip = trips?.find(t => t.id === groupTripId);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients?.find(c => c.id === selectedClientId);

  const generatePDF = async () => {
    if (!contractRef.current || !selectedClient || !trip) return;
    setIsGenerating(true);
    toast.info('Gerando contrato PDF...');

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Contrato_${selectedClient.nome_completo.replace(/\s+/g, '_')}_${trip.title}.pdf`);
      toast.success('Contrato gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF do contrato.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-zinc-500">Carregando gerador...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      
      {/* ── SIDEBAR DE SELEÇÃO ── */}
      <div className="space-y-4">
        <Card className="p-6 rounded-[2rem] border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3 text-vj-txt">
            <Users size={16} />
            <h3 className="font-bold">Selecione o Cliente</h3>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {!clients?.length && <p className="text-xs text-zinc-500 text-center py-4">Nenhum cliente no grupo.</p>}
            {clients?.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm hover:scale-[1.02] ${
                  selectedClientId === c.id 
                    ? 'border-vj-blue bg-vj-blue/5 text-vj-blue font-bold' 
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                {c.nome_completo}
              </button>
            ))}
          </div>
        </Card>

        {selectedClient && (
          <Button 
            className="w-full gap-2 h-12 rounded-xl text-md font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)]" 
            size="lg" 
            onClick={generatePDF} 
            disabled={isGenerating}
          >
            {isGenerating ? 'Gerando...' : <><Download size={16}/> Baixar PDF</>}
          </Button>
        )}
      </div>

      {/* ── VISUALIZADOR DO CONTRATO ── */}
      <div className="overflow-x-auto bg-zinc-100 p-8 rounded-xl border border-zinc-200 flex justify-center">
        {!selectedClient ? (
          <div className="text-center py-24 text-zinc-400">
            <FileSignature size={48} className="mx-auto mb-4 opacity-50" />
            <p>Selecione um cliente para visualizar e gerar o contrato.</p>
          </div>
        ) : (
          <div 
            ref={contractRef}
            className="bg-white p-12 shadow-md"
            style={{ width: '210mm', minHeight: '297mm', color: '#000' }}
          >
            {/* CABEÇALHO DO CONTRATO */}
            <div className="text-center border-b-2 border-black pb-6 mb-6">
              <h1 className="font-bold text-xl uppercase mb-2">Contrato de Prestação de Serviços de Turismo</h1>
              <h2 className="font-semibold text-lg">{trip?.title}</h2>
              <p className="text-sm">Destino: {trip?.destination}</p>
            </div>

            {/* DADOS DAS PARTES */}
            <div className="space-y-4 mb-8 text-sm">
              <p>
                <strong>CONTRATADA (AGÊNCIA):</strong> {organization?.name}, CNPJ: {organization?.cnpj || '___.___.___/____-__'}, com sede em {organization?.address ? (organization.address as any).city : '_________'}, doravante denominada simplesmente CONTRATADA.
              </p>
              <p>
                <strong>CONTRATANTE (CLIENTE):</strong> {selectedClient.nome_completo}, CPF: {selectedClient.cpf || '___.___.___-__'}, RG: {selectedClient.rg || '___________'}, nascido(a) em {selectedClient.nascimento ? new Date(selectedClient.nascimento).toLocaleDateString('pt-BR') : '__/__/____'}, doravante denominado simplesmente CONTRATANTE.
              </p>
            </div>

            {/* OBJETO E VALORES */}
            <div className="mb-8 text-sm space-y-2">
              <h3 className="font-bold uppercase border-b border-zinc-200 pb-1 mb-2">1. Objeto e Valores</h3>
              <p>A CONTRATADA compromete-se a fornecer o pacote de viagem descrito, pelo valor total de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedClient.valor_total || 0)}</strong>.</p>
              <p>Sendo pago da seguinte forma:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Entrada: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedClient.valor_entrada || 0)}</li>
                <li>Restante: Parcelado em {selectedClient.max_parcelas - 1}x sem juros no carnê (boleto/PIX).</li>
              </ul>
            </div>

            {/* CLÁUSULAS T1-T9 */}
            <div className="space-y-4 text-xs text-justify leading-relaxed">
              <h3 className="font-bold uppercase text-sm mb-2">2. Condições Gerais (Metodologia)</h3>
              
              <p><strong>T1 - Natureza do Serviço:</strong> A CONTRATADA é uma Agência de Turismo e não uma Instituição Financeira. O parcelamento oferecido é um acordo comercial de recebimento programado, sem cobrança de juros compostos de financiamento.</p>
              
              <p><strong>T2 - Política de Pagamento e Inadimplência:</strong> O não pagamento de qualquer parcela em até 60 (sessenta) dias após o vencimento caracterizará quebra de contrato por parte do CONTRATANTE, gerando o CANCELAMENTO AUTOMÁTICO da viagem, sem necessidade de notificação judicial ou extrajudicial.</p>
              
              <p><strong>T3 - Prazo Máximo de Quitação:</strong> O pacote de viagem deve estar 100% (cem por cento) quitado em até 65 (sessenta e cinco) dias ANTES da data do embarque (D-65). Caso não esteja, a viagem será cancelada e o valor retido conforme cláusula de penalidade.</p>
              
              <p><strong>T4 - Viagem Flexível:</strong> {selectedClient.produto_flexivel ? 'O CONTRATANTE optou pela Viagem Flexível, possuindo regras diferenciadas de remarcação conforme anexo.' : 'O CONTRATANTE NÃO optou pelo produto Viagem Flexível. Tarifas não reembolsáveis serão aplicadas integralmente.'}</p>
              
              <p><strong>T5 - Penalidades (Cancelamento):</strong> Em caso de cancelamento por inadimplência ou vontade do CONTRATANTE, a CONTRATADA reterá o percentual de 20% (vinte por cento) do valor total do contrato a título de taxas administrativas, além de todas as multas cobradas pelos fornecedores (companhias aéreas, hotéis), que podem chegar a 100% do valor.</p>
              
              <p><strong>T6 - Fornecedores:</strong> A CONTRATADA atua como intermediária. As políticas de bagagem, horários de voos e regras de hospedagem são de inteira responsabilidade e deliberação exclusiva dos fornecedores terceiros.</p>
              
              <p><strong>T7 - Política de Crédito:</strong> Valores retidos a favor do CONTRATANTE após as multas não serão devolvidos em espécie (dinheiro/PIX), sendo convertidos EXCLUSIVAMENTE em carta de crédito nominal, intransferível, válida por 12 meses.</p>
              
              <p><strong>T8 - Proteção Antifraude:</strong> O CONTRATANTE reconhece a prestação do serviço de intermediação no ato da assinatura. Contestações indevidas (chargeback) em pagamentos virtuais serão tratadas como fraude processual, sujeitas a cobrança judicial acrescida de honorários.</p>
              
              <p><strong>T9 - Formação do Grupo:</strong> O presente pacote é atrelado à formação mínima do grupo. Caso o grupo não atinja o mínimo estipulado, a CONTRATADA reserva-se o direito de cancelar a operação com até 30 dias de antecedência, restituindo integralmente os valores pagos.</p>
            </div>

            {/* ASSINATURAS */}
            <div className="mt-24 grid grid-cols-2 gap-12 text-center text-sm">
              <div>
                <div className="border-t border-black pt-2">
                  <strong>{organization?.name}</strong><br/>
                  CONTRATADA
                </div>
              </div>
              <div>
                <div className="border-t border-black pt-2">
                  <strong>{selectedClient.nome_completo}</strong><br/>
                  CONTRATANTE<br/>
                  CPF: {selectedClient.cpf || '_________________'}
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-xs text-zinc-400">
              Gerado pelo sistema OMEGA • {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
