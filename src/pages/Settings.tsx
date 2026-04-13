import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Users, Columns, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { data: keys, isLoading } = useAiKeys();
  const saveKey = useSaveAiKey();
  const deleteKey = useDeleteAiKey();

  const [provider, setProvider] = useState('Groq');
  const [apiKey, setApiKey] = useState('');
  const [limit, setLimit] = useState('');

  const handleSaveKey = async () => {
    if (!apiKey) return;
    await saveKey.mutateAsync({
      provider: provider.toLowerCase(),
      api_key: apiKey,
      monthly_limit_usd: limit ? parseFloat(limit) : undefined,
    });
    setApiKey('');
    setLimit('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2 text-vj-green">
            <SettingsIcon className="h-6 w-6" />
            Configurações da Agência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua equipe, chaves de inteligência artificial e layout de kanban.
          </p>
        </div>

        <Tabs defaultValue="aikeys" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-vj-bg border border-vj-border">
            <TabsTrigger value="agents"><Users className="mr-2 h-4 w-4" />Agentes</TabsTrigger>
            <TabsTrigger value="aikeys"><Key className="mr-2 h-4 w-4" />Chaves de IA (Pool)</TabsTrigger>
            <TabsTrigger value="kanban"><Columns className="mr-2 h-4 w-4" />Kanban</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="mt-6">
            <Card className="border-vj-border">
              <CardHeader>
                <CardTitle>Membros da Equipe</CardTitle>
                <CardDescription>Convide novos agentes de viagens ou gerentes para sua agência.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">O CRUD de convites de agentes será conectado ao painel de Profiles logo a seguir.</p>
                <Button className="mt-4" disabled>Convidar Membro (Em breve)</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aikeys" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg">Adicionar Nova Chave</CardTitle>
                  <CardDescription>Forneça as chaves Groq ou OpenRouter. O V-Agent fará pool (round-robin).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">Provedor</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus:ring-1 focus:ring-primary"
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                    >
                      <option value="OpenRouter">OpenRouter (Recomendado — acesso a todos os modelos)</option>
                      <option value="Gemini">Google Gemini (Extração de PDF/Imagem)</option>
                      <option value="Groq">Groq (Ultra-rápido, textos)</option>
                      <option value="OpenAI">OpenAI GPT-4o</option>
                      <option value="Firecrawl">Firecrawl (Scraping de páginas web)</option>
                      <option value="Steel">Steel (Automação de browser)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">API Key *</Label>
                    <Input 
                      type="password" 
                      placeholder="sk-..." 
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Limite Mensal de Tokens/USD (Opcional)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 50.00" 
                      value={limit}
                      onChange={e => setLimit(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleSaveKey} 
                    disabled={!apiKey || saveKey.isPending}
                  >
                    {saveKey.isPending ? 'Validando...' : 'Salvar Chave no Pool'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg">Pool Ativo</CardTitle>
                  <CardDescription>Suas chaves disponíveis para o esquadrão I.A.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
                  ) : !keys?.length ? (
                    <div className="text-center py-8 border border-dashed border-vj-border rounded-lg bg-muted/20">
                      <Key className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma chave cadastrada ainda.</p>
                      <p className="text-xs text-muted-foreground/70">O V-Agent está desativado no momento.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {keys.map((k: any) => (
                        <div key={k.id} className="flex items-center justify-between p-3 rounded-lg border border-vj-border bg-vj-bg">
                          <div>
                            <p className="font-semibold text-sm capitalize">{k.provider}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {k.api_key.substring(0, 4)}...{k.api_key.substring(k.api_key.length - 4)}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteKey.mutate(k.id)}
                            disabled={deleteKey.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <Card className="border-vj-border">
              <CardHeader>
                <CardTitle>Colunas do Kanban</CardTitle>
                <CardDescription>Personalize as etapas do seu pipeline de vendas e embarque.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Listagem e reordenação de colunas personalizadas entrarão aqui.</p>
                <Button className="mt-4" disabled>Nova Coluna (Em breve)</Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
