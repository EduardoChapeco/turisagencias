import { useParams } from 'react-router-dom';
import { Calendar, FileText, Plane } from 'lucide-react';
import { usePortalTrip } from '@/hooks/usePortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PortalTripDetail() {
  const { org_slug, id } = useParams<{ org_slug: string; id: string }>();
  const { data, isLoading } = usePortalTrip(org_slug, id);

  if (isLoading) {
    return <div className="min-h-screen bg-muted/30 px-4 py-8 text-sm text-muted-foreground">Carregando viagem...</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-muted/30 px-4 py-8 text-sm text-muted-foreground">Viagem não encontrada.</div>;
  }

  const { organization, trip } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className="px-4 py-8 text-center text-white"
        style={{ backgroundColor: organization.primary_color || '#1E3A5F' }}
      >
        <h1 className="font-heading text-2xl font-bold">{trip.title}</h1>
        <p className="mt-2 text-sm text-white/80">{organization.name}</p>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Resumo</span>
              <Badge variant="secondary">{trip.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Destino</p>
              <p className="font-medium">{[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino em definição'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datas</p>
              <p className="font-medium">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : '--'} → {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR') : '--'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hotel</p>
              <p className="font-medium">{trip.hotel_name || 'Pendente'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regime</p>
              <p className="font-medium">{trip.hotel_regime || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5" /> Voos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!trip.trip_flights?.length && <p className="text-sm text-muted-foreground">Nenhum voo disponível ainda.</p>}
            {trip.trip_flights?.map((flight) => (
              <div key={flight.id} className="rounded-md border p-3">
                <p className="font-medium">{flight.airline_name || 'Companhia'} {flight.flight_number || ''}</p>
                <p className="text-sm text-muted-foreground">{[flight.origin_city, flight.destination_city].filter(Boolean).join(' → ')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {flight.departure_datetime ? new Date(flight.departure_datetime).toLocaleString('pt-BR') : 'Horário pendente'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!trip.trip_documents?.length && <p className="text-sm text-muted-foreground">Nenhum documento visível disponível.</p>}
            {trip.trip_documents?.map((document) => (
              <a key={document.id} href={document.file_url} target="_blank" rel="noreferrer" className="block rounded-md border p-3 hover:bg-muted">
                <p className="font-medium">{document.title}</p>
                <p className="text-sm text-muted-foreground">{document.doc_type}</p>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Viajantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!trip.trip_travelers?.length && <p className="text-sm text-muted-foreground">Nenhum viajante vinculado disponível.</p>}
            {trip.trip_travelers?.map((traveler) => (
              <div key={traveler.id} className="rounded-md border p-3">
                <p className="font-medium">{traveler.travelers?.full_name || 'Viajante'}</p>
                <p className="text-sm text-muted-foreground">{traveler.ticket_number || 'Sem bilhete'} • {traveler.seat_number || 'Sem assento'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
