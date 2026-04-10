import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, MapPin, Italic, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useGuide, useSaveGuide, useDeleteGuide } from '@/hooks/useGuides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GuideDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  
  const { data: guide, isLoading } = useGuide(isNew ? undefined : id);
  const saveGuide = useSaveGuide();
  const deleteGuide = useDeleteGuide();

  const [formData, setFormData] = useState({
    city: '',
    country: '',
    cover_image_url: '',
    intro: '',
    currency_info: '',
    climate_info: '',
    transportation: '',
    language_tips: '',
    is_published: false,
    tips: [] as { title: string; desc: string }[],
  });

  useEffect(() => {
    if (guide) {
      setFormData({
        city: guide.city || '',
        country: guide.country || '',
        cover_image_url: guide.cover_image_url || '',
        intro: guide.intro || '',
        currency_info: guide.currency_info || '',
        climate_info: guide.climate_info || '',
        transportation: guide.transportation || '',
        language_tips: guide.language_tips || '',
        is_published: guide.is_published || false,
        tips: (guide.tips as any) || [],
      });
    }
  }, [guide]);

  const handleSave = async () => {
    if (!formData.city || !formData.country) return;
    
    await saveGuide.mutateAsync({
      id: isNew ? undefined : id,
      ...formData
    });
    
    if (isNew) {
      navigate('/guides');
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    if (confirm('Tem certeza que deseja deletar este Guia Inteiro? Todas as referências da IA serão perdidas.')) {
      await deleteGuide.mutateAsync(id);
      navigate('/guides');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-[600px] rounded-2xl" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => navigate('/guides')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-3xl font-bold text-primary">
                {isNew ? 'Mapear Novo Destino' : `Editor: ${guide?.city}`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Base de Conhecimento RAG e Portal do Cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isNew && (
               <Button variant="destructive" size="icon" onClick={handleDelete} className="rounded-xl" title="Remover Guia">
                  <Trash2 className="h-4 w-4" />
               </Button>
            )}
            <Button onClick={handleSave} disabled={saveGuide.isPending || !formData.city || !formData.country} className="rounded-xl shadow-sm px-6">
              <Save className="mr-2 h-4 w-4" />
              {saveGuide.isPending ? 'Sincronizando...' : 'Publicar na IA'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="master" className="w-full">
           <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
              <TabsTrigger value="master"><MapPin className="h-4 w-4 mr-2" /> Master Data</TabsTrigger>
              <TabsTrigger value="content"><BookOpen className="h-4 w-4 mr-2" /> Conteúdo Inteligente</TabsTrigger>
           </TabsList>

           <TabsContent value="master" className="space-y-6 animate-in fade-in">
             <Card className="border-border/50 shadow-sm">
               <CardHeader className="bg-surface/50 border-b border-border/30">
                 <CardTitle>Identidade do Destino</CardTitle>
                 <CardDescription>Capa e categorização para as buscas.</CardDescription>
               </CardHeader>
               <CardContent className="grid gap-6 sm:grid-cols-2 p-6">
                 <div className="space-y-2">
                   <Label className="font-medium">País *</Label>
                   <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="Ex: França" />
                 </div>
                 <div className="space-y-2">
                   <Label className="font-medium">Cidade *</Label>
                   <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Ex: Paris" />
                 </div>
                 <div className="space-y-2 sm:col-span-2">
                   <Label className="font-medium">URL Fotografia de Capa</Label>
                   <Input value={formData.cover_image_url} onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })} placeholder="https://..." />
                 </div>
                 <div className="flex items-center justify-between sm:col-span-2 p-4 border border-border/50 rounded-xl bg-muted/20">
                   <div className="space-y-0.5">
                     <Label className="text-base">Acesso Liberado no Portal?</Label>
                     <p className="text-xs text-muted-foreground">Se ativo, viajantes poderão ler este guia pelo App.</p>
                   </div>
                   <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData({ ...formData, is_published: c })} />
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="content" className="space-y-6 animate-in fade-in">
             <Card className="border-border/50 shadow-sm">
               <CardHeader className="bg-surface/50 border-b border-border/30 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Dados Técnicos & Logísticos</CardTitle>
                    <CardDescription>Estes textos livres serão fatiados (embeddings) para consumo dos Agentes IA.</CardDescription>
                  </div>
                  <Italic className="h-6 w-6 text-muted-foreground/30" />
               </CardHeader>
               <CardContent className="p-6 space-y-6">
                 <div className="space-y-2">
                   <Label className="font-medium text-primary">Introdução Geral</Label>
                   <Textarea className="min-h-[100px] resize-y" placeholder="Cultura local, história brilhante..." value={formData.intro} onChange={e => setFormData({...formData, intro: e.target.value})} />
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <Label className="font-medium text-accent">Moeda e Pagamentos</Label>
                      <Textarea placeholder="Aceitam cartão? Requer cash?" value={formData.currency_info} onChange={e => setFormData({...formData, currency_info: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-accent">Clima e Estações</Label>
                      <Textarea placeholder="Meses de chuva, temperaturas médias..." value={formData.climate_info} onChange={e => setFormData({...formData, climate_info: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-accent">Transporte Público / Aluguel</Label>
                      <Textarea placeholder="Como ir do aeroporto ao centro..." value={formData.transportation} onChange={e => setFormData({...formData, transportation: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-accent">Idioma e Dicas Locais</Label>
                      <Textarea placeholder="Frases de emergência, cultura polida..." value={formData.language_tips} onChange={e => setFormData({...formData, language_tips: e.target.value})} />
                    </div>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
