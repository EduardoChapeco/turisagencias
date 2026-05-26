import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plane, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Download, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const AIRLINE_NAMES: Record<string, string> = {
  'LA': 'LATAM Airlines',
  'G3': 'GOL Linhas Aéreas',
  'AD': 'Azul Linhas Aéreas',
  'TP': 'TAP Air Portugal',
};

export default function TravelerCheckinPortal() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkResult, setLinkResult] = useState<any>(null);
  const [portalData, setPortalData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch real trip data on mount
  useEffect(() => {
    async function loadPortalData() {
      if (!token) {
        setError("Token de acesso inválido ou ausente.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error: funcError } = await supabase.functions.invoke('boarding-get-portal-data', {
          body: { token }
        });

        if (funcError) throw new Error(funcError.message);
        setPortalData(data);
      } catch (err: any) {
        setError(err.message || "Não foi possível carregar os dados de embarque. Verifique o link e tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadPortalData();
  }, [token]);

  const handleGenerateLink = async () => {
    if (!token || !portalData) return;
    setGeneratingLink(true);
    setLinkResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('airline-build-action-link', {
        body: {
          token,
          airline_iata: portalData.tripData.airlineIata || portalData.tripData.airlineName,
          link_type: 'checkin',
          payload: {
            orderId: portalData.tripData.flightLocator,
            lastName: portalData.tripData.clientName.split(' ').pop() || 'SILVA',
            booking_reference: portalData.tripData.flightLocator
          }
        }
      });

      if (error) throw new Error(error.message);
      setLinkResult(data);
    } catch (err: any) {
      alert("Erro ao conectar com a companhia: " + err.message);
    } finally {
      setGeneratingLink(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-slate-400 text-sm font-medium">Carregando central de embarque segura...</p>
      </div>
    );
  }

  if (error || !portalData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 text-center border border-slate-700 shadow-xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">Falha na Autenticação</h1>
          <p className="text-slate-300 text-sm">{error || "Token inválido ou expirado."}</p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { tripData, checkinStatus, boardingPasses } = portalData;

  const isCheckinAvailable = ['available', 'opened', 'boarding_pass_attached', 'sent_to_client'].includes(checkinStatus.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex flex-col items-center p-4 pb-12 antialiased">
      <div className="w-full max-w-md space-y-6 mt-6">
        
        {/* Top security banner */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-800/30 py-1.5 px-3 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> Portal Criptografado & Seguro (LGPD)
        </div>

        {/* Hero Card */}
        <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-2xl border border-indigo-500/20 shadow-2xl overflow-hidden p-6">
          <Plane className="w-36 h-36 absolute -right-6 -bottom-6 opacity-[0.03] text-indigo-400 transform -rotate-12" />
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mb-1">Olá, {tripData.clientName}</p>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">Sua viagem para <span className="text-indigo-300">{tripData.destination}</span></h1>
              {tripData.packageName && (
                <p className="text-slate-400 text-xs mt-1">{tripData.packageName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Localizador (PNR)</p>
                <p className="text-xl font-mono font-bold text-white tracking-wide">{tripData.flightLocator || "---"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Companhia Aérea</p>
                <p className="text-lg font-semibold text-slate-200">
                  {AIRLINE_NAMES[tripData.airlineIata] || tripData.airlineName || "---"}
                </p>
              </div>
            </div>

            {(tripData.checkInDate || tripData.checkInTime) && (
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-400">Embarque:</span>
                <span className="text-sm font-semibold text-indigo-200">
                  {tripData.checkInDate ? new Date(tripData.checkInDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  {tripData.checkInTime ? ` às ${tripData.checkInTime}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Checkin Status Indicator */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Status do Check-in</h3>
          
          {isCheckinAvailable ? (
            <div className="flex items-start gap-3 p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-400 text-sm">Check-in Liberado!</p>
                <p className="opacity-90">A companhia aérea já abriu o check-in online para o seu voo. Você pode fazer o processo clicando no botão abaixo.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-400 text-sm">Check-in Indisponível no Momento</p>
                <p className="opacity-90">
                  {checkinStatus.reason || "O check-in online geralmente abre de 48h a 72h antes do voo. Fique atento aos prazos!"}
                </p>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            {!linkResult ? (
              <Button 
                onClick={handleGenerateLink} 
                disabled={generatingLink || !isCheckinAvailable || !tripData.airlineName}
                className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-950/50 transition-all rounded-xl">
                {generatingLink ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Buscando link oficial da {tripData.airlineName}...
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5 mr-2 shrink-0" />
                    Iniciar Check-in Online
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-950/30 text-indigo-300 rounded-xl text-xs border border-indigo-500/20 text-center">
                  Link seguro gerado com sucesso! Clique para ir ao site oficial já preenchido.
                </div>
                <a href={linkResult.url} target="_blank" rel="noreferrer" className="block w-full">
                  <Button className="w-full h-14 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center">
                    Ir para Site da Companhia <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Boarding Passes / Files (Signed URL) */}
        {boardingPasses && boardingPasses.length > 0 && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Seus Cartões de Embarque
            </h3>
            <p className="text-xs text-slate-400">
              Seus documentos de embarque oficiais já foram anexados e estão prontos para download seguro.
            </p>

            <div className="space-y-3">
              {boardingPasses.map((pass: any) => (
                <div 
                  key={pass.id} 
                  className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors rounded-xl gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-950/60 text-indigo-400 flex items-center justify-center rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{pass.file_name || "Cartao_de_Embarque.pdf"}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{pass.mime_type || "Documento PDF"}</p>
                    </div>
                  </div>
                  {pass.signedUrl ? (
                    <a 
                      href={pass.signedUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      download={pass.file_name || "Passagem"}
                      className="shrink-0">
                      <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-800 h-9 w-9 p-0 rounded-lg">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-medium">Link pendente</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help section */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            Dúvidas ou problemas? Entre em contato com seu agente de viagens.
          </p>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-[10px] text-slate-600 text-center font-mono">
            Operado de forma 100% segura através do sistema Turis Agências.
          </div>
        </div>
        
      </div>
    </div>
  );
}
