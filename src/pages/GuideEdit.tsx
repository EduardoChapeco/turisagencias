import { useState, useEffect } from 'react';
import { Map, Save, Globe, Image as ImageIcon, Video, Plus, Trash2, Layout, Type, Grid, X } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { useSaveGuide } from '@/hooks/useGuides';
import { supabase } from '@/integrations/supabase/client';

export interface GuideEditProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GuideEdit({ id, open, onClose, onSuccess }: GuideEditProps) {
  const isUpdate = !!id;
  const saveGuide = useSaveGuide();

  const [form, setForm] = useState<any>({
    city: '',
    country: '',
    slug: '',
    cover_image_url: '',
    gallery_urls: [],
    sections: [],
    video_url: '',
    intro: '',
    currency_info: '',
    climate_info: '',
    transportation: '',
    language_tips: '',
    is_published: false,
    tips: [] as { title: string; desc: string }[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && isUpdate && id) {
      setLoading(true);
      (supabase
        .from('destination_guides')
        .select('*')
        .eq('id', id)
        .single() as any)
        .then(({ data }: any) => {
          if (data) {
            setForm({
              ...data,
              slug: data.slug || '',
              cover_image_url: data.cover_image_url || '',
              gallery_urls: data.gallery_urls || [],
              sections: data.sections || [],
              video_url: data.video_url || '',
              tips: (data.tips as any) || [],
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (open && !isUpdate) {
      setForm({
        city: '', country: '', slug: '', cover_image_url: '', 
        gallery_urls: [], sections: [], video_url: '',
        intro: '', currency_info: '', climate_info: '', 
        transportation: '', language_tips: '',
        is_published: false, tips: [],
      });
    }
  }, [open, isUpdate, id]);

  const update = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (!form.city && !form.country) return;
    const txt = `${form.country}-${form.city}`.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    update('slug', txt);
  };

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
    if (!form.city || !form.country) return;
    await saveGuide.mutateAsync({
      id: isUpdate ? id! : undefined,
      ...form,
    });
    onSuccess?.();
    onClose();
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={isUpdate ? `Editar Guia: ${form.city}` : 'Novo Guia de Destino'}
      subtitle="Gerencie mídia, seções dinâmicas e base de IA"
      icon={Map}
      sections={[
        { id: 'identidade', label: 'Identidade e Capa' },
        { id: 'master', label: 'Mídia e Seções' },
        { id: 'logistica', label: 'Info Prática' },
        { id: 'publicacao', label: 'Configuração Portal' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={loading || !form.city || !form.country || saveGuide.isPending}
            className="bg-cb-accent text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdate ? 'Atualizar Guia' : 'Criar Guia'}
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (loading) return <div className="text-sm text-cb-muted animate-pulse">Carregando dados...</div>;

        return (
          <div className="space-y-8">
            {activeSection === 'identidade' && (
              <div className="space-y-6">
                 <div className="space-y-4">
                  <Label className="text-cb-text font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-cb-accent" /> Imagem de Capa Principal
                  </Label>
                  <MediaUploader 
                    multiple={false} 
                    existingUrls={form.cover_image_url ? [form.cover_image_url] : []} 
                    onUploadComplete={(urls) => update('cover_image_url', urls[0])}
                    folder="guides/covers"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>País *</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} onBlur={generateSlug} className="border-cb-border bg-cb-s1" placeholder="Ex: França" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cidade *</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} onBlur={generateSlug} className="border-cb-border bg-cb-s1" placeholder="Ex: Paris" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Link Público (Slug) *</Label>
                  <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="border-cb-border bg-cb-s1 font-mono text-sm" placeholder="franca-paris" />
                  <p className="text-[10px] text-cb-muted">URL: /p/guide/{form.slug || '...'}</p>
                </div>
              </div>
            )}

            {activeSection === 'master' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-cb-text font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-cb-accent" /> Galeria Adicional do Destino
                  </Label>
                  <MediaUploader 
                    multiple 
                    existingUrls={form.gallery_urls} 
                    onUploadComplete={(urls) => update('gallery_urls', urls)}
                    folder="guides/gallery"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-cb-text font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-cb-accent" /> Link de Vídeo/Documentário (YouTube)
                  </Label>
                  <Input value={form.video_url} onChange={(e) => update('video_url', e.target.value)} placeholder="https://..." className="border-cb-border bg-cb-s1" />
                </div>

                <div className="space-y-1.5">
                  <Label>Introdução Geral</Label>
                  <Textarea 
                    value={form.intro} 
                    onChange={(e) => update('intro', e.target.value)} 
                    className="border-cb-border bg-cb-s1 resize-none" 
                    rows={6}
                    placeholder="Vibe local, história e cultura..."
                  />
                </div>

                <div className="pt-6 border-t border-cb-border">
                  <div className="flex items-center justify-between mb-6">
                    <Label className="font-bold text-lg">Seções Dinâmicas</Label>
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
                    {form.sections.map((section: any) => (
                      <div key={section.id} className="relative p-5 rounded-2xl border border-cb-accent/10 bg-cb-s1/50 group">
                        <button 
                          onClick={() => removeSection(section.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        <div className="space-y-4">
                          <Input 
                            value={section.title} 
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            placeholder="Título da Seção"
                            className="border-none bg-transparent font-bold text-cb-text focus:ring-0 p-0 shadow-none h-auto text-base"
                          />

                          {section.type === 'text' ? (
                            <Textarea 
                              value={section.content}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              placeholder="Conteúdo textual..."
                              rows={4}
                              className="bg-cb-s1 border-cb-border text-sm"
                            />
                          ) : (
                            <MediaUploader 
                              multiple
                              existingUrls={section.items}
                              onUploadComplete={(urls) => updateSection(section.id, { items: urls })}
                              folder={`guides/sections/${section.id}`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'logistica' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Clima e Melhor Época</Label>
                  <Textarea value={form.climate_info} onChange={(e) => update('climate_info', e.target.value)} className="border-cb-border bg-cb-s1" rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Moeda e Dicas Financeiras</Label>
                  <Textarea value={form.currency_info} onChange={(e) => update('currency_info', e.target.value)} className="border-cb-border bg-cb-s1" rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Transporte</Label>
                  <Textarea value={form.transportation} onChange={(e) => update('transportation', e.target.value)} className="border-cb-border bg-cb-s1" rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Idioma e Comunicação</Label>
                  <Textarea value={form.language_tips} onChange={(e) => update('language_tips', e.target.value)} className="border-cb-border bg-cb-s1" rows={3} />
                </div>
              </div>
            )}

            {activeSection === 'publicacao' && (
              <div className="p-6 rounded-2xl bg-cb-accent/5 border border-cb-accent/10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-cb-text flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cb-accent" />
                    Publicar Manual de Destino
                  </h3>
                  <p className="text-xs text-cb-muted">Permite que o guia seja acessado publicamente via URL.</p>
                </div>
                <Switch 
                  checked={form.is_published} 
                  onCheckedChange={(c) => update('is_published', c)} 
                />
              </div>
            )}
          </div>
        );
      }}
    </SheetPage>
  );
}
