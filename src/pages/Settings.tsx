import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Trash2, Users, FileText, Database, Webhook, Activity, CreditCard, Columns, Brain, Lock, MapPin, Search, ChevronDown, Check, X, Plane, FileSearch, ShieldCheck, Cpu, Key, Mail, Bus, KeyRound, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useSearchParams } from 'react-router-dom';

import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { usePolicies, useCreatePolicy, useDeletePolicy } from '@/hooks/usePoliciesAndExperiences';

import Guides from './Guides';
import Hotels from './Hotels';
import Destinations from './Destinations';
import CsvImporter from './Integrations';

// Import extracted tab components
import { AgentesTab } from './settings/AgentesTab';
import { KnowledgeTab } from './settings/KnowledgeTab';
import { KanbanTab } from './settings/KanbanTab';
import { AiLogsTab } from './settings/AiLogsTab';
import { IntegrationsTab } from './settings/IntegrationsTab';
import { BusLayoutTab } from './settings/BusLayoutTab';
import { B2BTab } from './settings/B2BTab';

function BillingTab() {
  const { organization } = useAuthStore();
  const planName = organization?.plan || 'Starter';
  const isPro = planName.includes('Pro') || planName.includes('Enterprise');

  return (
    <div className="space-y-6">
      <Card className={`bento-card border ${isPro ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isPro ? 'text-vj-green' : ''}`}>
            <CreditCard className="w-5 h-5" /> Assinatura Atual: {planName}
          </CardTitle>
          <CardDescription className={isPro ? "text-zinc-400" : ""}>
            Gerencie sua assinatura, limites de uso e cobranças.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-4 rounded-xl border ${isPro ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between`}>
             <div>
               <h4 className="font-bold mb-1">Cotações Extraídas via IA</h4>
               <p className={`text-sm ${isPro ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {isPro ? 'Uso ilimitado ativado no plano Premium.' : 'Renova no dia 1 do próximo mês.'}
               </p>
             </div>
             <div className="text-right">
                <span className="text-2xl font-black">{isPro ? '∞' : '45'}</span>
                {!isPro && <span className={`text-sm ${isPro ? 'text-zinc-500' : 'text-zinc-400'}`}>/100</span>}
             </div>
          </div>
          
          <div className={`p-4 rounded-xl border ${isPro ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between`}>
             <div>
               <h4 className="font-bold mb-1">Status da Assinatura</h4>
               <p className={`text-sm ${isPro ? 'text-zinc-400' : 'text-zinc-500'}`}>Próxima cobrança em 05/05/2026</p>
             </div>
             <div className="flex gap-2">
                <span className="px-3 py-1 bg-vj-green/20 text-vj-green font-bold text-xs rounded-full flex items-center">
                  <Check className="w-3 h-3 mr-1" /> ATIVA
                </span>
             </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-zinc-200/20">
             {!isPro && (
               <a href="/pricing" className="premium-button px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center">
                 Fazer Upgrade para o Pro
               </a>
             )}
             <button className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center border ${isPro ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-zinc-50'}`}>
               Portal do Cliente (Stripe)
             </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'aikeys';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

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
      <div className="space-y-8 max-w-[1400px] mx-auto pb-10 px-4 sm:px-6 w-full overflow-hidden">
        <PageHeader 
          title="Configurações da Agência" 
          description="Hub administrativo completo da Turis Agências. Gerencie sua equipe, integre chaves de IA, configure políticas de operadoras e ajuste a assinatura." 
          icon={SettingsIcon} 
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="relative w-full overflow-hidden mb-10">
            <div className="overflow-x-auto no-scrollbar pb-2 w-full">
              <TabsList className="bg-zinc-100/60 p-1.5 rounded-2xl flex w-max min-w-full justify-start md:justify-center border border-zinc-200/50 backdrop-blur-md">
                {[
                  { id: 'agents',       label: 'Equipe',           icon: Users },
                  { id: 'aikeys',       label: 'Cérebro da IA',    icon: Key },
                  { id: 'knowledge',    label: 'Especialista',     icon: Brain },
                  { id: 'policies',     label: 'Operadoras',       icon: Database },
                  { id: 'kanban',       label: 'Painel Vendas',    icon: Columns },
                  { id: 'billing',      label: 'Assinatura',       icon: CreditCard },
                  { id: 'integrations', label: 'Portais B2B',      icon: Mail },
                  { id: 'csv-import',   label: 'Importador CSV',   icon: FileSpreadsheet },
                  { id: 'guides',       label: 'Guias',            icon: Book },
                  { id: 'hotels',       label: 'Hotéis',           icon: Building2 },
                  { id: 'destinations', label: 'Destinos',         icon: MapPin },
                  { id: 'bus',          label: 'Frotas',           icon: Bus },
                  { id: 'b2b',          label: 'Acessos B2B',      icon: KeyRound },
                  { id: 'logs',         label: 'Logs IA',          icon: Activity },
                ].map(t => (
                  <TabsTrigger 
                    key={t.id} 
                    value={t.id} 
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-vj-txt data-[state=active]:0_2px_10px_rgba(0,0,0,0.05)] text-zinc-500 hover:text-zinc-800 whitespace-nowrap flex items-center"
                  >
                    <t.icon className="w-3.5 h-3.5 mr-2 shrink-0" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <TabsContent value="agents" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AgentesTab /></TabsContent>
          <TabsContent value="knowledge" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KnowledgeTab /></TabsContent>
          <TabsContent value="kanban" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KanbanTab /></TabsContent>
          <TabsContent value="billing" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><BillingTab /></TabsContent>
          <TabsContent value="integrations" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><IntegrationsTab /></TabsContent>
          <TabsContent value="csv-import" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><CsvImporter isTab /></TabsContent>
          <TabsContent value="guides" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Guides isTab /></TabsContent>
          <TabsContent value="hotels" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Hotels isTab /></TabsContent>
          <TabsContent value="destinations" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Destinations isTab /></TabsContent>
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
                      <SelectTrigger className="h-12 rounded-xl border-zinc-100 bg-zinc-50 font-medium">
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
                    <Input type="password" placeholder="••••••••••••••••" value={apiKey} onChange={e => setApiKey(e.target.value)} className="h-12 rounded-xl border-zinc-100 bg-zinc-50" />
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
                       <div key={k.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group">
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
                    <Textarea placeholder="Cole aqui as regras de pagamento ou cancelamento..." value={policyConteudo} onChange={e => setPolicyConteudo(e.target.value)} rows={7} className="rounded-xl border-zinc-100" />
                    <Button className="w-full premium-button h-12" onClick={() => createPolicy.mutate({ operadora: policyOperadora, operadora_display: policyDisplay, conteudo: policyConteudo })}>Cachear Regras</Button>
                 </CardContent>
              </Card>
              <Card className="premium-card">
                <CardHeader><CardTitle className="text-lg">Políticas Verificadas</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {policies?.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
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
