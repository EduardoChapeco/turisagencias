import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useCreateHotel } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function HotelNew() {
  const navigate = useNavigate();
  const createHotel = useCreateHotel();
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    country: 'Brasil',
    category: '',
    description: '',
    regime_options: '',
    tags: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Novo Hotel</h1>
          <p className="text-sm text-muted-foreground">Cadastre um hotel no banco interno da agência.</p>
        </div>

        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const hotel = await createHotel.mutateAsync({
              name: form.name,
              city: form.city,
              state: form.state || null,
              country: form.country,
              category: form.category ? Number(form.category) : null,
              description: form.description || null,
              regime_options: form.regime_options ? form.regime_options.split(',').map((item) => item.trim()) : [],
              tags: form.tags ? form.tags.split(',').map((item) => item.trim()) : [],
            });
            navigate(`/hotels/${hotel.id}`);
          }}
        >
          <Card>
            <CardHeader><CardTitle>Dados do hotel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={form.state} onChange={(e) => update('state', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input value={form.country} onChange={(e) => update('country', e.target.value)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input type="number" min="1" max="5" value={form.category} onChange={(e) => update('category', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Regimes</Label>
                  <Input value={form.regime_options} onChange={(e) => update('regime_options', e.target.value)} placeholder="all inclusive, breakfast" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="família, praia, casal" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/hotels')}>Cancelar</Button>
            <Button type="submit" disabled={createHotel.isPending}>{createHotel.isPending ? 'Salvando...' : 'Criar hotel'}</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
