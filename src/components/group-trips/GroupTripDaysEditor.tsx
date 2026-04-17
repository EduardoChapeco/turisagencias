import { useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupTripDays, useUpsertGroupTripDay, useDeleteGroupTripDay, type GroupTripDay } from '@/hooks/useGroupTrips';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { useToast } from '@/hooks/use-toast';

interface Props {
  tripId: string;
}

export function GroupTripDaysEditor({ tripId }: Props) {
  const { data: days, isLoading } = useGroupTripDays(tripId);
  const upsert = useUpsertGroupTripDay();
  const remove = useDeleteGroupTripDay();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<GroupTripDay> | null>(null);

  const openNew = () => {
    const next = (days?.length || 0) + 1;
    setEditing({ group_trip_id: tripId, day_number: next, title: `Dia ${next}`, description_md: '', media: [], highlights: [] });
  };

  const handleSave = async () => {
    if (!editing) return;
    await upsert.mutateAsync(editing as any);
    toast({ title: 'Dia salvo' });
    setEditing(null);
  };

  if (isLoading) {
    return <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-vj-r" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-vj-txt">Dia a dia da viagem</h3>
        <Button size="sm" onClick={openNew} className="gap-2"><Plus size={14} /> Adicionar dia</Button>
      </div>

      {!days?.length ? (
        <EmptyState
          icon={ImageIcon}
          title="Nenhum dia cadastrado"
          description="Adicione dias com fotos, vídeos e descrições para encantar quem visitar a página."
          action={<Button onClick={openNew}>Criar primeiro dia</Button>}
        />
      ) : (
        <div className="space-y-3">
          {days.map(day => (
            <div key={day.id} className="surface-card p-4 flex gap-3 items-start">
              <div className="h-9 w-9 rounded-full bg-vj-green text-white font-bold flex items-center justify-center text-xs shrink-0">
                {day.day_number}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-vj-txt truncate">{day.title || `Dia ${day.day_number}`}</h4>
                {day.description_md && <p className="text-xs text-vj-txt3 line-clamp-2 mt-1">{day.description_md}</p>}
                <div className="flex items-center gap-3 mt-2 text-[11px] text-vj-txt3">
                  <span className="flex items-center gap-1"><ImageIcon size={11} /> {(day.media || []).filter(m => m.type !== 'video').length}</span>
                  <span className="flex items-center gap-1"><Video size={11} /> {(day.media || []).filter(m => m.type === 'video').length}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditing(day)}>Editar</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => { if (confirm('Remover este dia?')) remove.mutate({ id: day.id, tripId }); }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="surface-card p-4 space-y-4 border-vj-green/30">
          <h4 className="font-heading font-semibold text-vj-txt">{editing.id ? 'Editar dia' : 'Novo dia'}</h4>
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div>
              <Label>Nº do dia</Label>
              <Input type="number" min={1} value={editing.day_number || 1}
                onChange={e => setEditing({ ...editing, day_number: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Título</Label>
              <Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })}
                placeholder="Ex: Chegada e city tour" />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea rows={4} value={editing.description_md || ''}
              onChange={e => setEditing({ ...editing, description_md: e.target.value })}
              placeholder="O que acontece nesse dia..." />
          </div>
          <div>
            <Label>Fotos & vídeos</Label>
            <MediaUploader
              bucket="group-trip-media"
              folder={`days/${tripId}`}
              accept="image/*,video/*"
              existingUrls={(editing.media || []).map(m => m.url)}
              onUploadComplete={(urls) => {
                const media = urls.map(url => ({
                  url,
                  type: url.match(/\.(mp4|webm|mov)$/i) ? 'video' as const : 'image' as const,
                }));
                setEditing({ ...editing, media });
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-vj-border">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? 'Salvando...' : 'Salvar dia'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
