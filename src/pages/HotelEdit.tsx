import { useState, useEffect } from 'react';
import { Building2, Save, Image as ImageIcon, Video, Plus, Trash2, Layout, Type, Grid, Columns, X } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { useCreateHotel, useUpdateHotel } from '@/hooks/useHotels';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export interface HotelEditProps {
  id: string | null; // null for Create
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function HotelEdit({ id, open, onClose, onSuccess }: HotelEditProps) {
  const isUpdate = !!id;
  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();

  const [form, setForm] = useState<any>({
    name: '',
    category: '',
    description: '',
    city: '',
    state: '',
    country: 'Brasil',
    zip_code: '',
    phone: '',
    website: '',
    email: '',
    photo_url: '',
    gallery_urls: [],
    sections: [],
    video_url: '',
    tags: '',
    regime_options: '',
    amenities: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && isUpdate && id) {
      setLoading(true);
      (supabase
        .from('hotels_bank')
        .select('*')
        .eq('id', id)
        .single() as Record<string, any>)
        .then(({ data }: any) => {
          if (data) {
            setForm({
              ...data,
              category: data.category?.toString() ?? '',
              tags: data.tags ? data.tags.join(', ') : '',
              regime_options: data.regime_options ? data.regime_options.join(', ') : '',
              amenities: data.amenities ? data.amenities.join(', ') : '',
              gallery_urls: data.gallery_urls || [],
              sections: data.sections || [],
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (open && !isUpdate) {
      setForm({
        name: '', category: '', description: '', city: '', state: '', country: 'Brasil',
        zip_code: '', phone: '', website: '', email: '', photo_url: '',
        gallery_urls: [], sections: [], video_url: '',
        tags: '', regime_options: '', amenities: ''
      });
    }
  }, [open, isUpdate, id]);

  const update = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const addSection = (type: any) => {
    const newSection = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title: type === 'text' ? 'Nova Seção de Texto' : 'Nova Galeria',
      content: '',
      items: [],
      layout: 'full'
    };
    update('sections', [...form.sections, newSection]);
  };

  const removeSection = (sId: string) => {
    update('sections', form.sections.filter((s: any) => s.id !== sId));
  };

  const updateSection = (sId: string, data: any) => {
    update('sections', form.sections.map((s: any) => s.id === sId ? { ...s, ...data } : s));
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      category: form.category ? Number(form.category) : null,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((x: string) => x.trim()).filter(Boolean) : form.tags,
      regime_options: typeof form.regime_options === 'string' ? form.regime_options.split(',').map((x: string) => x.trim()).filter(Boolean) : form.regime_options,
      amenities: typeof form.amenities === 'string' ? form.amenities.split(',').map((x: string) => x.trim()).filter(Boolean) : form.amenities,
    };

    if (isUpdate) {
      const dbRes = await updateHotel.mutateAsync({ id: id!, ...payload });
      onSuccess?.(dbRes.id);
      onClose();
    } else {
      const dbRes = await createHotel.mutateAsync(payload as any);
      onSuccess?.(dbRes.id);
      onClose();
    }
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={isUpdate ? 'Editar Hotel' : 'Novo Hotel'}
      subtitle="Gerencie mídia, seções e dados do parceiro"
      icon={Building2}
      sections={[
        { id: 'geral', label: 'Dados Básicos' },
        { id: 'midia', label: 'Mídia e Seções' },
        { id: 'contato', label: 'Local e Contato' },
        { id: 'detalhes', label: 'Comodidades' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={loading || !form.name || createHotel.isPending || updateHotel.isPending}
            className="bg-vj-green text-white hover:bg-vj-green/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdate ? 'Atualizar hotel' : 'Salvar hotel'}
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (loading) return <div className="text-sm text-vj-txt3 animate-pulse">Carregando dados...</div>;

        return (
          <>
            {activeSection === 'geral' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-vj-txt font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-vj-green" /> Imagem de Capa Principal
                  </Label>
                  <MediaUploader 
                    multiple={false} 
                    existingUrls={form.photo_url ? [form.photo_url] : []} 
                    onUploadComplete={(urls) => update('photo_url', urls[0])}
                    folder="hotels/covers"
                    aspectRatio={16 / 9}
                    ownerType="hotel"
                    ownerId={id}
                    fieldName="photo_url"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nome do Hotel *</Label>
                    <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="border-vj-border bg-vj-bg focus:ring-vj-green" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Categoria (Estrelas)</Label>
                    <Input type="number" min="1" max="5" value={form.category} onChange={(e) => update('category', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Descrição Geral</Label>
                    <Textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="resize-none border-vj-border bg-vj-bg" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'midia' && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-vj-txt font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-vj-green" /> Galeria Adicional
                  </Label>
                  <MediaUploader 
                    multiple 
                    existingUrls={form.gallery_urls} 
                    onUploadComplete={(urls) => update('gallery_urls', urls)}
                    folder="hotels/gallery"
                    aspectRatio={4 / 3}
                    ownerType="hotel"
                    ownerId={id}
                    fieldName="gallery_urls"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-vj-txt font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-vj-green" /> Link do Vídeo (YouTube)
                  </Label>
                  <Input value={form.video_url} onChange={(e) => update('video_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="border-vj-border bg-vj-bg" />
                </div>

                <div className="pt-6 border-t border-vj-border">
                  <div className="flex items-center justify-between mb-6">
                    <Label className="text-vj-txt font-bold text-lg">Seções do Site/Página</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addSection('text')} className="text-xs">
                        <Type className="h-3 w-3 mr-1" /> + Texto
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSection('gallery')} className="text-xs">
                        <Grid className="h-3 w-3 mr-1" /> + Galeria
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {form.sections.map((section: any, idx: number) => (
                      <div key={section.id} className="relative p-5 rounded-2xl border border-vj-green/10 bg-vj-bg/50 group">
                        <button 
                          onClick={() => removeSection(section.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity "
                        >
                          <X className="h-3 w-3" />
                        </button>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-vj-green/10 text-vj-green">
                              {section.type === 'text' ? <Type className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                            </div>
                            <Input 
                              value={section.title} 
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              placeholder="Título da Seção"
                              className="border-none bg-transparent font-bold text-vj-txt focus:ring-0 p-0  h-auto text-base"
                            />
                          </div>

                          {section.type === 'text' ? (
                            <Textarea 
                              value={section.content}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              placeholder="Escreva o conteúdo desta seção..."
                              rows={4}
                              className="bg-vj-bg border-vj-border text-sm"
                            />
                          ) : (
                            <MediaUploader 
                              multiple
                              existingUrls={section.items}
                              onUploadComplete={(urls) => updateSection(section.id, { items: urls })}
                              folder={`hotels/sections/${section.id}`}
                              aspectRatio={4 / 3}
                              ownerType="hotel"
                              ownerId={id}
                              fieldName={`sections.${section.id}.items`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {form.sections.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-vj-border rounded-2xl">
                        <Layout className="h-10 w-10 text-vj-txt3/20 mx-auto mb-3" />
                        <p className="text-vj-txt3 text-sm italic">Nenhuma seção adicional. Clique nos botões acima para adicionar.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'contato' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Cidade</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Input value={form.state} onChange={(e) => update('state', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>País</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CEP / ZipCode</Label>
                    <Input value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="border-vj-border bg-vj-bg" />
                </div>
              </div>
            )}

            {activeSection === 'detalhes' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Comodidades (separadas por vírgula)</Label>
                  <Input value={form.amenities} onChange={(e) => update('amenities', e.target.value)} placeholder="Piscina, Wi-Fi, Spa..." className="border-vj-border bg-vj-bg" />
                </div>
                <div className="space-y-1.5">
                  <Label>Opções de Regime (separadas por vírgula)</Label>
                  <Input value={form.regime_options} onChange={(e) => update('regime_options', e.target.value)} placeholder="Café, Meia Pensão, All Inclusive..." className="border-vj-border bg-vj-bg" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags Internas (separadas por vírgula)</Label>
                  <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="Praia, Romântico, Luxo..." className="border-vj-border bg-vj-bg" />
                </div>
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
