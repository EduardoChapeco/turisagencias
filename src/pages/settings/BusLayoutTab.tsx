import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bus, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusLayouts, useCreateBusLayout, useDeleteBusLayout } from '@/hooks/useBusLayouts';
import { BusSeatMap } from '@/components/group-trips/BusSeatMap';

export function BusLayoutTab() {
  const { data: layouts, isLoading } = useBusLayouts();
  const create = useCreateBusLayout();
  const remove = useDeleteBusLayout();

  const [form, setForm] = useState({
    name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '',
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await create.mutateAsync(form);
    setForm({ name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '' });
  };

  const vehicleEmoji: Record<string, string> = {
    bus: '🚌', van: '🚐', plane: '✈️', boat: '⛵',
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Create form */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-4 w-4 text-vj-green" /> Novo Layout de Ônibus
          </CardTitle>
          <CardDescription>
            Defina a configuração de assentos gerada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome do layout *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Comil Campione 45 lugares" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Tipo de veículo</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm mt-1"
              value={form.vehicle_type}
              onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
            >
              <option value="bus">🚌 Ônibus</option>
              <option value="van">🚐 Van</option>
              <option value="plane">✈️ Avião</option>
              <option value="boat">⛵ Barco</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fileiras</Label>
              <Input type="number" min={3} max={20} value={form.rows}
                onChange={e => setForm(p => ({ ...p, rows: Number(e.target.value) }))}
                className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Colunas (sem corredor)</Label>
              <Input type="number" min={2} max={6} value={form.cols}
                onChange={e => setForm(p => ({ ...p, cols: Number(e.target.value) }))}
                className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label>Notas internas</Label>
            <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Ex: Ônibus da Cooperativa Sul" className="rounded-xl mt-1" />
          </div>
          <p className="text-xs text-zinc-400">
            Layout com corredor central gerado automaticamente.
            Aprox. {(form.rows - 1) * (form.cols - 1)} assentos + WC.
          </p>
          <Button className="w-full" onClick={handleCreate} disabled={!form.name.trim() || create.isPending}>
            {create.isPending ? 'Criando...' : <><Plus size={14} className="mr-1" /> Criar Layout</>}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">Layouts cadastrados</h3>
        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : !layouts?.length ? (
          <Card className="premium-card">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bus size={36} className="text-zinc-200 mb-2" />
              <p className="text-sm text-zinc-400">Nenhum layout criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          layouts.map(layout => (
            <Card key={layout.id} className="premium-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{vehicleEmoji[layout.vehicle_type] ?? '🚌'}</span>
                    {layout.name}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg"
                      onClick={() => setPreview(preview === layout.id ? null : layout.id)}>
                      {preview === layout.id ? 'Ocultar' : 'Preview'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                      onClick={() => { if (confirm('Remover layout?')) remove.mutate(layout.id); }}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-zinc-400">
                  {layout.rows} fileiras × {layout.cols} colunas · {layout.vehicle_type}
                </p>
                {layout.notes && <p className="text-xs text-zinc-500 mt-0.5">{layout.notes}</p>}
                {preview === layout.id && layout.seat_map && (
                  <div className="mt-4 overflow-x-auto">
                    <BusSeatMap
                      layout={{ rows: layout.rows, cols: layout.cols, seat_map: layout.seat_map }}
                      occupied={[]}
                      selected={[]}
                      maxSelect={0}
                      onSelect={() => {}}
                      readOnly
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
