import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Key, Users, Columns, Settings as SettingsIcon, Trash2, Brain,
  Plus, ChevronDown, ChevronRight, Mail, Shield, UserCheck,
  UserX, Grip, Pencil, Check, X, Database, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { usePolicies, useCreatePolicy, useDeletePolicy } from '@/hooks/usePoliciesAndExperiences';
import { useKnowledgeBase, useUpsertKnowledge, useDeleteKnowledge } from '@/hooks/useKnowledgeBase';
import {
  useTeamMembers, useInviteAgent, useUpdateMemberRole,
  useKanbanBoardColumns, useCreateKanbanColumnInBoard,
  useUpdateKanbanColumn, useDeleteKanbanColumn,
} from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

/* ── Aba Agentes ─────────────────────────────────────────── */
function AgentesTab() {
  const { data: members, isLoading } = useTeamMembers();
  const inviteAgent = useInviteAgent();
  const updateRole = useUpdateMemberRole();
  const { profile } = useAuthStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteAgent.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
    setInviteEmail('');
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = { admin: 'Admin', manager: 'Gerente', agent: 'Agente' };
    return map[role] ?? role;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4 text-vj-green" /> Convidar Membro
          </CardTitle>
          <CardDescription>O usuário receberá um email para criar sua conta na agência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="agente@turisagencias.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="rounded-xl border-zinc-200"
          />
          <select
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
          >
            <option value="agent">Agente de Viagens</option>
            <option value="manager">Gerente</option>
            <option value="admin">Administrador</option>
          </select>
          <Button
            className="w-full premium-button"
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || inviteAgent.isPending}
          >
            {inviteAgent.isPending ? 'Enviando...' : 'Enviar Convite'}
          </Button>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg">Equipe Atual</CardTitle>
          <CardDescription>{members?.length ?? 0} profissionais ativos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            members?.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="h-8 w-8 rounded-full bg-vj-green/10 flex items-center justify-center text-[10px] font-bold text-vj-green">
                  {m.first_name?.[0] ?? m.email[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{m.first_name ?? m.email}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{roleLabel(m.role)}</p>
                </div>
                {profile?.id !== m.id && (
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={() => updateRole.mutate({ profileId: m.id, is_active: !m.is_active })}>
                     {m.is_active ? <UserX size={14} /> : <UserCheck size={14} className="text-vj-green" />}
                   </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Aba Conhecimento IA (RAG) ──────────────────────────── */
function KnowledgeTab() {
  const { data: kb, isLoading } = useKnowledgeBase();
  const upsert = useUpsertKnowledge();
  const remove = useDeleteKnowledge();
  const [content, setContent] = useState('');

  const handleSave = async () => {
    if (!content.trim()) return;
    await upsert.mutateAsync({ content: content.trim() });
    setContent('');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-4 w-4 text-vj-green" /> Treinar Especialista IA
          </CardTitle>
          <CardDescription>Ensine a IA sobre seus pacotes exclusivos, regras de cancelamento ou tom de voz da agência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Ex: Nossa agência foca em luxo acessível. Priorizamos sempre a rede Belmond..." 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            rows={10}
            className="rounded-2xl border-zinc-200 resize-none"
          />
          <Button className="w-full premium-button h-12" disabled={!content.trim() || upsert.isPending} onClick={handleSave}>
            <Plus className="w-4 h-4 mr-2" /> {upsert.isPending ? 'Indexando Conhecimento...' : 'Treinar Turis AI'}
          </Button>
        </CardContent>
      </Card>

      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg">Inteligência Adquirida</CardTitle>
          <CardDescription>Base de conhecimento vetorial ativa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
            {isLoading ? <Skeleton className="h-24 w-full" /> : 
             !kb?.length ? <div className="text-center py-20 text-muted-foreground text-sm italic">Nenhum treinamento realizado ainda.</div> :
             kb.map((doc: any) => (
               <div key={doc.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 relative group animate-in fade-in zoom-in duration-300">
                  <p className="text-xs text-vj-txt leading-relaxed line-clamp-4">"{doc.content}"</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">v_{doc.id.substring(0,6)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove.mutate(doc.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
               </div>
             ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Aba Kanban ──────────────────────────────────────────── */
function ColumnRow({ col, onDelete }: { col: any; onDelete: (id: string) => void }) {
  const updateColumn = useUpdateKanbanColumn();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(col.name);
  const [color, setColor] = useState(col.color ?? '#22c55e');

  const handleSave = async () => {
    await updateColumn.mutateAsync({ id: col.id, name, color });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white group hover:shadow-md transition-shadow">
      <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: color }} />
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input value={name} onChange={e => setName(e.target.value)} className="h-8 rounded-lg text-xs" autoFocus />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0" />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-vj-green" onClick={handleSave}><Check size={14} /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400" onClick={() => setEditing(false)}><X size={14} /></Button>
        </div>
      ) : (
        <>
          <span className="text-sm font-bold text-vj-txt flex-1">{col.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}><Pencil size={13} /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => onDelete(col.id)}><Trash2 size={13} /></Button>
          </div>
        </>
      )}
    </div>
  );
}

function KanbanTab() {
  const [boardSlug, setBoardSlug] = useState<'sales' | 'departures'>('sales');
  const { data, isLoading } = useKanbanBoardColumns(boardSlug);
  const createColumn = useCreateKanbanColumnInBoard();
  const deleteColumn = useDeleteKanbanColumn();

  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || !data?.board) return;
    const maxPos = Math.max(0, ...(data.columns ?? []).map((c: any) => c.position)) + 1;
    await createColumn.mutateAsync({ board_id: data.board.id, name: newName.trim(), color: '#22c55e', position: maxPos });
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="space-y-3">
        {(['sales', 'departures'] as const).map(b => (
          <button key={b} onClick={() => setBoardSlug(b)} className={cn(
            "w-full p-6 rounded-[32px] text-left border transition-all duration-300",
            boardSlug === b ? "bg-vj-txt text-white shadow-xl shadow-zinc-950/20" : "bg-white border-zinc-100 hover:bg-zinc-50"
          )}>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Board</p>
            <p className="text-lg font-bold">{b === 'sales' ? 'Vendas' : 'Embarques'}</p>
          </button>
        ))}
      </div>

      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Colunas do Board</h3>
          <Button variant="ghost" size="sm" className="rounded-xl text-vj-green hover:bg-vj-green/5" onClick={() => setAdding(true)}>
             <Plus size={14} className="mr-2" /> Adicionar Estágio
          </Button>
        </div>

        <div className="space-y-2">
           {isLoading ? <Skeleton className="h-40 w-full" /> : data?.columns?.map((c: any) => (
             <ColumnRow key={c.id} col={c} onDelete={id => deleteColumn.mutate(id)} />
           ))}
           {adding && (
             <div className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-vj-green bg-vj-green/[0.02] animate-in slide-in-from-top-2">
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da fase..." className="h-9 rounded-xl text-xs" autoFocus />
                <Button variant="ghost" size="icon" className="h-9 w-9 text-vj-green" onClick={handleAdd}><Check size={16} /></Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Settings Page ───────────────────────────────────── */
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
          <TabsList className="bg-zinc-100/50 p-1.5 rounded-[32px] flex gap-1 mb-10 border border-zinc-200/50 backdrop-blur-md w-fit mx-auto">
            {[
              { id: 'agents', label: 'Equipe', icon: Users },
              { id: 'aikeys', label: 'Chaves IA', icon: Key },
              { id: 'knowledge', label: 'Especialista', icon: Brain },
              { id: 'policies', label: 'Operadoras', icon: Database },
              { id: 'kanban', label: 'Board', icon: Columns },
              { id: 'integrations', label: 'Webhooks', icon: Mail },
            ].map(t => (
              <TabsTrigger 
                key={t.id} 
                value={t.id} 
                className="px-8 py-3 rounded-[24px] text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-vj-txt data-[state=active]:text-white data-[state=active]:shadow-xl"
              >
                <t.icon className="w-3.5 h-3.5 mr-2" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="agents" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><AgentesTab /></TabsContent>
          <TabsContent value="knowledge" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KnowledgeTab /></TabsContent>
          <TabsContent value="kanban" className="animate-in fade-in slide-in-from-bottom-4 duration-500"><KanbanTab /></TabsContent>
          
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
                    <select className="flex h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium" value={provider} onChange={e => setProvider(e.target.value)}>
                      <option value="OpenRouter">OpenRouter (Acesso Total)</option>
                      <option value="Gemini">Google Gemini (Visão)</option>
                    </select>
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

          <TabsContent value="integrations" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="premium-card overflow-hidden">
               <div className="p-1.5 bg-zinc-950 text-green-400 font-mono text-[10px] text-center uppercase tracking-widest">Serviço de Ingestão Autônomo Ativo</div>
               <CardHeader><CardTitle className="text-lg">Email & Webhooks Hub</CardTitle></CardHeader>
               <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Endpoint de Captura</p>
                    <div className="bg-zinc-100 p-6 rounded-3xl border border-zinc-200 group relative">
                       <code className="text-[11px] font-mono select-all break-all text-zinc-600 block pr-12">
                         https://xhdoupxnpjbzkzuhucpp.supabase.co/functions/v1/email-webhook-ingest
                       </code>
                       <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl group-hover:bg-white transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                       </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">Redirecione seus emails do Gmail ou automações do Zapier/Make para este endereço para processamento em tempo real.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                    <div className="p-4 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                       <div>
                         <p className="text-sm font-bold">Automação de Datalake</p>
                         <p className="text-[10px] text-muted-foreground">Transformar emails em leads/tickets</p>
                       </div>
                       <div className="w-10 h-5 bg-vj-green rounded-full relative shadow-inner">
                         <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                       </div>
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
