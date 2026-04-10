import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useHotel, useUpdateHotel, useDeleteHotel } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Star, Tag, Phone, Globe, Trash2, Save, X, BedDouble, Wifi, Coffee, Dumbbell } from 'lucide-react';

const REGIME_OPTIONS = ['Sem Regime', 'Café da Manhã', 'Meia Pensão', 'Pensão Completa', 'All Inclusive', 'Ultra All Inclusive'];
const AMENITY_OPTIONS = ['Wi-Fi', 'Piscina', 'Academia', 'Spa', 'Restaurante', 'Bar', 'Estacionamento', 'Traslado Aeroporto', 'Business Center', 'Beira-Mar', 'Pet Friendly', 'Acessível'];

export default function HotelDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: hotel, isLoading } = useHotel(id);
  const updateHotel = useUpdateHotel?.();
  const deleteHotel = useDeleteHotel?.();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [tagInput, setTagInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [regimeOptions, setRegimeOptions] = useState<string[]>([]);

  const startEdit = () => {
    if (!hotel) return;
    setForm({
      name: hotel.name,
      description: hotel.description || '',
      category: hotel.category || '',
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      country: hotel.country || 'Brasil',
      zip_code: hotel.zip_code || '',
      phone: hotel.phone || '',
      website: hotel.website || '',
      email: hotel.email || '',
      cover_image_url: hotel.cover_image_url || '',
      tags: [...(hotel.tags || [])],
      regime_options: [...(hotel.regime_options || [])],
      amenities: [...((hotel as any).amenities || [])],
    });
    setAmenities([...((hotel as any).amenities || [])]);
    setRegimeOptions([...(hotel.regime_options || [])]);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form || !id || !updateHotel) return;
    await updateHotel.mutateAsync({ id, ...form, amenities, regime_options: regimeOptions });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!id || !deleteHotel) return;
    if (confirm('Remover este hotel do banco? Cotações vinculadas não serão afetadas.')) {
      await deleteHotel.mutateAsync(id);
      navigate('/hotels');
    }
  };

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };
  const toggleRegime = (r: string) => {
    setRegimeOptions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form?.tags?.includes(t)) return;
    setForm((p: any) => ({ ...p, tags: [...(p.tags || []), t] }));
    setTagInput('');
  };
  const removeTag = (t: string) => setForm((p: any) => ({ ...p, tags: p.tags.filter((x: string) => x !== t) }));

  if (isLoading) {
    return <AppLayout><Skeleton className="h-[600px] rounded-2xl" /></AppLayout>;
  }

  if (!hotel) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">Hotel não encontrado.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/hotels')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const displayForm = editing ? form : hotel;
  const stars = Number(hotel.category) || 0;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => navigate('/hotels')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-3xl font-bold text-primary">{hotel.name}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                {[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}
              </p>
              {stars > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={updateHotel?.isPending} className="rounded-xl">
                  <Save className="h-4 w-4 mr-2" />
                  {updateHotel?.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" size="icon" className="rounded-xl" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button onClick={startEdit} className="rounded-xl">Editar Hotel</Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-sm">
            <TabsTrigger value="details"><BedDouble className="h-4 w-4 mr-2" />Detalhes</TabsTrigger>
            <TabsTrigger value="amenities"><Wifi className="h-4 w-4 mr-2" />Comodidades</TabsTrigger>
            <TabsTrigger value="contact"><Phone className="h-4 w-4 mr-2" />Contato</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle>Dados do Estabelecimento</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                {editing ? (
                  <>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Nome</Label>
                      <Input value={form.name} onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria (Estrelas 1-5)</Label>
                      <Input type="number" min="1" max="5" value={form.category} onChange={(e) => setForm((p: any) => ({ ...p, category: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>URL Foto de Capa</Label>
                      <Input value={form.cover_image_url} onChange={(e) => setForm((p: any) => ({ ...p, cover_image_url: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Descrição</Label>
                      <Textarea value={form.description} onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input value={form.city} onChange={(e) => setForm((p: any) => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input value={form.state} onChange={(e) => setForm((p: any) => ({ ...p, state: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input value={form.country} onChange={(e) => setForm((p: any) => ({ ...p, country: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input value={form.zip_code} onChange={(e) => setForm((p: any) => ({ ...p, zip_code: e.target.value }))} />
                    </div>
                  </>
                ) : (
                  <>
                    {hotel.cover_image_url && (
                      <div className="sm:col-span-2 rounded-xl overflow-hidden h-48">
                        <img src={hotel.cover_image_url} alt={hotel.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    {hotel.description && <p className="sm:col-span-2 text-muted-foreground text-sm leading-6">{hotel.description}</p>}
                    {hotel.address && <div><p className="text-xs text-muted-foreground uppercase font-semibold">Endereço</p><p className="text-sm">{hotel.address}</p></div>}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle className="flex items-center gap-2"><Coffee className="h-5 w-5 text-accent" /> Regimes Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {REGIME_OPTIONS.map((r) => (
                      <button key={r} type="button" onClick={() => toggleRegime(r)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${regimeOptions.includes(r) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-muted-foreground hover:border-primary/50'}`}
                      >{r}</button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {!hotel.regime_options?.length && <p className="text-sm text-muted-foreground">Nenhum regime cadastrado.</p>}
                    {hotel.regime_options?.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-accent" /> Tags de Busca</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {editing && (
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Ex: Resort, Luxo, Familiar..." />
                    <Button type="button" variant="outline" onClick={addTag}>+</Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {!displayForm?.tags?.length && <p className="text-sm text-muted-foreground">Nenhuma tag cadastrada.</p>}
                  {(displayForm?.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="gap-1.5">
                      {tag}
                      {editing && <button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-accent" /> Comodidades e Serviços</CardTitle>
                <CardDescription>Marque as facilidades disponíveis no hotel.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {editing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AMENITY_OPTIONS.map((a) => (
                      <button key={a} type="button" onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${amenities.includes(a) ? 'bg-primary/10 text-primary border-primary/40 shadow-sm' : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/30'}`}
                      >
                        <span className={`w-3 h-3 rounded-full border-2 transition-colors ${amenities.includes(a) ? 'bg-primary border-primary' : 'border-muted-foreground/50'}`} />
                        {a}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {!(hotel as any).amenities?.length && <p className="text-sm text-muted-foreground">Nenhuma comodidade cadastrada. Clique em "Editar Hotel" para preencher.</p>}
                    {((hotel as any).amenities || []).map((a: string) => (
                      <Badge key={a} className="gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-foreground/70" />{a}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-surface/50 border-b border-border/30">
                <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-accent" /> Dados de Contato</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={form.phone} onChange={(e) => setForm((p: any) => ({ ...p, phone: e.target.value }))} placeholder="+55 (11) 3333-3333" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Site / Booking</Label>
                      <Input value={form.website} onChange={(e) => setForm((p: any) => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                    </div>
                  </>
                ) : (
                  <>
                    {hotel.phone && <div><p className="text-xs text-muted-foreground uppercase font-semibold">Telefone</p><p className="text-sm">{hotel.phone}</p></div>}
                    {(hotel as any).email && <div><p className="text-xs text-muted-foreground uppercase font-semibold">E-mail</p><p className="text-sm">{(hotel as any).email}</p></div>}
                    {hotel.website && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Site</p>
                        <a href={hotel.website} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline">
                          <Globe className="h-3.5 w-3.5" /> {hotel.website}
                        </a>
                      </div>
                    )}
                    {!hotel.phone && !(hotel as any).email && !hotel.website && (
                      <p className="sm:col-span-2 text-sm text-muted-foreground">Nenhum contato cadastrado. Clique em "Editar Hotel" para adicionar.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
