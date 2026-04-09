import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { usePortalOrganization, usePortalTrips } from '@/hooks/usePortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PortalHome() {
  const navigate = useNavigate();
  const { org_slug } = useParams<{ org_slug: string }>();
  const { data: organization } = usePortalOrganization(org_slug);
  const { data: trips, isLoading } = usePortalTrips(org_slug);

  return (
    <div className="min-h-screen bg-muted/30">
      <div
        className="px-4 py-8 text-center text-white"
        style={{ backgroundColor: organization?.primary_color || '#1E3A5F' }}
      >
        <h1 className="font-heading text-2xl font-bold">{organization?.name || 'Portal do Cliente'}</h1>
        <p className="mt-2 text-sm text-white/80">Suas próximas viagens, documentos e voos em um só lugar.</p>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div>
          <h2 className="font-heading text-xl font-semibold">Minhas viagens</h2>
          <p className="text-sm text-muted-foreground">Confira o resumo da sua próxima viagem e acesse os documentos disponíveis.</p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando viagens...</p>
        ) : !trips?.length ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma viagem disponível para este login.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/portal/${org_slug}/trip/${trip.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3">
                    <span>{trip.title}</span>
                    <Badge variant="secondary">{trip.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {[trip.destination_city, trip.destination_country].filter(Boolean).join(', ')}</p>
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : '--'} → {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR') : '--'}</p>
                  <p>{trip.trip_documents?.length || 0} documento(s) visível(is)</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
