import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useHotel } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function HotelDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: hotel } = useHotel(id);

  if (!hotel) {
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Hotel não encontrado.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hotels')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{hotel.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Detalhes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {hotel.category && <Badge>{hotel.category} estrelas</Badge>}
            {hotel.description && <p className="text-sm leading-6">{hotel.description}</p>}
            {!!hotel.regime_options?.length && (
              <div className="flex flex-wrap gap-2">
                {hotel.regime_options.map((option) => <Badge key={option} variant="secondary">{option}</Badge>)}
              </div>
            )}
            {!!hotel.tags?.length && (
              <div className="flex flex-wrap gap-2">
                {hotel.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
