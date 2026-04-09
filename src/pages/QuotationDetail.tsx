import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useQuotation, useUpdateQuotation } from '@/hooks/useQuotations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, ExternalLink, Send, MapPin, Hotel, Calendar, DollarSign } from 'lucide-react';
import { parseInstallments } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  draft: 'Rascunho', sent: 'Enviada', viewed: 'Visualizada', accepted: 'Aceita', expired: 'Expirada',
};
const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive', half_board: 'Meia Pensão', bed_breakfast: 'Café da Manhã', room_only: 'Só Hospedagem',
};

export default function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(id);
  const updateQuotation = useUpdateQuotation();
  const { toast } = useToast();

  const copyWhatsApp = () => {
    if (quotation?.whatsapp_text) {
      navigator.clipboard.writeText(quotation.whatsapp_text);
      toast({ title: 'Texto copiado!' });
    }
  };

  const copyPublicLink = () => {
    if (quotation?.share_token) {
      navigator.clipboard.writeText(`${window.location.origin}/q/${quotation.share_token}`);
      toast({ title: 'Link da página pública copiado!' });
    }
  };

  const markAsSent = async () => {
    if (!id) return;
    await updateQuotation.mutateAsync({ id, status: 'sent' });
  };

  const formatCurrency = (value: number | null, currency = 'BRL') => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const installments = parseInstallments(quotation?.installments);

  if (isLoading) {
    return <AppLayout><div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div></AppLayout>;
  }

  if (!quotation) {
    return <AppLayout><div className="text-center py-12"><p className="text-muted-foreground">Cotação não encontrada.</p></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold">{quotation.destination || 'Cotação'}</h1>
            <p className="text-sm text-muted-foreground">
              Criada em {new Date(quotation.created_at).toLocaleDateString('pt-BR')}
              {quotation.viewed_at && ` • Vista em ${new Date(quotation.viewed_at).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
          <Badge>{statusLabels[quotation.status] || quotation.status}</Badge>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {quotation.whatsapp_text && (
            <Button variant="outline" onClick={copyWhatsApp}>
              <Copy className="mr-2 h-4 w-4" /> Copiar Texto WhatsApp
            </Button>
          )}
          <Button variant="outline" onClick={copyPublicLink}>
            <ExternalLink className="mr-2 h-4 w-4" /> Copiar Link Público
          </Button>
          {quotation.status === 'draft' && (
            <Button onClick={markAsSent}>
              <Send className="mr-2 h-4 w-4" /> Marcar como Enviada
            </Button>
          )}
        </div>

        {/* Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Destino</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quotation.destination && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> {quotation.destination}</p>}
              {quotation.hotel_name && <p className="flex items-center gap-2"><Hotel className="h-4 w-4 text-muted-foreground" /> {quotation.hotel_name} {quotation.hotel_stars && `${'⭐'.repeat(quotation.hotel_stars)}`}</p>}
              {quotation.meal_plan && <p>🍽️ {mealLabels[quotation.meal_plan] || quotation.meal_plan}</p>}
              {quotation.room_type && <p>🛏️ {quotation.room_type}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Datas e Valores</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {quotation.check_in && quotation.check_out && (
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(quotation.check_in).toLocaleDateString('pt-BR')} → {new Date(quotation.check_out).toLocaleDateString('pt-BR')}
                  {quotation.num_nights && ` (${quotation.num_nights} noites)`}
                </p>
              )}
              <p className="flex items-center gap-2 text-lg font-bold text-primary">
                <DollarSign className="h-4 w-4" /> {formatCurrency(quotation.total_value, quotation.currency || 'BRL')}
              </p>
              {installments.length > 0 && (
                <div className="space-y-1 text-muted-foreground">
                  {installments.map((inst, i) => (
                    <p key={i}>{inst.type}: {inst.installment_count}x de R$ {inst.value?.toFixed(2)}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp text preview */}
        {quotation.whatsapp_text && (
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Texto WhatsApp</CardTitle></CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">{quotation.whatsapp_text}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
