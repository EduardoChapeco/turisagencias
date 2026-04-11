import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, DollarSign, Hotel, Loader2, MapPin, Plane, CheckCircle2, MessageSquare, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseInstallments } from '@/lib/utils';
import type { PublicQuotationData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid';
import { PublicLayout } from '@/components/layout/PublicLayout';

const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive',
  half_board: 'Meia Pensão',
  bed_breakfast: 'Café da Manhã',
  room_only: 'Só Hospedagem',
};

export default function PublicQuotation() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicQuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;

    supabase.rpc('get_public_quotation', { _token: token }).then(({ data: rows, error }) => {
      const row = rows?.[0] ?? null;
      setLoading(false);

      if (error || !row) {
        setNotFound(true);
        return;
      }

      setData({ ...row, installments: parseInstallments(row.installments) });
    });
  }, [token]);

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cb-s0">
        <Loader2 className="h-8 w-8 animate-spin text-cb-accent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cb-s0 px-4">
        <div className="text-center p-8 bg-cb-s1 rounded-cb-lg border border-cb-border max-w-sm">
           <MapPin className="h-10 w-10 text-cb-muted mx-auto mb-4" />
           <p className="text-lg font-bold text-cb-text">Cotação não encontrada</p>
           <p className="text-sm text-cb-muted mt-2">O link desta cotação pode estar expirado, inválido ou a proposta já foi fechada.</p>
        </div>
      </div>
    );
  }

  const installments = data.installments;
  const whatsappUrl = data.org_whatsapp
    ? `https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Gostaria de conversar sobre a cotação para ${data.destination || 'a viagem'}.`)}`
    : null;

  return (
    <PublicLayout 
      orgName={data.org_name} 
      orgLogo={data.org_logo} 
      orgPrimaryColor={data.org_primary_color}
      orgWhatsapp={data.org_whatsapp}
    >
      <div className="mb-8">
        <h2 className="text-3xl md:text-5xl font-extrabold text-cb-text tracking-tight mb-2 flex items-center gap-3">
          <Plane className="h-8 w-8 text-cb-accent rotate-45" /> Proposta de Viagem
        </h2>
        <p className="text-lg md:text-xl text-cb-muted">
          Preparamos esta cotação exclusiva. Todas as taxas já estão incluídas no valor final.
        </p>
      </div>

      <BentoGrid cols={3} gap="lg">
        {/* Capa e Destination (2 colunas) */}
        <BentoCell colSpan={2} rowSpan={2} padding="none" className="flex flex-col relative overflow-hidden group">
          {data.hotel_photo_url ? (
            <img src={data.hotel_photo_url} alt={data.hotel_name || 'Hotel'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-cb-s2 flex items-center justify-center">
               <MapPin className="h-16 w-16 text-cb-muted" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-24 text-white">
            {data.destination && (
              <h3 className="font-heading text-3xl font-bold flex items-center gap-2 mb-2 drop-shadow-md">
                <MapPin className="h-6 w-6" /> {data.destination}
              </h3>
            )}
            {data.hotel_name && (
              <div className="flex items-center gap-3 text-white/90">
                <Hotel className="h-5 w-5" />
                <span className="font-medium text-lg">{data.hotel_name}</span>
                {data.hotel_stars && <span className="text-yellow-400">{'★'.repeat(data.hotel_stars)}</span>}
              </div>
            )}
          </div>
        </BentoCell>

        {/* Pricing & CTA */}
        <BentoCell colSpan={1} rowSpan={1} padding="lg" className="border-cb-accent/20 bg-cb-accent/5 flex flex-col items-center justify-center text-center">
           <h4 className="text-sm font-bold text-cb-muted uppercase tracking-wider mb-2">Valor Total</h4>
           <div className="flex items-baseline gap-1 text-cb-text">
             <DollarSign className="h-6 w-6 text-cb-accent" />
             <span className="text-4xl lg:text-5xl font-extrabold">{formatCurrency(data.total_value, data.currency || 'BRL').replace(/^R\$\s*/, '')}</span>
           </div>
           
           {installments && installments.length > 0 && (
             <div className="mt-4 w-full space-y-2">
                <p className="text-xs text-cb-muted uppercase font-bold text-left mb-1">Opções de Pagamento</p>
                {installments.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm bg-cb-s0 border border-cb-border py-1.5 px-3 rounded text-cb-text shadow-sm">
                    <span className="font-medium">{item.type}</span>
                    <span>{item.installment_count}x de R$ {item.value?.toFixed(2)}</span>
                  </div>
                ))}
             </div>
           )}

           {whatsappUrl && (
             <Button className="w-full mt-6 shadow-lg shadow-cb-accent/20 text-white" size="lg" onClick={() => window.open(whatsappUrl, '_blank')}>
               <MessageSquare className="mr-2 h-5 w-5" /> Falar com o Agente
             </Button>
           )}
        </BentoCell>

        {/* Informações Básicas */}
        <BentoCell colSpan={1} rowSpan={1} padding="lg">
           <h4 className="font-bold flex items-center gap-2 text-cb-text mb-4">
             <Briefcase className="h-4 w-4 text-cb-muted" /> O que está incluído
           </h4>
           <div className="space-y-4">
              {data.check_in && data.check_out && (
                <div>
                   <p className="text-[10px] uppercase tracking-wide font-bold text-cb-muted">Período da Viagem</p>
                   <p className="text-sm font-medium mt-1">
                     {new Date(data.check_in).toLocaleDateString('pt-BR')} até {new Date(data.check_out).toLocaleDateString('pt-BR')}  
                   </p>
                   {data.num_nights && <span className="text-xs text-cb-muted">{data.num_nights} noites no destino</span>}
                </div>
              )}
              {data.meal_plan && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide font-bold text-cb-muted">Regime de Alimentação</p>
                  <p className="text-sm font-medium mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-cb-success" />
                    {mealLabels[data.meal_plan] || data.meal_plan}
                  </p>
                </div>
              )}
           </div>
        </BentoCell>
      </BentoGrid>
      
      <div className="mt-8 text-center bg-cb-s1 border border-cb-border p-4 rounded-cb-md text-xs text-cb-muted">
         Proposta gerada através da plataforma CloudBlock OS. Os valores e disponibilidade estão sujeitos a alteração até o momento formal da emissão.
      </div>
    </PublicLayout>
  );
}
