import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useHotels } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';

export default function Hotels() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: hotels } = useHotels(search || undefined);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Banco de Hotéis</h1>
            <p className="text-sm text-muted-foreground">Catálogo curado de hotéis da agência.</p>
          </div>
          <Button onClick={() => navigate('/hotels/new')}>
            <Plus className="mr-2 h-4 w-4" /> Novo hotel
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar hotel..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotels?.map((hotel) => (
            <Card key={hotel.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/hotels/${hotel.id}`)}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <span>{hotel.name}</span>
                  {hotel.category && <Badge variant="secondary">{hotel.category}★</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}</p>
                {!!hotel.tags?.length && (
                  <div className="flex flex-wrap gap-2">
                    {hotel.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!hotels?.length && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nenhum hotel cadastrado ainda.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
