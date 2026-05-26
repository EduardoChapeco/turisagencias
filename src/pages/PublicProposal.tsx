import { useParams } from 'react-router-dom';
import { usePublicProposal } from '@/hooks/useProposals';
import { 
  Loader2, Globe, Calendar, CheckCircle, AlertTriangle, 
  MessageSquare, FileText, Phone, Building, Info, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

export default function PublicProposal() {
  const { token } = useParams<{ token: string }>();

  // 1. Carregar a proposta pública
  const { data: proposal, isLoading, error } = usePublicProposal(token || '');

  // 2. Carregar informações da agência correspondente (via org_id)
  const { data: agency } = useQuery({
    queryKey: ['public-proposal-agency', proposal?.org_id],
    queryFn: async () => {
      if (!proposal?.org_id) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', proposal.org_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposal?.org_id
  });

  // 3. Atualizar status para 'viewed' (Visualizado pelo cliente)
  useEffect(() => {
    if (proposal && proposal.id && proposal.status === 'sent') {
      const updateStatus = async () => {
        await supabase
          .from('proposals')
          .update({ status: 'viewed' })
          .eq('id', proposal.id);
      };
      updateStatus();
    }
  }, [proposal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-vj-green animate-spin" />
          <p className="text-sm font-semibold text-zinc-400">Montando proposta personalizada...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold">Proposta Comercial não localizada</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">Esta proposta pode ter sido arquivada, cancelada ou o link está incorreto. Por favor, consulte sua agência de viagens.</p>
      </div>
    );
  }

  // Blocos estruturados
  const blocks = proposal.content_schema || [];

  // Criar mensagem do WhatsApp para o consultor da agência
  const whatsappNumber = agency?.phone || '554999999999'; // Default
  const whatsappMessage = `Olá, ${agency?.name || 'agência'}! Recebi a proposta "${proposal.title}" para ${proposal.destination || 'destino'} e gostaria de prosseguir com a reserva!`;
  const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      {/* Estilos específicos de impressão para PDF/A4 */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          /* Ajustar layout da proposta para largura total do papel */
          .max-w-3xl, .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Impedir quebra de blocos no meio da página */
          .card, .bento-card, .pricing-card, [role="region"], section, tr, li, p, .p-6, .p-8 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        @page {
          size: A4;
          margin: 1.5cm;
        }
      `}</style>

      <div className="min-h-screen bg-zinc-50 pb-20 font-sans text-zinc-800">
        
        {/* Top Floating CTA Bar */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-zinc-100 py-3.5 px-4 sticky top-0 z-50 border-vj-border no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {agency?.logo_url ? (
              <img src={agency.logo_url} className="h-8 w-auto object-contain shrink-0" alt="Logo" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-vj-green/10 flex items-center justify-center shrink-0">
                <Building className="w-4.5 h-4.5 text-vj-green" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-black text-zinc-900 leading-none truncate">{agency?.name || 'Sua Agência'}</p>
              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 truncate">{proposal.destination || 'Viagem Selecionada'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs font-bold gap-1 border-zinc-200"
              onClick={() => window.print()}
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button 
              size="sm" 
              className="bg-vj-green text-white hover:bg-vj-green/90 text-xs font-bold gap-1.5"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="w-3.5 h-3.5" /> Reservar
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main WebView Frame */}
      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Renderização de blocos do content_schema */}
        {blocks.map((b: any, index: number) => {
          return (
            <div key={b.id || index} className="space-y-4">
              
              {/* Capa Premium (HERO) */}
              {b.type === 'hero' && (
                <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-zinc-950 flex items-end p-8 text-white border border-zinc-900">
                  {b.settings?.image_url ? (
                    <img 
                      src={b.settings.image_url} 
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                      alt="Capa" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-vj-green/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] px-2.5 py-1 bg-vj-green/20 border border-vj-green/30 text-vj-green rounded-full">
                      Proposta Comercial
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      {b.settings?.title || 'Sua Próxima Viagem'}
                    </h1>
                    <p className="text-sm sm:text-base font-medium text-zinc-300">
                      {b.settings?.subtitle || 'Preparamos um roteiro exclusivo com hospedagem, aéreo e passeios.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Roteiro Diário (ITINERARY) */}
              {b.type === 'itinerary' && (
                <Card className="rounded-2xl border-zinc-200 bg-white overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-vj-green" /> {b.name || 'Cronograma e Roteiro Diário'}
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="relative border-l border-zinc-200 ml-3 pl-6 space-y-6">
                      {b.settings?.days?.map((d: any, idx: number) => (
                        <div key={idx} className="relative space-y-1">
                          <span className="absolute -left-[35px] top-0.5 h-6.5 w-6.5 rounded-full bg-vj-green text-white font-bold text-xs flex items-center justify-center border-4 border-white">
                            {d.day}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-900 leading-snug">{d.title}</h4>
                          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-0.5">{d.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hospedagem (HOTEL) */}
              {b.type === 'hotel' && (
                <Card className="rounded-2xl border-zinc-200 bg-white overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                      🏨 {b.name || 'Hospedagem Recomendada'}
                    </h3>
                  </div>
                  <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {b.settings?.hotels?.map((h: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-150 bg-zinc-50/50 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <p className="font-bold text-sm text-zinc-900 leading-snug">{h.name}</p>
                          <div className="text-amber-500 text-xs font-semibold">
                            {'★'.repeat(h.stars || 4)}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                          {h.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Voos (FLIGHT) */}
              {b.type === 'flight' && (
                <Card className="rounded-2xl border-zinc-200 bg-white overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                      ✈️ {b.name || 'Malha Aérea Sugerida'}
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    {b.settings?.flights?.map((f: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-150 bg-zinc-50 flex items-center justify-between gap-4 flex-wrap text-xs font-medium">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[10px] font-bold text-indigo-700 bg-indigo-50/30 border-indigo-150">{f.cabin}</Badge>
                          <p className="font-bold text-sm text-zinc-900">{f.airline}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Embarque</p>
                          <p className="font-bold text-zinc-800">{f.from}</p>
                          <p className="text-[10px] text-zinc-500">{f.departure}</p>
                        </div>
                        <div className="h-px bg-zinc-200 flex-1 min-w-[20px] relative">
                          <div className="absolute right-0 -top-1 w-2.5 h-2.5 border-t-2 border-r-2 border-zinc-400 rotate-45" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Destino</p>
                          <p className="font-bold text-zinc-800">{f.to}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Voo</p>
                          <p className="font-bold text-zinc-800">{f.code}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Preços e Condições (PRICING) */}
              {b.type === 'pricing' && (
                <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-850 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-vj-green/5 blur-[50px] pointer-events-none" />
                  <div className="flex justify-between items-baseline gap-4 flex-wrap border-b border-zinc-800 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-vj-green">{b.name || 'Investimento e Condições'}</h3>
                      <p className="text-xs text-zinc-400 mt-1">Valores expressos por pessoa em acomodação compartilhada.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl sm:text-3xl font-black text-vj-green">
                        {b.settings?.currency || 'BRL'} {b.settings?.price ? new Intl.NumberFormat('pt-BR').format(b.settings.price) : '0,00'}
                      </p>
                    </div>
                  </div>
                  
                  {b.settings?.installments && (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-1.5">
                      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Formas de Pagamento:</p>
                      <p className="text-xs text-zinc-300 leading-snug whitespace-pre-wrap">{b.settings.installments}</p>
                    </div>
                  )}

                  {b.settings?.notes && (
                    <p className="text-[10px] text-zinc-500 leading-normal flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0 text-zinc-600 mt-0.5" />
                      <span>{b.settings.notes}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Inclusões (INCLUSIONS) */}
              {b.type === 'inclusions' && (
                <Card className="rounded-2xl border-zinc-200 bg-white overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-vj-green" /> {b.name || 'O Que Está Incluso'}
                    </h3>
                  </div>
                  <CardContent className="p-6">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {b.settings?.items?.map((item: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-center text-xs sm:text-sm text-zinc-700 font-semibold">
                          <CheckCircle className="w-4.5 h-4.5 text-vj-green shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Não Incluso (EXCLUSIONS) */}
              {b.type === 'exclusions' && (
                <Card className="rounded-2xl border-zinc-200 bg-white overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2 text-rose-700">
                      ⚠️ {b.name || 'O Que Não Está Incluso'}
                    </h3>
                  </div>
                  <CardContent className="p-6">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {b.settings?.items?.map((item: string, idx: number) => (
                        <li key={idx} className="flex gap-2.5 items-center text-xs sm:text-sm text-zinc-600 font-medium">
                          <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            </div>
          );
        })}

        {/* WebView Footer (Agency info) */}
        <div className="pt-10 border-t border-zinc-200 text-center space-y-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Atendimento e Suporte</span>
            <h4 className="font-bold text-zinc-900 text-base">{agency?.name || 'Sua Agência'}</h4>
            {agency?.phone && (
              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {agency.phone}
              </p>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
            Feito com <Heart className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" /> pela plataforma Turis Agências
          </p>
        </div>

      </div>
    </div>
    </>
  );
}
