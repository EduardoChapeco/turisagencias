import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Plus } from 'lucide-react';

export default function Trips() {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useTrips();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Viagens</h1>
            <p className="text-sm text-muted-foreground">Workspace central das viagens da agência.</p>
          </div>
          <Button onClick={() => navigate('/trips/new')}>
            <Plus className="mr-2 h-4 w-4" /> Nova viagem
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : !trips?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Plane className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium">Nenhuma viagem cadastrada</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Crie a primeira viagem para começar a organizar voos, documentos e viajantes.
              </p>
              <Button onClick={() => navigate('/trips/new')}>Criar primeira viagem</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/trips/${trip.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3 text-lg">
                    <span>{trip.title}</span>
                    <Badge variant="secondary">{trip.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino não definido'}</p>
                  <p>
                    {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : '--'}
                    {' → '}
                    {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR') : '--'}
                  </p>
                  <p>{trip.hotel_name || 'Hotel pendente'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
