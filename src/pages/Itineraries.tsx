import { logger } from '@/utils/logger';

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
import { SheetPage } from '@/components/ui/SheetPage';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const ROTEIRO_SECTIONS = [
  { id: 'dados', label: 'Dados do Roteiro', icon: Map },
  { id: 'grupo', label: 'Configurações de Grupo', icon: Users },
];

export default function Itineraries() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { itineraries, isLoading, createItinerary } = useItineraries(profile?.org_id);
  const [isCreating, setIsCreating] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  
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
      setShowSheet(false);
      navigate(`/itineraries/${newItinerary.id}/builder`);
    } catch (e) {
      logger.error(e);
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
            onClick={() => setShowSheet(true)}
            disabled={isCreating}
            className="px-6 gap-2"
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
          <div className="flex flex-col items-center justify-center p-12 lg:p-24 bg-vj-surface border border-vj-border rounded-3xl text-center ">
            <div className="w-20 h-20 bg-vj-green/10 rounded-full flex items-center justify-center mb-6">
              <Map className="h-10 w-10 text-vj-green" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-vj-txt">Nenhum roteiro ainda</h2>
            <p className="text-vj-txt3 mb-8 max-w-md">
              Crie seu primeiro roteiro. Use nossa IA para gerar rotas completas com mapas e dicas.
            </p>
            <Button onClick={() => setShowSheet(true)} disabled={isCreating} className="px-8 gap-2">
              <Plus className="w-5 h-5" /> Começar a Criar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itineraries.map((itinerary) => (
              <Card
                key={itinerary.id}
                className="group overflow-hidden rounded-2xl cursor-pointer hover: transition-shadow border-vj-border hover:border-vj-green/30 bg-vj-surface"
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
                    {(itinerary as Record<string, any>).view_count || 0} views
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SheetPage
        open={showSheet}
        onClose={() => setShowSheet(false)}
        title="Criar Novo Roteiro"
        subtitle="Configure o título e o tipo de roteiro"
        icon={Map}
        sections={ROTEIRO_SECTIONS}
        defaultSection="dados"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setShowSheet(false)}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !title}
              className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
            >
              {isCreating ? 'Criando...' : 'Criar Roteiro e Abrir Editor'}
            </Button>
          </div>
        }
      >
        {(activeSection) => (
          <>
            {activeSection === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Nome do Roteiro *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Viagem Europa 2026"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div>
                    <Label htmlFor="is-group" className="cursor-pointer font-semibold">Este é um Roteiro de Grupo?</Label>
                    <p className="text-xs text-zinc-500 mt-0.5">Ative para configurar vagas e nome de grupo.</p>
                  </div>
                  <Switch
                    id="is-group"
                    checked={isGroup}
                    onCheckedChange={setIsGroup}
                  />
                </div>
              </div>
            )}

            {activeSection === 'grupo' && (
              <div className="space-y-5">
                {!isGroup ? (
                  <div className="p-6 rounded-xl border border-dashed border-zinc-300 text-center text-zinc-500">
                    <Users className="mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm">Ative a opção "Roteiro de Grupo" na aba anterior para configurar aqui.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Nome do Grupo (Comercial)</Label>
                      <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Ex: Grupo Turquia VIP"
                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Total de Vagas</Label>
                      <Input
                        type="number"
                        min="1"
                        value={maxPax}
                        onChange={(e) => setMaxPax(e.target.value)}
                        placeholder="Ex: 25"
                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}
