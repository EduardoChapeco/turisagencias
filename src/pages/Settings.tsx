import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Trash2, Users, Key, KeyRound, Brain, Database, Columns, Mail, Activity, Bus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { usePolicies, useCreatePolicy, useDeletePolicy } from '@/hooks/usePoliciesAndExperiences';

// Import extracted tab components
import { AgentesTab } from './settings/AgentesTab';
import { KnowledgeTab } from './settings/KnowledgeTab';
import { KanbanTab } from './settings/KanbanTab';
import { AiLogsTab } from './settings/AiLogsTab';
import { IntegrationsTab } from './settings/IntegrationsTab';
import { BusLayoutTab } from './settings/BusLayoutTab';
import { B2BTab } from './settings/B2BTab';

export default function Settings() {
  const { data: keys, isLoading } = useAiKeys();
  const saveKey = useSaveAiKey();
  const deleteKey = useDeleteAiKey();
  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const createPolicy = useCreatePolicy();
  const deletePolicy = useDeletePolicy();

  const [provider, setProvider] = useState('OpenRouter');
  const [apiKey, setApiKey] = useState('');
  const [policyOperadora, setPolicyOperadora] = useState('');
  const [policyDisplay, setPolicyDisplay] = useState('');
  const [policyConteudo, setPolicyConteudo] = useState('');

  const handleSaveKey = async () => {
    if (!apiKey) return;
    await saveKey.mutateAsync({ provider: provider.toLowerCase(), api_key: apiKey });
    setApiKey('');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10 px-4 sm:px-6">
        <div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">Configurações da <span className="highlight-text">Agência</span></h1>
          <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-vj-green" /> Hub administrativo completo da Turis Agências.
          </p>
        </div>

        <Tabs defaultValue="aikeys" className="w-full">
          <TabsList className="bg-zinc-100/50 p-1.5 rounded-[32px] flex gap-1 mb-10 border border-zinc-200/50 backdrop-blur-md w-fit mx-auto overflow-x-auto">
            {[
              { id: 'agents',       label: 'Equipe',     icon: Users },
              { id: 'aikeys',       label: 'Chaves IA',  icon: Key },
              { id: 'knowledge',    label: 'Especialista', icon: Brain },
              { id: 'policies',     label: 'Operadoras', icon: Database },
              { id: 'kanban',       label: 'Board',      icon: Columns },
              { id: 'integrations', label: 'Webhooks',   icon: Mail },
              { id: 'bus',          label: 'Ônibus',     icon: Bus },
              { id: 'b2b',          label: 'Portais B2B', icon: KeyRound },
              { id: 'logs',         label: 'Logs IA',    icon: Activity },
            ].map(t => (
              <TabsTrigger 
                key={t.id} 
                value={t.id} 
                className="px-8 py-3 rounded-[24px] text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-vj-txt data-[state=active]:text-white"
              >
                <t.icon className="w-3.5 h-3.5 mr-2 shrink-0" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="agents" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AgentesTab /></TabsContent>
          <TabsContent value="knowledge" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KnowledgeTab /></TabsContent>
          <TabsContent value="kanban" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KanbanTab /></TabsContent>
          <TabsContent value="integrations" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><IntegrationsTab /></TabsContent>
          <TabsContent value="bus" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><BusLayoutTab /></TabsContent>
          <TabsContent value="b2b" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><B2BTab /></TabsContent>
          <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AiLogsTab /></TabsContent>
          
          <TabsContent value="aikeys" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-lg">Pool de Processamento IA</CardTitle>
                  <CardDescription>Gerencie o poder computacional do seu agente autônomo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Provedor Principal</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenRouter">OpenRouter (Acesso Total)</SelectItem>
                        <SelectItem value="Gemini">Google Gemini (Visão)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Token de Acesso</Label>
                    <Input type="password" placeholder="••••••••••••••••" value={apiKey} onChange={e => setApiKey(e.target.value)} className="h-12 rounded-2xl border-zinc-100 bg-zinc-50" />
                  </div>
                  <Button className="w-full premium-button h-12" onClick={handleSaveKey} disabled={!apiKey || saveKey.isPending}>
                     {saveKey.isPending ? 'Verificando...' : 'Ativar no Cérebro Central'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardHeader><CardTitle className="text-lg">Infraestrutura Ativa</CardTitle></CardHeader>
                <CardContent>
                   <div className="space-y-3">
                     {isLoading ? <Skeleton className="h-20 w-full" /> : keys?.length ? keys.map((k: any) => (
                       <div key={k.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-vj-green animate-pulse" />
                            <span className="text-sm font-bold uppercase">{k.provider}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteKey.mutate(k.id)}>
                            <Trash2 size={14} />
                          </Button>
                       </div>
                     )) : <p className="text-center py-10 text-muted-foreground text-xs italic">Sem infraestrutura de IA vinculada.</p>}
                   </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="premium-card">
                 <CardHeader><CardTitle className="text-lg">Extrator: Banco de Políticas</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Slug (ex: orinter)" value={policyOperadora} onChange={e => setPolicyOperadora(e.target.value)} className="rounded-xl" />
                      <Input placeholder="Nome (ex: Orinter Tour)" value={policyDisplay} onChange={e => setPolicyDisplay(e.target.value)} className="rounded-xl" />
                    </div>
                    <Textarea placeholder="Cole aqui as regras de pagamento ou cancelamento..." value={policyConteudo} onChange={e => setPolicyConteudo(e.target.value)} rows={7} className="rounded-2xl border-zinc-100" />
                    <Button className="w-full premium-button h-12" onClick={() => createPolicy.mutate({ operadora: policyOperadora, operadora_display: policyDisplay, conteudo: policyConteudo })}>Cachear Regras</Button>
                 </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader><CardTitle className="text-lg">Políticas Verificadas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {policies?.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest">{p.operadora_display || p.operadora}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deletePolicy.mutate(p.id)}><Trash2 size={13} /></Button>
                    </div>
                  ))}
                  {!policies?.length && <div className="text-center py-20 opacity-20"><Database size={40} className="mx-auto" /></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
