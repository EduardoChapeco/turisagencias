import { useState, useEffect } from 'react';
import { Map, Save, Globe } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

  const [form, setForm] = useState({
    city: '',
    country: '',
    slug: '',
    cover_image_url: '',
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
        .single() as any as Promise<{ data: any }>)
        .then(({ data }) => {
          if (data) {
            setForm({
              city: data.city,
              country: data.country,
              slug: data.slug || '',
              cover_image_url: data.cover_image_url || '',
              intro: data.intro || '',
              currency_info: data.currency_info || '',
              climate_info: data.climate_info || '',
              transportation: data.transportation || '',
              language_tips: data.language_tips || '',
              is_published: data.is_published || false,
              tips: (data.tips as any) || [],
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (open && !isUpdate) {
      setForm({
        city: '', country: '', slug: '', cover_image_url: '', intro: '',
        currency_info: '', climate_info: '', transportation: '', language_tips: '',
        is_published: false, tips: [],
      });
    }
  }, [open, isUpdate, id]);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (!form.city && !form.country) return;
    const txt = `${form.country}-${form.city}`.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    update('slug', txt);
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
      subtitle="Base de Conhecimento Mágica e IA"
      icon={Map}
      sections={[
        { id: 'identidade', label: 'Identidade e Capa' },
        { id: 'master', label: 'Conteúdo Principal' },
        { id: 'logistica', label: 'Logística e Dicas' },
        { id: 'publicacao', label: 'Portal Público' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={loading || !form.city || !form.country || saveGuide.isPending}
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
          <div className="space-y-5">
            {activeSection === 'identidade' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>País *</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} onBlur={generateSlug} className="border-cb-border" placeholder="Ex: França" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cidade *</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} onBlur={generateSlug} className="border-cb-border" placeholder="Ex: Paris" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Link Público (Slug) *</Label>
                  <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="border-cb-border font-mono text-sm" placeholder="franca-paris" />
                  <p className="text-[10px] text-cb-muted">URL do portal: /p/guide/{form.slug || '...'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>URL da Imagem de Capa</Label>
                  <Input value={form.cover_image_url} onChange={(e) => update('cover_image_url', e.target.value)} className="border-cb-border" placeholder="https://..." />
                </div>
              </>
            )}

            {activeSection === 'master' && (
              <div className="space-y-1.5 flex-1 h-full min-h-[400px] flex flex-col">
                <Label>Introdução Geral (Apresentação do Destino)</Label>
                <Textarea 
                  value={form.intro} 
                  onChange={(e) => update('intro', e.target.value)} 
                  className="border-cb-border resize-none flex-1 min-h-[300px]" 
                  placeholder="Escreva a introdução cultural, história resumida e a vibe local..."
                />
              </div>
            )}

            {activeSection === 'logistica' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Clima e Melhor Época</Label>
                  <Textarea value={form.climate_info} onChange={(e) => update('climate_info', e.target.value)} className="border-cb-border resize-y" rows={3} placeholder="Média de temperaturas, inverno, verão, temporada de chuvas..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Moeda e Dicas Financeiras</Label>
                  <Textarea value={form.currency_info} onChange={(e) => update('currency_info', e.target.value)} className="border-cb-border resize-y" rows={3} placeholder="Precisa de cash? Cartão pré-pago funciona bem? Gorjeta é obrigatória?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Transporte</Label>
                  <Textarea value={form.transportation} onChange={(e) => update('transportation', e.target.value)} className="border-cb-border resize-y" rows={3} placeholder="Como se mover na cidade (metrô, uber, aluguel de carro)..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Idioma oficial e Comunicação</Label>
                  <Textarea value={form.language_tips} onChange={(e) => update('language_tips', e.target.value)} className="border-cb-border resize-y" rows={3} placeholder="Falam inglês? Palavras básicas para salvar a viagem..." />
                </div>
              </div>
            )}

            {activeSection === 'publicacao' && (
              <div className="surface-muted border-cb-border rounded-cb-md p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-cb-text flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cb-accent" />
                    Publicar no Portal do Cliente
                  </h3>
                  <p className="text-sm text-cb-muted mt-1 leading-snug">
                    Ao ativar esta opção, o guia ficará visível de fora da plataforma caso você envie o <strong>Link Público</strong>.
                  </p>
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
