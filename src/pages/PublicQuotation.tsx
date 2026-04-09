import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Hotel, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { parseInstallments } from '@/lib/utils';
import type { PublicQuotationData } from '@/types';

const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive', half_board: 'Meia Pensão', bed_breakfast: 'Café da Manhã', room_only: 'Só Hospedagem',
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
      } else {
        setData(row);
      }
    });
  }, [token]);

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-lg font-medium">Cotação não encontrada</p>
            <p className="text-sm text-muted-foreground">O link pode estar expirado ou inválido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const whatsappUrl = data.org_whatsapp
    ? `https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Tenho interesse na cotação para ${data.destination || 'a viagem'}.`)}`
    : null;
  const installments = parseInstallments(data.installments);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with org branding */}
      <div className="bg-primary text-primary-foreground px-4 py-6 text-center" style={data.org_primary_color ? { backgroundColor: data.org_primary_color } : undefined}>
        {data.org_logo && <img src={data.org_logo} alt={data.org_name || ''} className="h-12 mx-auto mb-2" />}
        <h1 className="font-heading text-xl font-bold">{data.org_name}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 -mt-4">
        {/* Hotel photo */}
        {data.hotel_photo_url && (
          <img src={data.hotel_photo_url} alt={data.hotel_name || ''} className="w-full h-48 object-cover rounded-lg shadow" />
        )}

        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              {data.destination && (
                <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" /> {data.destination}
                </h2>
              )}
              {data.hotel_name && (
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Hotel className="h-4 w-4" /> {data.hotel_name}
                  {data.hotel_stars && ` ${'⭐'.repeat(data.hotel_stars)}`}
                </p>
              )}
            </div>

            {data.check_in && data.check_out && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(data.check_in).toLocaleDateString('pt-BR')} → {new Date(data.check_out).toLocaleDateString('pt-BR')}</span>
                {data.num_nights && <Badge variant="secondary">{data.num_nights} noites</Badge>}
              </div>
            )}

            {data.meal_plan && (
              <p className="text-sm">🍽️ {mealLabels[data.meal_plan] || data.meal_plan}</p>
            )}

            <div className="border-t pt-4">
              <p className="text-3xl font-bold font-heading text-primary flex items-center gap-2">
                <DollarSign className="h-6 w-6" /> {formatCurrency(data.total_value, data.currency || 'BRL')}
              </p>
              {installments.length > 0 && (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {installments.map((inst, i) => (
                    <p key={i}>💳 {inst.type}: {inst.installment_count}x de R$ {inst.value?.toFixed(2)}</p>
                  ))}
                </div>
              )}
            </div>

            {whatsappUrl && (
              <Button asChild className="w-full bg-success text-success-foreground hover:bg-success/90" size="lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  💬 Quero reservar!
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Cotação gerada por {data.org_name}
        </p>
      </div>
    </div>
  );
}
