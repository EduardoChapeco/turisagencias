import { useState, useEffect } from 'react';
import { BookOpen, Save, Plus, Trash2, Globe } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveTravelerInfoPage, useTravelerInfoPage } from '@/hooks/useTravelerInfo';

interface AlertContent {
  text: string;
  style: 'neutral' | 'danger' | 'warning' | 'success';
}

interface ContentBlock {
  id: string;
  type: 'text' | 'alert' | 'image';
  content: string | AlertContent;
}

export interface TravelerInfoEditProps {
  id: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TravelerInfoEdit({ id, open, onClose, onSuccess }: TravelerInfoEditProps) {
  const isUpdate = !!id;
  const savePage = useSaveTravelerInfoPage();
  const { data: pageData, isLoading } = useTravelerInfoPage(id || undefined);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    is_published: false,
    content_blocks: [] as ContentBlock[],
  });

  useEffect(() => {
    if (open && isUpdate && pageData) {
      setForm({
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description || '',
        cover_image_url: pageData.cover_image_url || '',
        is_published: pageData.is_published || false,
        content_blocks: (pageData.content_blocks as ContentBlock[]) || [],
      });
    } else if (open && !isUpdate) {
      setForm({
        title: '', slug: '', description: '', cover_image_url: '',
        is_published: false, content_blocks: [],
      });
    }
  }, [open, isUpdate, pageData]);

  const update = (field: string, value: string | boolean | ContentBlock[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (!form.title) return;
    const txt = form.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    update('slug', txt);
  };

  const addBlock = (type: 'text' | 'alert' | 'image') => {
    const defaultContent: any = type === 'text' ? '' : type === 'alert' ? { text: '', style: 'neutral' } : '';
    setForm((p: any) => ({
      ...p,
      content_blocks: [...p.content_blocks, { id: Date.now().toString(), type, content: defaultContent }]
    }));
  };

  const updateBlock = (index: number, content: string | AlertContent) => {
    setForm(p => {
      const blocks = [...p.content_blocks];
      blocks[index].content = content;
      return { ...p, content_blocks: blocks };
    });
  };

  const removeBlock = (index: number) => {
    setForm(p => ({
      ...p,
      content_blocks: p.content_blocks.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    await savePage.mutateAsync({
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
      title={isUpdate ? `Editar: ${form.title}` : 'Nova Página de Informação'}
      subtitle="Conteúdo para Guias e Viajantes"
      icon={BookOpen}
      sections={[
        { id: 'identidade', label: 'Capa & Identidade' },
        { id: 'conteudo', label: 'Blocos de Leitura' },
        { id: 'publicacao', label: 'Visibilidade' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={isLoading || !form.title || !form.slug || savePage.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdate ? 'Atualizar Página' : 'Salvar Página'}
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (isLoading && isUpdate) return <div className="text-sm text-vj-txt3 animate-pulse">Carregando dados...</div>;

        return (
          <div className="space-y-5">
            {activeSection === 'identidade' && (
              <>
                <div className="space-y-1.5">
                  <Label>Título da Página *</Label>
                  <Input value={form.title} onChange={(e) => update('title', e.target.value)} onBlur={generateSlug} className="border-vj-border" placeholder="Ex: O que levar na mala?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Link Público (Slug) *</Label>
                  <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="border-vj-border font-mono text-sm" placeholder="o-que-levar-na-mala" />
                  <p className="text-[10px] text-vj-txt3">URL do portal: /p/info/{form.slug || '...'}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Breve Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="border-vj-border max-h-24" placeholder="Um resumo sobre o que esta página aborda..." />
                </div>
                <div className="space-y-1.5">
                  <Label>URL da Imagem de Capa</Label>
                  <Input value={form.cover_image_url} onChange={(e) => update('cover_image_url', e.target.value)} className="border-vj-border" placeholder="https://..." />
                </div>
              </>
            )}

            {activeSection === 'conteudo' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 pb-4 border-b border-vj-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => addBlock('text')}><Plus className="mr-2 h-3.5 w-3.5" /> Texto Logo</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addBlock('alert')}><Plus className="mr-2 h-3.5 w-3.5" /> Caixa de Alerta</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addBlock('image')}><Plus className="mr-2 h-3.5 w-3.5" /> Imagem Inline</Button>
                </div>

                <div className="space-y-6">
                  {form.content_blocks.length === 0 ? (
                    <div className="text-center py-8 text-vj-txt3 text-sm italic bg-vj-bg rounded-cb-md border border-vj-border border-dashed">
                      Nenhum bloco de conteúdo adicionado ainda.
                    </div>
                  ) : (
                    form.content_blocks.map((block, i) => (
                      <div key={block.id} className="relative p-4 rounded-cb-md border border-vj-border bg-white  animate-in fade-in slide-in-from-bottom-2">
                        <div className="absolute top-2 right-2">
                           <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-vj-txt3 hover:text-vj-red" onClick={() => removeBlock(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                        {block.type === 'text' && (
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs text-vj-txt3 font-bold uppercase tracking-wide">Bloco de Texto</Label>
                            <Textarea value={block.content as string} onChange={e => updateBlock(i, e.target.value)} placeholder="Escreva o texto aqui..." className="min-h-[120px] resize-y" />
                          </div>
                        )}
                        {block.type === 'alert' && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-vj-txt3 font-bold uppercase tracking-wide">Caixa de Alerta</Label>
                              <Select 
                                value={(block.content as any)?.style || 'neutral'} 
                                onValueChange={v => updateBlock(i, { ...(block.content as any), style: v } as any)}
                              >
                                <SelectTrigger className="text-xs border-vj-border bg-vj-bg h-8 w-auto min-w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="neutral">Nota (Neutro)</SelectItem>
                                  <SelectItem value="danger">Atenção (Vermelho)</SelectItem>
                                  <SelectItem value="warning">Aviso (Amarelo)</SelectItem>
                                  <SelectItem value="success">Dica (Verde)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea value={(block.content as any)?.text || ''} onChange={e => updateBlock(i, { ...(block.content as any), text: e.target.value } as any)} placeholder="Texto do alerta..." className="h-20" />
                          </div>
                        )}
                        {block.type === 'image' && (
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs text-vj-txt3 font-bold uppercase tracking-wide">Link da Imagem</Label>
                            <Input value={block.content as string} onChange={e => updateBlock(i, e.target.value)} placeholder="https://..." />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'publicacao' && (
              <div className="surface-muted border-vj-border rounded-cb-md p-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-vj-txt flex items-center gap-2">
                    <Globe className="h-4 w-4 text-vj-green" />
                    Publicar no Portal do Cliente
                  </h3>
                  <p className="text-sm text-vj-txt3 mt-1 leading-snug">
                    Ao ativar esta opção, a página ficará visível publicamente e poderá ser acessada e referenciada nas conversas pelo Agente IA.
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
