import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MapPin, Calendar, ExternalLink, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LazyImage } from '@/components/ui/LazyImage';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupTrips, useCreateGroupTrip, useDeleteGroupTrip, useUpdateGroupTrip } from '@/hooks/useGroupTrips';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetPage } from '@/components/ui/SheetPage';
import { Textarea } from '@/components/ui/textarea';
import { GroupTripDaysEditor } from '@/components/group-trips/GroupTripDaysEditor';

export default function GroupTrips() {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useGroupTrips();
  const create = useCreateGroupTrip();
  const update = useUpdateGroupTrip();
  const remove = useDeleteGroupTrip();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', destination: '', origin_city: '',
    departure_date: '', return_date: '', price_per_pax: 0, max_pax: 40,
    installments_count: 1, description_md: '', cover_image_url: '',
  });

  const openNew = () => {
    setEditing('new');
    setForm({
      title: '', subtitle: '', destination: '', origin_city: '',
      departure_date: '', return_date: '', price_per_pax: 0, max_pax: 40,
      installments_count: 1, description_md: '', cover_image_url: '',
    });
  };

  const openEdit = (id: string) => {
    const t = trips?.find(x => x.id === id);
    if (!t) return;
    setEditing(id);
    setForm({
      title: t.title || '',
      subtitle: t.subtitle || '',
      destination: t.destination || '',
      origin_city: t.origin_city || '',
      departure_date: t.departure_date || '',
      return_date: t.return_date || '',
      price_per_pax: Number(t.price_per_pax) || 0,
      max_pax: t.max_pax || 40,
      installments_count: t.installments_count || 1,
      description_md: t.description_md || '',
      cover_image_url: t.cover_image_url || '',
    });
  };

  const handleSave = async () => {
    const payload: any = {
      ...form,
      price_per_pax: Number(form.price_per_pax),
      max_pax: Number(form.max_pax),
      installments_count: Number(form.installments_count),
    };
    if (!payload.departure_date) delete payload.departure_date;
    if (!payload.return_date) delete payload.return_date;

    if (editing === 'new') {
      await create.mutateAsync(payload);
    } else if (editing) {
      await update.mutateAsync({ id: editing, ...payload });
    }
    setEditing(null);
  };

  const togglePublish = async (id: string, currentlyPublic: boolean) => {
    await update.mutateAsync({
      id,
      is_public: !currentlyPublic,
      status: !currentlyPublic ? 'published' : 'draft',
    } as any);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Grupos Terrestres"
        description="Pacotes de viagem em grupo com página pública compartilhável"
        actions={
          <Button onClick={openNew} className="gap-2">
            <Plus size={16} /> Novo Pacote
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-vj-r" />)}
        </div>
      ) : !trips?.length ? (
        <EmptyState
          icon={Users}
          title="Nenhum pacote criado"
          description="Crie pacotes de viagem em grupo, defina o roteiro e compartilhe uma página pública para receber reservas."
          action={<Button onClick={openNew}>Criar primeiro pacote</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(t => (
            <div key={t.id} className="surface-card overflow-hidden group hover:border-vj-border2 transition-colors">
              <div className="aspect-[16/10] bg-vj-bg relative">
                {t.cover_image_url ? (
                  <LazyImage src={t.cover_image_url} alt={t.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-vj-txt3">
                    <MapPin size={48} className="opacity-30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    t.is_public && t.status === 'published'
                      ? 'tag-green' : 'tag-gray'
                  }`}>
                    {t.is_public && t.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base text-vj-txt truncate">{t.title}</h3>
                  {t.subtitle && <p className="text-xs text-vj-txt3 truncate">{t.subtitle}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-vj-txt3">
                  {t.destination && <span className="flex items-center gap-1"><MapPin size={12} /> {t.destination}</span>}
                  {t.departure_date && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(t.departure_date).toLocaleDateString('pt-BR')}</span>}
                  <span className="flex items-center gap-1"><Users size={12} /> {t.current_pax}/{t.max_pax}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-vj-border">
                  <div>
                    <p className="text-[10px] text-vj-txt3 uppercase tracking-wider">Por pessoa</p>
                    <p className="text-sm font-bold text-vj-txt">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: t.currency || 'BRL' }).format(Number(t.price_per_pax))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.slug && t.is_public && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver página pública"
                        onClick={() => window.open(`/g/${t.slug}`, '_blank')}>
                        <ExternalLink size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={() => openEdit(t.id)}>
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Excluir"
                      onClick={() => { if (confirm('Excluir pacote?')) remove.mutate(t.id); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <Button
                  variant={t.is_public ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  onClick={() => togglePublish(t.id, t.is_public)}
                >
                  {t.is_public ? 'Despublicar' : 'Publicar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SheetPage
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Novo Pacote em Grupo' : 'Editar Pacote'}
        subtitle="Defina o pacote e publique a página pública"
        sections={[
          { id: 'basic', label: 'Básico', icon: MapPin },
          { id: 'details', label: 'Detalhes', icon: Calendar },
          { id: 'commercial', label: 'Comercial', icon: Users },
          ...(editing && editing !== 'new' ? [{ id: 'days', label: 'Dia a dia', icon: ImageIcon }] : []),
        ]}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        {(section) => (
          <>
            {section === 'basic' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>Título do pacote *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Excursão Caldas Novas - Réveillon 2026" />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Ex: 5 dias inesquecíveis nas águas termais" />
                </div>
                <div>
                  <Label>URL da imagem de capa</Label>
                  <Input value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
                    placeholder="https://..." />
                </div>
                <div>
                  <Label>Descrição (markdown)</Label>
                  <Textarea rows={6} value={form.description_md} onChange={e => setForm({ ...form, description_md: e.target.value })}
                    placeholder="Descreva o pacote..." />
                </div>
              </div>
            )}
            {section === 'details' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Cidade de origem</Label>
                    <Input value={form.origin_city} onChange={e => setForm({ ...form, origin_city: e.target.value })}
                      placeholder="São Paulo" />
                  </div>
                  <div>
                    <Label>Destino</Label>
                    <Input value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })}
                      placeholder="Caldas Novas, GO" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data de partida</Label>
                    <Input type="date" value={form.departure_date} onChange={e => setForm({ ...form, departure_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Data de retorno</Label>
                    <Input type="date" value={form.return_date} onChange={e => setForm({ ...form, return_date: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {section === 'commercial' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Preço por pessoa (R$) *</Label>
                    <Input type="number" step="0.01" value={form.price_per_pax}
                      onChange={e => setForm({ ...form, price_per_pax: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>Vagas máximas</Label>
                    <Input type="number" value={form.max_pax}
                      onChange={e => setForm({ ...form, max_pax: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>Número de parcelas (carnê automático)</Label>
                  <Input type="number" min={1} max={24} value={form.installments_count}
                    onChange={e => setForm({ ...form, installments_count: Number(e.target.value) })} />
                  <p className="text-xs text-vj-txt3 mt-1">
                    Última parcela vence 1 dia antes da viagem. Demais distribuídas igualmente entre hoje e o vencimento final.
                  </p>
                </div>
              </div>
            )}
            {section === 'days' && editing && editing !== 'new' && (
              <GroupTripDaysEditor tripId={editing} />
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}
