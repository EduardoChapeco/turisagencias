import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { useItineraries } from '@/hooks/useItineraries';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPin, Plus, Map, Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function Itineraries() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { itineraries, isLoading, createItinerary } = useItineraries(profile?.org_id);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Form State
  const [isGroup, setIsGroup] = useState(false);
  const [title, setTitle] = useState('Novo Roteiro');
  const [groupName, setGroupName] = useState('');
  const [maxPax, setMaxPax] = useState('');

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      const newItinerary = await createItinerary({
        title: title || 'Novo Roteiro',
        is_public: false,
        status: 'draft',
        is_group_itinerary: isGroup,
        group_name: isGroup ? groupName : null,
        max_pax: isGroup && maxPax ? parseInt(maxPax, 10) : null,
      });
      setShowDialog(false);
      navigate(`/itineraries/${newItinerary.id}/builder`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-4 md:py-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-vj-txt flex items-center gap-3">
              <Map className="w-8 h-8 text-vj-green" />
              Roteiros
            </h1>
            <p className="text-vj-txt3 mt-1 text-base">
              Crie roteiros independentes, grupos de viagem e itinerários personalizados com IA.
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            disabled={isCreating}
            className="rounded-full px-6 gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Criando...' : 'Criar Roteiro'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : !itineraries?.length ? (
          <div className="flex flex-col items-center justify-center p-12 lg:p-24 bg-vj-surface border border-vj-border rounded-3xl text-center shadow-sm">
            <div className="w-20 h-20 bg-vj-green/10 rounded-full flex items-center justify-center mb-6">
              <Map className="h-10 w-10 text-vj-green" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-vj-txt">Nenhum roteiro ainda</h2>
            <p className="text-vj-txt3 mb-8 max-w-md">
              Crie seu primeiro roteiro. Use nossa IA para gerar rotas completas com mapas e dicas.
            </p>
            <Button onClick={() => setShowDialog(true)} disabled={isCreating} size="lg" className="rounded-full px-8 gap-2">
              <Plus className="w-5 h-5" /> Começar a Criar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itineraries.map((itinerary) => (
              <Card
                key={itinerary.id}
                className="group overflow-hidden rounded-2xl cursor-pointer hover:shadow-md transition-shadow border-vj-border hover:border-vj-green/30 bg-vj-surface"
                onClick={() => navigate(`/itineraries/${itinerary.id}/builder`)}
              >
                <div className="h-32 bg-vj-bg relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                    🗺️
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
                    {itinerary.is_public ? (
                      <Badge className="bg-emerald-500 border-0 text-white text-[10px] px-2 py-0 uppercase tracking-widest font-bold">
                        PÚBLICO
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/90 text-slate-800 border-0 text-[10px] px-2 py-0 uppercase tracking-widest font-bold">
                        RASCUNHO
                      </Badge>
                    )}
                    {itinerary.is_group_itinerary && (
                      <Badge className="bg-violet-500 border-0 text-white text-[10px] px-2 py-0 uppercase tracking-widest font-bold flex items-center gap-1">
                        <Users className="w-3 h-3" /> GRUPO
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base leading-tight group-hover:text-vj-green transition-colors line-clamp-1 text-vj-txt">
                    {itinerary.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-vj-txt3 mt-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {itinerary.destination || 'Destino não definido'}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-vj-txt3">
                  <span className="flex items-center gap-1 font-medium bg-vj-bg px-2 py-1 rounded-md">
                    <Eye className="w-3.5 h-3.5" />
                    {(itinerary as any).view_count || 0} views
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Roteiro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Nome do Roteiro</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Viagem Europa 2026"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="is-group" className="cursor-pointer">Este é um Roteiro de Grupo?</Label>
              <Switch
                id="is-group"
                checked={isGroup}
                onCheckedChange={setIsGroup}
              />
            </div>
            
            {isGroup && (
              <div className="space-y-4 p-4 border rounded-xl bg-vj-surface mt-2 animate-in fade-in">
                <div className="grid gap-2">
                  <Label htmlFor="group_name">Nome do Grupo (Comercial)</Label>
                  <Input
                    id="group_name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Grupo Turquia VIP"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_pax">Total de Vagas</Label>
                  <Input
                    id="max_pax"
                    type="number"
                    min="1"
                    value={maxPax}
                    onChange={(e) => setMaxPax(e.target.value)}
                    placeholder="Ex: 25"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isCreating || !title}>
              {isCreating ? 'Criando...' : 'Criar Roteiro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
