import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGroupClients } from '@/hooks/useGroupClients';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { useAuthStore } from '@/stores/authStore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FileSignature, Download, Printer, Users } from 'lucide-react';
const FIXED_CLAUSES = [
  { num: 1, text: "O objeto do presente contrato é regulamentar o agenciamento de serviços de viagens e turismo adquiridos pelo CONTRATANTE, intermediados pela CONTRATADA, de acordo com o valor oferecidos pelos prestadores finais de serviço no modo, data e horário da contratação.\nParágrafo único: Estão inclusos neste contrato, exclusivamente os serviços a seguir relacionados e descritos acima.\nOBS: Os serviços contratados foram confirmados através do(s) fornecedor(es), motivo pelo qual o CONTRATANTE assinará uma autorização de débito e verificará na fatura do cartão de crédito o nome da(s) referida(s) empresa(s), caso opte pelo pagamento parcelado no cartão de crédito." },
  { num: 2, text: "Se declara ciente o CONTRATANTE e/ou o passageiro quanto aos serviços especificamente contratados, bem como, aqueles que não estão inclusos no respectivo preço final.\nParágrafo primeiro: Assim, são considerados \"serviços inclusos\" somente aqueles que estiverem expressamente mencionados no programa. Quaisquer informações prestadas verbalmente sobre bagagem, o destino, sugestão de passeios, indicação de serviços, entre outros, NÃO devem ser consideradas inclusas se não estiveram escritas como tal no contrato.\nParágrafo segundo: Fica expressamente consignado que, qualquer cortesia a ser concedida pela empresa ora vendedora, será realizada expressamente no presente contrato.\nParágrafo terceiro: O CONTRATANTE deve informar, no ato da inscrição, e por escrito, eventuais impedimentos ou restrições (doenças crônicas, cardíacos, grávidas, etc.), que embora não os impossibilite em tese de participarem da viagem, importe em cuidados especiais durante a viagem, providência de documentação específica, entre outros; sendo advertido nesse momento da capacidade ou incapacidade de providencia do suporte necessário pelos organizadores." },
  { num: 3, text: "De acordo com a prestação dos serviços relacionados e expressas neste contrato, o CONTRATANTE pagará a CONTRATADA, o valor descrito no campo \"Valor do pacote e forma de pagamento\", supracitado." },
  { num: 4, text: "Recairão exclusivamente sobre o CONTRATANTE as responsabilidades civis, administrativas, judiciais e criminais pertinentes, no caso da caracterização do chargeback fraudulento.\nParágrafo único: Entende-se por chargeback fraudulento, a contestação e cancelamento de uma compra de viagem/serviço turístico realizada com cartão de crédito ou débito junto à CONTRATADA, pelo titular deste, ante o seu não reconhecimento, munido de má-fé, com o intuito de prejudicar a CONTRATADA e seus fornecedores." },
  { num: 5, text: "O cliente CONTRATANTE é responsável pelo integral pagamento da viagem contratada. Caso seja financiamento, a venda somente se concretizará após a pré-aprovação do crédito junto à instituição financeira." },
  { num: 6, text: "Caso solicitado e concedido o parcelamento do preço, o CONTRATANTE que tiver pago a entrada será responsável pela quitação integral do restante do preço orçado para todo o programa de viagem." },
  { num: 7, text: "Pagamentos através de depósito bancário serão processados somente após o recebimento do comprovante de depósito e confirmação do valor em conta corrente. Já pagamentos realizados através de cartão de crédito, somente após a confirmação do fornecedor mediante aprovação da administradora do cartão. Por fim, pagamentos através de boleto bancário, somente após a confirmação do fornecedor." },
  { num: 8, text: "Qualquer pagamento feito pelo (a) CONTRATANTE para a CONTRATADA mesmo sem o contrato estar assinado caracteriza aceitação do roteiro e do contrato de viagem e todas as suas cláusulas e responsabilidades da reserva para sua viagem." },
  { num: 9, text: "O CONTRATANTE declara-se ciente que a CONTRATADA não possui nenhuma ingerência sobre os prestadores finais dos serviços contratados (por ex. cias. aéreas, marítimas, hotéis, operadores, agências receptivas, outros), razão pela qual fica isenta de qualquer responsabilidade quanto a falta de conformidade na execução dos serviços por parte destes prestadores." },
  { num: 10, text: "O CONTRATANTE declara-se ciente que a CONTRATADA atua em seu nome como mandatária, prestando o serviço de consultoria de roteiros turísticos, cotações de hospedagens, cruzeiros ou qualquer outro serviço solicitado pelo CONTRATANTE, e ainda efetuando para este as reservas, confirmações e emissões nos serviços de viagens e turismo conforme sua opção, bem como, posteriores solicitações de alteração e cancelamento, ficando na dependência das regras, condições e valores de seus fornecedores." },
  { num: 11, text: "Quando se tratar de viagem internacional, o CONTRATANTE fica ciente que independente de ser turista, está sobre as leis, normas e costumes do país de destino. Qualquer infração será de sua responsabilidade as penalidades sofridas." },
  { num: 12, text: "Fica expressamente vedado ao CONTRATANTE ceder ou transferir, a qualquer título, salvo mediante autorização expressa da outra parte, os direitos e obrigações estabelecidos neste instrumento." },
  { num: 13, text: "O CONTRATANTE fica incumbido e responsável pela correta apresentação, verificação e confirmação das informações relativas aos seus dados pessoais e cadastrais e pelos demais viajantes nomeados, para quem junto as reservas são feitas, conforme tabela abaixo, quais sejam." },
  { num: 14, text: "O CONTRATANTE é responsável, por si e pelos passageiros que consigo viajarão, independentemente do disposto em outras cláusulas deste contrato, no tocante a: \na) Adimplir a viagem na forma, valor e data acordada entre as partes; \nb) Cumprir rigorosamente todos os horários e procedimentos recomendados pela CONTRATADA; \nc) Conferir minuciosamente todos os serviços adquiridos e inclusos, no ato da compra (voos, traslados, reservas, dentre outros); \nd) Respeitar todas as orientações dadas pelo Guia de Turismo durante a viagem, se acaso houver; \ne) Respeitar e seguir os procedimentos de segurança; \nf) Zelar por todos os objetos pessoais de valores que portar; \ng) Arcar com as perdas e danos decorrentes de ações ou omissões originadas por sua culpa; \nh) Preservar as instalações e equipamentos que estejam a sua disposição durante a viagem; \ni) Responsabilizar-se pelas ações e/ou omissões, danos e/ou prejuízos, causados pelos usuários nos serviços que contratar.\nParágrafo primeiro: No caso de o CONTRATANTE e o PASSAGEIRO não se tratar da mesma pessoa, compromete-se aquele a levar ao conhecimento deste o teor destas Condições Gerais, sendo solidariamente responsável por qualquer ato deste último praticado no âmbito da execução do contrato." },
  { num: 15, text: "É de responsabilidade do CONTRATANTE providenciar, em tempo hábil, toda a documentação necessária e/ou eventualmente exigida, como: passaporte válido, visto, vacinação e autorizações para menores viajantes, de acordo com o destino que escolheu.\nParágrafo único: O CONTRATANTE declara estar ciente que a CONTRATADA e os fornecedores dos serviços mencionados nesse contrato ficam isentos de quaisquer despesas que venham à ocorrer durante a viagem e/ou o não embarque dos passageiros descritos nesse contrato, devido à falta ou irregularidade da documentação mencionada, bem como, por atos de autoridade migratória dos países a serem visitados, não sendo responsável pela recusa no ingresso e pela deportação de passageiros e as despesas daí advindos, não cabendo igualmente nenhuma restituição de valores pagos." },
  { num: 16, text: "O CONTRATANTE, no ato do recebimento de seus vouchers tem a obrigação e responsabilidade de conferir os dados nele contidos, como datas da viagem, nome e sobrenome inserido no bilhete, sob pena de exclusivamente arcar com os prejuízos que eventualmente decorrerem da falta." },
  { num: 17, text: "O CONTRATANTE deverá, anteriormente à assinatura do contrato, se cientificar das condições de desistência, transferências, cancelamentos, solicitação de carta de crédito e no-show (não comparecimento) que constam no contrato de prestação de serviços de cada fornecedor contratado. Reforçamos que qualquer alteração, cancelamento, transferência, solicitação de carta de crédito ou não comparecimento do viajante no dia do embarque, provavelmente acarretarão em multas e cobrança de taxas dos fornecedores dos serviços contratados, conforme contrato dos mesmos, podendo ou não haver reembolsos, conforme condição estipulada por cada fornecedor, não possuindo a CONTRATADA nenhuma ingerência sobre estas condições, razão pela qual fica isenta de qualquer responsabilidade quanto as multas cobradas ou reembolso negado pelos fornecedores dos serviços reservados." },
  { num: 18, text: "Para toda e qualquer alteração, solicitação de carta de crédito ou transferência realizada pelo contratante, além das multas cobradas pelos fornecedores, a CONTRATADA cobrará 5% (cinco por cento) sobre o valor dos serviços contratados, referentes encargos administrativos na prestação do serviço de agenciamento." },
  { num: 19, text: "Só será validado o pedido de cancelamento e alteração, na hipótese em que o CONTRATANTE realizar a solicitação por e-mail ou por escrito via aplicativo de celular WhatsApp, sendo considerada a message recebida apenas com a sua expressa confirmação.\nParágrafo único: Na falta do aceite expresso e/ou pagamento direto do CONTRATANTE para posteriores pedidos de alteração e cancelamento que exijam o pagamento de taxas adicionais, fica este advertido que o serviço não será realizado." },
  { num: 20, text: "Os valores pagos diretamente ao contratado ou repassados pelos fornecedores a título de comissão, não serão reembolsados na hipótese de cancelamento da viagem." },
  { num: 21, text: "Nas viagens aéreas, qualquer alteração que exija a reemissão do bilhete, haverá uma multa determinada pela CIA aérea e/ou seu representante, que deverá ser paga pelo passageiro e/ou CONTRATANTE, cujo valor varia de acordo com cada CIA aérea / representante." },
  { num: 22, text: "A CONTRATADA é uma agência que trabalha com os melhores fornecedores de serviços turísticos no Brasil e no mundo. Qualquer tipo de insatisfação gerada entre expectativa e realidade, é de total responsabilidade do CONTRATANTE." },
  { num: 23, text: "O CONTRATANTE autoriza a CONTRATADA a realizar consultas aos Sistemas de Risco de Crédito e às demais organizações centralizadoras de cadastros e informações privadas ou governamentais (SERASA, SCPC, Bureaus de Cadastros Positivos etc.), sobre eventuais débitos e responsabilidades do mesmo, bem como a prestação aos órgãos citados das informações cadastrais e dados relativos ao parcelamento, tudo em conformidade com o disposto na legislação em vigor." },
  { num: 24, text: "Nos casos de transporte aéreo, no embarque, no curso da viagem, retorno, em que houver cancelamento de voo, atrasos e alterações de quaisquer naturezas, independente dos motivos, a CONTRATADA informa que, os eventuais gastos provenientes decorrentes, quando não assumidos de imediato ou posteriormente pela companhia aérea, correrão por conta do(a) CONTRATANTE, que deverá guardar os recibos e notas que comprovem os gastos para serem cobrados da companhia aérea pertinente no retorno ao Brasil." },
  { num: 25, text: "Se no embarque, curso da viagem ou retorno, por qualquer motivo, haja necessidade de aquisição de novo bilhete aéreo (nacional ou internacional), o valor correspondente será arcado, na hora da aquisição, pelo(a) CONTRATANTE.\nParágrafo único: Em face do constante no caput Cláusula anterior, a CONTRATADA não assume responsabilidades sobre eventuais problemas, perdas ou danos que se originem, quaisquer que sejam os motivos." },
  { num: 26, text: "A CONTRATADA não se responsabiliza por roubos, assaltos ou furtos ocorridos contra o (a) CONTRATANTE durante os dias de viagem, nem por perda ou furtos de documentos dentro ou fora dos hotéis, bem como nos deslocamentos." },
  { num: 27, text: "Os custos de todo e qualquer deslocamento particular durante a viagem, fora do roteiro programado, por qualquer que seja o motivo, ficará a cargo do CONTRATANTE." },
  { num: 28, text: "O CONTRATANTE declara que se certificou, por meio de pesquisa prévia, que os serviços escolhidos atendem suas necessidades em termos de structure e localização. Durante a viagem, caso a CONTRATANTE altere as reservas de Hotéis, altere a categoria do quarto, contrate guia de turismo a parte ou transfer/taxi ou qualquer serviço por conta própria será de sua total responsabilidade os custos." },
  { num: 29, text: "É de responsabilidade da CONTRATADA a fiel emissão de todos os serviços incluídos neste pacote, tal como ajustados neste contrato, ressalvadas as hipóteses de imprevistos oriundos de caso fortuito e força maior e/ou que ocorram com as empresas especializadas na execução dos mesmos (transporte terrestre, alimentação, hospedagem etc.)." },
  { num: 30, text: "O cancelamento ou alterações do roteiro por motivos de caso fortuito ou força-maior (guerras, epidemias, pandemia, eventos naturais ou climáticos adversos, greves, manifestações, convulsões sociais, etc.), e os prejuízos de qualquer natureza advindos de tais fatos, não são de responsabilidade da CONTRATADA.\nParágrafo único: Havendo quaisquer alterações na programação da viagem, por força maior ou caso fortuito, afetando parcial ou totalmente qualquer item da viagem, a Contratada comunicará por escrito o Contratante, quando da entrega dos documentos da viagem e respectivas passagens." },
  { num: 31, text: "A CONTRATADA não se responsabiliza, não garante e não intercede pela permanência, tampouco pelo não ingresso do turista em país estrangeiro, haja vista que se insere no poder abrangido pela soberania de um Estado, poder este de natureza discricionária, independente que o passageiro se encontre apto com a documentação, não lhe sendo ressarcido nenhum valor pago." },
  { num: 32, text: "O CONTRATANTE autoriza expressamente a CONTRATADA a manter arquivo de seus dados pessoais e de pagamento, bem como dos demais passageiros que consigo viajarão, e ainda, o compartilhamento destes dados com todos os fornecedores envolvidos na prestação dos serviços aqui contratados, pelo prazo mínimo de 05 anos. O CONTRATANTE anui também com o recebimento de informativos e material de marketing da CONTRATADA e demais fornecedores, ficando o CONTRATANTE incumbido de solicitar a exclusão definitiva das informações diretamente à cada prestador de serviço envolvido findando-se o referido prazo." },
  { num: 33, text: "O bilhete de passagem aéreo é a expressão do contrato de transporte aéreo, firmado entre a CIA de transporte e o passageiro. Portanto, qualquer solicitação de alteração de data, cancelamento ou solicitação de reembolso, o CONTRATANTE estará sujeito as normas estabelecidas exclusivamente pela própria Cia Aérea fornecedora, em relação a eventuais taxas, multas e prazos." },
  { num: 34, text: "No caso de atraso no horário previsto para o voo, fica previamente estabelecido que a responsabilidade será única e exclusivamente da companhia aérea em questão, de acordo com as normas internacionais (Convenção de Varsóvia) e/ou o Código Brasileiro de Aeronáutica.\nParágrafo único: O serviço de traslado/receptivo é contratado para esperar até 60 minutos após o horário de chegada do voo. Atrasos do voo, demora na imigração ou na localização das bagagens podem extrapolar esse tempo. Nesse caso o serviço poderá não ser realizado, sem direito a reembolso." },
  { num: 35, text: "O transportador aéreo não poderá retardar o voo para aguardar passageiros que, por acaso, fiquem retidos por autoridades fiscais ou policiais para verificação ou formalização de alguma medida administrativa ou judicial; sendo que se tais eventos ocorrerem, a CONTRATADA fica isenta de quaisquer responsabilidades." },
  { num: 36, text: "A eventual solicitação de cadastro, cartão e milhagem é de responsabilidade única e exclusiva do (a) CONTRATANTE." },
  { num: 37, text: "Algumas alterações podem ocorrer nos voos previstos, como mudança de horários, nas rotas e/ou conexões (tanto na ida como na volta), nos equipamentos, podendo passar de voo fretado para regular ou vice-versa, inclusive nos aeroportos de destino, que poderão mudar para aeroportos alternativos. Se por motivos técnicos ou operacionais, e ainda, por motivos decorrentes das condições do tempo, o voo não se iniciar, aplicar-se-ão, as disposições legais pertinentes. A Contratada, portanto, não se responsabiliza por esses eventuais contratempos na execução dos serviços prestados pelas empresas aéreas, principalmente no que tange a alteração dos horários e dias dos voos escolhidos e comprados pelo Contratante. Quando não for possível o pouso da aeronave no aeroporto de destino, por fechamento ou impedimento, a aeronave pousará em outro, ocorrendo o traslado por transporte rodoviário. O voo fretado não permite aproveitamento, desdobramento, transferência, reembolso de trecho não voado ou prolongamento de trecho, devido as condições especiais de contratação entre a Contratada e a empresa transportadora. Quando fretado, o voo não deve ser utilizado para a realização de negócios, passeios ou visitas fora do roteiro da parte terrestre, pois as datas e horários, tanto de chegada como de partida, podem ser alterados. Se o passageiro, contrariamente assim proceder, assume o risco de sua opção." },
  { num: 38, text: "O transporte da bagagem será feito de acordo com os regulamentos e critérios da companhia aérea, que deverão ser consultados previamente pelo CONTRATANTE no site da empresa. Qualquer taxa extra, referente a excesso de peso de bagagem será de responsabilidade única e exclusiva do (a) CONTRATANTE." },
  { num: 39, text: "Alguns aeroportos internacionais não autorizam excesso de bagagem, portanto, fica desde já ciente o (a) CONTRATANTE que nestes casos, será obrigatória a retirada de itens de sua bagagem, podendo acarretar perda dos mesmos. E quando permitir o eventual pagamento de excesso de peso de bagagem, este será por conta do passageiro." },
  { num: 40, text: "A bagagem e demais pertences pessoais do (a) CONTRATANTE não são objetos deste contrato. A CONTRATADA não se responsabiliza pela perda, roubo, extravio, furtos, violação, rodinhas quebradas, alças quebradas, rasgos em malas, zíper quebrado, ou quaisquer outros danos que as bagagens e pertences pessoais do (a) CONTRATANTE venham a sofrer no transcurso da viagem, por qualquer que seja a cause, incluindo sua manipulação pela (s) companhia (s) aérea (s), pelos carregadores de malas em hotéis e motoristas de ônibus." },
  { num: 41, text: "Não estão incluídos carregadores de malas, à título de exemplo, em portos, aeroportos, fronteiras ou estação de trens e transbordo em geral." },
  { num: 42, text: "No caso de extravio de bagagem, o custo de transporte do Hotel ao Aeroporto para retirada da mala extraviada ou para soluções pertinentes a essa ocorrência, bem como a compra de itens primordiais para suprir a falta da bagagem, a CONTRATANTE deverá arcar com os valores, guardar os recibos para depois em seu retorno solicitar a Cia Aérea ou ao Seguro Viagem os reembolsos conforme apólice, esse se acaso tiver contratado previamente tal serviço." },
  { num: 43, text: "A Franquia de Bagagem será conforme estipulado pela Cia Aérea ou contratado pelo CONTRATANTE no ato da emissão do bilhete eletrônico. O peso /quantidade de mala despachada e de mão deve ser verificado antes do embarque. O CONTRATANTE que adquirir bilhetes eletrônicos sem franquia de bagagem deverá fazer a compra com antecedência no site da Cia Aérea ou diretamente no dia do check in, de acordo com o peso/quantidade embarcado." },
  { num: 44, text: "O CONTRATANTE declara estar ciente e de acordo com os voos selecionados e apresentados pela agência, inclusive quanto às datas e horários, tendo sido informado sobre a possibilidade de imprevistos que podem ocorrer em viagens realizadas no mesmo dia de compromissos importantes. Ainda assim, optou, de forma consciente, por manter os voos conforme propostos, assumindo total responsabilidade por eventuais consequências decorrentes de atrasos, cancelamentos ou outros contratempos que possam comprometer a chegada ao destino em tempo hábil." },
  { num: 45, text: "Sem prejuízo das demais disposições contidas neste instrumento, o presente Contrato também poderá ser rescindido, pela CONTRATADA ou pelo(a) CONTRATANTE pelo descumprimento total ou parcial, de quaisquer de suas cláusulas e condições deste contrato." },
  { num: 46, text: "Este contrato ficará rescindido a partir do momento em que qualquer das partes fizer comunicação por escrito da desistência, recaindo a partir daí todas as obrigações pendentes.\nPARÁGRAFO ÚNICO: As solicitações de cancelamento realizadas dentro do prazo de 24 horas após a emissão terão multa de cancelamento estipulada em 14%, após esse prazo, seguem as regras das operadoras e consolidadoras." },
  { num: 47, text: "Desistência após o início da viagem, qualquer que o fato determinante ou etapa da viagem em que ocorrer a desistência da viagem, não haverá nenhuma redução do preço com relação a parte não utilizada, e tampouco será concedido reembolso em absoluto." },
  { num: 48, text: "Quando sobrevier o cancelamento da viagem a pedido do CONTRATANTE, independente do motivo, serão devidas todas as multas estipuladas pelos fornecedores dos serviços contratados. Dessa forma, frisa-se, a Operadora responsável efetuará, à agência de viagem contratada e ao contratante, o cálculo do reembolso devido, excluindo-se o valor da comissão da agência de viagem, bem como eventuais taxas administrativas.\nParágrafo Primeiro: Para solicitações de cancelamento que aconteçam com antecedência superior à 24horas em relação ao embarque, será cobrado pela CONTRATADA, à título de multa, o importe de 20% do valor do contrato, acrescido de eventuais multas estabelecidas pelos prestadores dos serviços contratados. Destaca-se ainda que, pelo trabalho de intermediação integralmente prestado, ora emitindo e ora solicitando o cancelamento dos serviços, a comissão paga à agência de viagens também não será reembolsada ao CONTRATANTE.\nParágrafo segundo: Para solicitações de cancelamentos que aconteçam com antecedência inferior à 24h do horário previsto para embarque, ou ainda, em eventual ocorrência de NO-SHOW (não apresentação do passageiro para embarque), não haverá reembolso de quaisquer valores, por qualquer motivo que seja." },
  { num: 49, text: "Para dirimir qualquer dúvida proveniente do presente contrato, as partes de comum acordo, elegem o foro da comarca de Chapecó (SC) renunciando a qualquer outro por mais privilegiado que seja, para dirimir dúvidas do presente, cientes de todo o pactuado, firmado em duas vias, na presença de testemunhas." }
];

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

            {/* CLÁUSULAS PÉTREAS */}
            <div className="space-y-4 text-xs text-justify leading-relaxed">
              <h3 className="font-bold uppercase text-sm mb-2">2. Condições Gerais (Cláusulas)</h3>
              
              {FIXED_CLAUSES.map(clause => (
                <p key={clause.num}>
                  <strong>Cláusula {clause.num}:</strong> {clause.text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                </p>
              ))}
            </div>

            {/* ASSINATURAS */}
            <div className="mt-24 grid grid-cols-2 gap-12 text-center text-sm" style={{ pageBreakInside: 'avoid' }}>
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
