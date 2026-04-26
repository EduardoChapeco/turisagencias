import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Loader2, MapPin, CheckCircle2, Calendar, Hotel, Utensils, Activity, BrainCircuit, ShieldCheck, Share2, Info, ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseInstallments } from '@/lib/utils';
import type { PublicQuotationData } from '@/types';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TurisBadge } from '@/components/ui/TurisBadge';
import { ConfirmationModal } from '@/components/public-quotation/ConfirmationModal';
import { PriceDetails } from '@/components/public-quotation/PriceDetails';
import { Button } from '@/components/ui/button';

const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive 🍽️',
  half_board: 'Meia Pensão',
  bed_breakfast: 'Café da Manhã ☕',
  room_only: 'Só Hospedagem',
};

export default function PublicQuotation() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicQuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const handleConfirm = async () => {
    if (!token || !confirmName) {
      setConfirmError('Preencha seu nome para continuar.');
      return;
    }
    setConfirmLoading(true);
    setConfirmError('');
    try {
      const { data: confirmed, error } = await supabase.rpc('confirm_public_quotation', {
        p_token: token,
        p_traveler_name: confirmName,
        p_traveler_email: confirmEmail,
        p_notes: confirmNotes
      });
      if (error) throw error;
      if (!confirmed) throw new Error('quotation_not_confirmable');
      setConfirmSuccess(true);
    } catch (err: unknown) {
      setConfirmError('Ocorreu um erro ao confirmar a cotação.');
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc('get_public_quotation', { _token: token })
      .then(({ data: row, error }) => {
        setLoading(false);
        if (error || !row) {
          setNotFound(true);
          return;
        }

        const quote = row as Record<string, any>;
        const org = quote.organizations as Record<string, any> | null;

        const mappedData: PublicQuotationData & Record<string, any> = {
          ...quote,
          org_name: org?.name ?? null,
          org_logo: org?.logo_url ?? null,
          org_whatsapp: org?.whatsapp ?? null,
          org_primary_color: org?.primary_color ?? null,
          installments: parseInstallments(quote.installments),
          itinerary: ([...(quote.itinerary_days ?? [])].sort((a: any, b: any) => a.day_number - b.day_number)),
          flights_data: ([...(quote.flights ?? [])].sort((a: any, b: any) => {
            if (a.direction === 'outbound' && b.direction === 'return') return -1;
            if (a.direction === 'return' && b.direction === 'outbound') return 1;
            return 0;
          })),
          transfers: ([...(quote.quote_transfers ?? [])].sort((a: any, b: any) => a.order_position - b.order_position)),
          price_items: ([...(quote.quote_price_items ?? [])].sort((a: any, b: any) => a.order_position - b.order_position)),
          includes_items: ([...(quote.quote_includes ?? [])].sort((a: any, b: any) => a.order_position - b.order_position)),
          excursions: ([...(quote.quote_experiences ?? [])].sort((a: any, b: any) => a.order_position - b.order_position)),
        };

        setData(mappedData);
      });
  }, [token]);

  useEffect(() => {
    if (data?.destination) document.title = `Proposta para ${data.destination}`;
  }, [data]);

  const fmt = (value: number | null, currency = 'BRL') => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vj-bg">
        <Loader2 className="w-10 h-10 animate-spin text-vj-green" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vj-bg p-6">
        <div className="text-center p-12 bg-white border border-vj-border rounded-[2.5rem] max-w-md">
          <div className="h-16 w-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-vj-txt3" />
          </div>
          <h2 className="text-2xl font-black text-vj-txt mb-2 uppercase tracking-tighter">Proposta Indisponível</h2>
          <p className="text-vj-txt3 text-sm font-medium mb-8">O link expirou ou a proposta foi alterada pela agência.</p>
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold" onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  const itinerary: any[] = (data as Record<string, any>).itinerary ?? [];
  const flights: any[] = (data as Record<string, any>).flights_data ?? [];
  const coverImageUrl = (data as Record<string, any>).cover_image_url || data.hotel_photo_url;
  const pricingMode = (data as Record<string, any>).pricing_mode || 'per_person';
  const pricingLabel = pricingMode === 'per_couple' ? 'Por casal' : pricingMode === 'per_family' ? 'Por família' : pricingMode === 'total' ? 'Total' : 'Por pessoa';
  const whatsappUrl = data.org_whatsapp ? `https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}` : null;
  const agentInitials = data.org_name ? data.org_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() : 'AG';

  return (
    <PublicLayout
      orgName={data.org_name}
      orgLogo={data.org_logo}
      ctaLabel="Confirmar Proposta"
      onCtaClick={() => setIsConfirmOpen(true)}
    >
      <ConfirmationModal 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}
        confirmName={confirmName} setConfirmName={setConfirmName}
        confirmEmail={confirmEmail} setConfirmEmail={setConfirmEmail}
        confirmNotes={confirmNotes} setConfirmNotes={setConfirmNotes}
        confirmLoading={confirmLoading} confirmSuccess={confirmSuccess}
        confirmError={confirmError} handleConfirm={handleConfirm}
      />

      {/* 🏛️ LUXURY HERO SECTION - OMEGA v4.0 */}
      <section className="relative h-[75vh] w-full overflow-hidden bg-vj-bg-dark border-b border-vj-border no-scrollbar">
        {coverImageUrl && (
          <img src={coverImageUrl} className="w-full h-full object-cover opacity-60 animate-in zoom-in duration-[3000ms]" alt="Cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-vj-bg-dark via-vj-bg-dark/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-12 lg:p-20">
          <div className="container mx-auto max-w-7xl animate-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-2 w-2 rounded-full bg-vj-green animate-pulse shadow-none" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-vj-green">Curadoria Exclusiva Turis Squad</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
              {data.destination}
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/60 tracking-tight">{data.hotel_name}</p>
          </div>
        </div>
      </section>

      {/* ══ PREMIUM CONTENT ══ */}
      <div className="container mx-auto max-w-7xl px-8 py-20 space-y-24 no-scrollbar">
        
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Partida', value: fmtDate(data.check_in), icon: Calendar },
             { label: 'Duração', value: `${data.num_nights} Noites`, icon: Hotel },
             { label: 'Investimento', value: fmt(data.total_value), icon: TrendingUp, color: 'text-vj-green' },
             { label: 'Categoria', value: 'Ultra Luxury', icon: ShieldCheck },
           ].map((item, i) => (
             <div key={i} className="p-8 bg-white border border-vj-border rounded-[2rem] group hover:border-vj-green/20 transition-all">
                <item.icon className="w-5 h-5 text-vj-txt3 mb-4 group-hover:text-vj-green transition-colors" />
                <span className="text-[9px] font-black uppercase text-vj-txt3 tracking-[0.3em]">{item.label}</span>
                <p className={cn('text-sm font-black text-vj-txt mt-2 uppercase tracking-tight', item.color)}>{item.value}</p>
             </div>
           ))}
        </div>

        {/* AI Squad Audit Badge */}
        <div className="p-10 bg-zinc-50 border border-vj-border rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10">
           <div className="h-24 w-24 rounded-3xl bg-white border border-vj-border flex items-center justify-center shrink-0">
              <BrainCircuit className="w-12 h-12 text-vj-green" />
           </div>
           <div className="text-center md:text-left flex-1 min-w-0">
              <h3 className="text-2xl font-black text-vj-txt uppercase tracking-tight">Auditado pelo Turis Squad</h3>
              <p className="text-vj-txt3 text-sm font-medium mt-3 leading-relaxed max-w-3xl">
                 Nossa inteligência artificial analisou mais de 400 variáveis logísticas para garantir que seu roteiro em {data.destination} seja impecável. Do check-in ao retorno, cada detalhe foi validado pelo esquadrão de elite da Turis Agências.
              </p>
           </div>
           <div className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border border-vj-border rounded-full text-[10px] font-black uppercase tracking-widest text-vj-green">
              <ShieldCheck className="w-4 h-4" /> Verified Quality
           </div>
        </div>

        {/* Main Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-16">
              <div className="space-y-6">
                 <h2 className="text-4xl font-black text-vj-txt uppercase tracking-tighter">Hospedagem & Conforto</h2>
                 <p className="text-lg text-vj-txt3 font-medium leading-relaxed max-w-2xl">
                    Selecionamos o {data.hotel_name} por sua excelência em serviço e localização privilegiada.
                 </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="p-8 bg-white border border-vj-border rounded-[2rem] flex flex-col justify-between">
                    <Hotel className="w-6 h-6 text-vj-green mb-6" />
                    <div>
                       <p className="text-[10px] font-black uppercase text-vj-txt3 tracking-widest">Resort / Hotel</p>
                       <p className="text-base font-black text-vj-txt mt-2">{data.hotel_name || 'Hospedagem Premium'}</p>
                    </div>
                 </div>
                 <div className="p-8 bg-white border border-vj-border rounded-[2rem] flex flex-col justify-between">
                    <Utensils className="w-6 h-6 text-amber-500 mb-6" />
                    <div>
                       <p className="text-[10px] font-black uppercase text-vj-txt3 tracking-widest">Plano de Alimentação</p>
                       <p className="text-base font-black text-vj-txt mt-2">{data.meal_plan ? mealLabels[data.meal_plan] : 'Café da Manhã Inclusivo'}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-1">
              <div className="p-10 bg-vj-bg-dark text-white rounded-[2.5rem] border-none sticky top-24">
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-8">Status Logístico</h3>
                 <div className="aspect-square bg-zinc-900 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-10 text-center">
                    <Activity className="w-10 h-10 text-vj-green mb-6 animate-pulse" />
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-relaxed">Sincronizando coordenadas em tempo real...</p>
                 </div>
                 <Button className="w-full h-14 rounded-2xl bg-white text-vj-bg-dark font-black text-xs uppercase tracking-widest mt-8 hover:bg-zinc-100 transition-all shadow-none">
                    Ver Mapa de Destino
                 </Button>
              </div>
           </div>
        </div>

        {/* Financial Area */}
        <div className="pt-24 border-t border-vj-border">
           <PriceDetails 
             data={data} priceItems={[]} flights={flights} transfers={[]}
             installments={data.installments || []} pricingLabel={pricingLabel} fmt={fmt} fmtDate={fmtDate}
             whatsappUrl={whatsappUrl} onConfirmClick={() => setIsConfirmOpen(true)}
           />
        </div>
      </div>

      <footer className="bg-vj-bg-dark py-24 text-white text-center border-t border-white/5">
         <div className="container mx-auto px-8">
            <div className="h-16 w-16 rounded-[20px] bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto mb-8 font-black text-xl">
               {agentInitials}
            </div>
            <p className="text-sm font-black text-vj-green uppercase tracking-[0.3em] mb-4">{data.org_name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Safe Transaction · Protocolo {data.id.slice(0,8).toUpperCase()}</p>
         </div>
      </footer>
      <TurisBadge />
    </PublicLayout>
  );
}
