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
  UserX, Grip, Pencil, Check, X,
} from 'lucide-react';
import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { usePolicies, useCreatePolicy, useDeletePolicy } from '@/hooks/usePoliciesAndExperiences';
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

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-700 border-red-200';
    if (role === 'manager') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-vj-bg text-vj-txt3 border-vj-border';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Formulário de convite */}
      <Card className="border-vj-border shadow-sm">
        <CardHeader className="bg-vj-bg border-b border-vj-border">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4 text-vj-green" /> Convidar Membro
          </CardTitle>
          <CardDescription>O usuário receberá um email para criar sua conta na agência.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="agente@agencia.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Função</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
            >
              <option value="agent">Agente de Viagens</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button
            className="w-full bg-vj-green text-white hover:bg-vj-green/90"
            onClick={handleInvite}
            disabled={!inviteEmail.trim() || inviteAgent.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            {inviteAgent.isPending ? 'Enviando...' : 'Enviar Convite'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            O convite expira em 24 horas.
          </p>
        </CardContent>
      </Card>

      {/* Lista de membros */}
      <Card className="border-vj-border shadow-sm">
        <CardHeader className="bg-vj-bg border-b border-vj-border">
          <CardTitle className="text-lg">Equipe Atual</CardTitle>
          <CardDescription>{members?.length ?? 0} {members?.length === 1 ? 'membro' : 'membros'} na agência.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : !members?.length ? (
            <div className="text-center py-8 border border-dashed border-vj-border rounded-xl bg-muted/20">
              <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ainda não há membros cadastrados.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-vj-border bg-vj-bg">
                  <div className="h-8 w-8 rounded-full bg-vj-green/10 border border-vj-green/20 flex items-center justify-center text-sm font-bold text-vj-green shrink-0">
                    {m.first_name?.[0]?.toUpperCase() ?? m.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-vj-txt truncate">
                      {m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.email}
                    </p>
                    <p className="text-xs text-vj-txt3 truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={cn('text-[10px] border', roleColor(m.role))}>
                      {roleLabel(m.role ?? 'agent')}
                    </Badge>
                    {profile?.id !== m.id && (
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => updateRole.mutate({ profileId: m.id, is_active: !m.is_active })}
                        title={m.is_active ? 'Desativar membro' : 'Reativar membro'}
                      >
                        {m.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5 text-green-500" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── CRUD Coluna per row ───────────────────────────────────── */
function ColumnRow({ col, onDelete }: { col: any; onDelete: (id: string) => void }) {
  const updateColumn = useUpdateKanbanColumn();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(col.name);
  const [color, setColor] = useState(col.color ?? '#6B7280');

  const handleSave = async () => {
    await updateColumn.mutateAsync({ id: col.id, name, color });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-vj-border bg-vj-bg group">
      <div className="h-3 w-3 rounded-full shrink-0 border border-white shadow-sm" style={{ backgroundColor: color }} />
      {editing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            className="h-7 text-sm border-vj-border flex-1"
            autoFocus
          />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer border-0 p-0" />
          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSave} disabled={updateColumn.isPending}><Check size={13} /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-vj-txt3" onClick={() => setEditing(false)}><X size={13} /></Button>
        </div>
      ) : (
        <>
          <span className="text-sm font-medium text-vj-txt flex-1">{col.name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}><Pencil size={12} /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => onDelete(col.id)}><Trash2 size={12} /></Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Aba Kanban ──────────────────────────────────────────── */
function KanbanTab() {
  const [boardSlug, setBoardSlug] = useState<'sales' | 'departures'>('sales');
  const { data, isLoading } = useKanbanBoardColumns(boardSlug);
  const createColumn = useCreateKanbanColumnInBoard();
  const deleteColumn = useDeleteKanbanColumn();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6B7280');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || !data?.board) return;
    const maxPos = Math.max(0, ...(data.columns ?? []).map((c: any) => c.position)) + 1;
    await createColumn.mutateAsync({ board_id: data.board.id, name: newName.trim(), color: newColor, position: maxPos });
    setNewName('');
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta coluna? Os cards serão removidos junto.')) return;
    await deleteColumn.mutateAsync(id);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Seletor de board */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-vj-txt3">Board</p>
        {(['sales', 'departures'] as const).map(b => (
          <button key={b} onClick={() => setBoardSlug(b)}
            className={cn('w-full text-left p-3 rounded-xl border text-sm font-medium transition-colors',
              boardSlug === b
                ? 'bg-vj-green/10 border-vj-green/30 text-vj-green'
                : 'bg-vj-bg border-vj-border text-vj-txt hover:bg-muted/30'
            )}>
            {b === 'sales' ? '📊 Pipeline de Vendas' : '✈️ Gestor de Embarques'}
          </button>
        ))}
      </div>

      {/* Colunas */}
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-vj-txt3">
            Colunas — {boardSlug === 'sales' ? 'Pipeline de Vendas' : 'Gestor de Embarques'}
          </p>
          <Button size="sm" variant="outline" className="border-vj-border" onClick={() => setAdding(true)}>
            <Plus size={13} className="mr-1" /> Nova Coluna
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
        ) : !data?.board ? (
          <div className="text-center py-8 border border-dashed border-vj-border rounded-xl text-sm text-muted-foreground">
            Board não encontrado. Acesse o Kanban para inicializá-lo.
          </div>
        ) : (
          <div className="space-y-2">
            {(data.columns ?? []).map((col: any) => (
              <ColumnRow key={col.id} col={col} onDelete={handleDelete} />
            ))}
            {adding && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-vj-green/40 bg-vj-green/5">
                <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                  className="h-7 w-7 rounded cursor-pointer border-0 p-0 shrink-0" />
                <Input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Nome da coluna" className="h-7 text-sm border-vj-border flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') void handleAdd(); if (e.key === 'Escape') setAdding(false); }} />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => void handleAdd()} disabled={createColumn.isPending}><Check size={13} /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-vj-txt3" onClick={() => setAdding(false)}><X size={13} /></Button>
              </div>
            )}
          </div>
        )}
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
  const [limit, setLimit] = useState('');
  const [policyOperadora, setPolicyOperadora] = useState('');
  const [policyDisplay, setPolicyDisplay] = useState('');
  const [policyTipo, setPolicyTipo] = useState('condicoes_gerais');
  const [policyConteudo, setPolicyConteudo] = useState('');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const handleSaveKey = async () => {
    if (!apiKey) return;
    await saveKey.mutateAsync({ provider: provider.toLowerCase(), api_key: apiKey, monthly_limit_usd: limit ? parseFloat(limit) : undefined });
    setApiKey('');
    setLimit('');
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2 text-vj-green">
            <SettingsIcon className="h-6 w-6" /> Configurações da Agência
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie sua equipe, chaves de IA, políticas de operadoras e colunas do kanban.
          </p>
        </div>

        <Tabs defaultValue="aikeys" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl bg-vj-bg border border-vj-border">
            <TabsTrigger value="agents"><Users className="mr-2 h-4 w-4" />Agentes</TabsTrigger>
            <TabsTrigger value="aikeys"><Key className="mr-2 h-4 w-4" />Chaves IA</TabsTrigger>
            <TabsTrigger value="policies"><Brain className="mr-2 h-4 w-4" />Operadoras</TabsTrigger>
            <TabsTrigger value="kanban"><Columns className="mr-2 h-4 w-4" />Kanban</TabsTrigger>
            <TabsTrigger value="integrations"><Mail className="mr-2 h-4 w-4" />Integrações</TabsTrigger>
          </TabsList>

          {/* ── TAB: Agentes ── */}
          <TabsContent value="agents" className="mt-6"><AgentesTab /></TabsContent>

          {/* ── TAB: AI Keys ── */}
          <TabsContent value="aikeys" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg">Adicionar Nova Chave</CardTitle>
                  <CardDescription>Pool round-robin: a org usa a chave com mais créditos disponíveis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">Provedor</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={provider} onChange={e => setProvider(e.target.value)}>
                      <option value="OpenRouter">OpenRouter (acesso a todos os modelos)</option>
                      <option value="Gemini">Google Gemini (extração PDF/Imagem)</option>
                      <option value="Groq">Groq (ultra-rápido)</option>
                      <option value="OpenAI">OpenAI GPT-4o</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">API Key *</Label>
                    <Input type="password" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Limite Mensal (USD, opcional)</Label>
                    <Input type="number" placeholder="Ex: 50.00" value={limit} onChange={e => setLimit(e.target.value)} />
                  </div>
                  <Button className="w-full mt-2" onClick={handleSaveKey} disabled={!apiKey || saveKey.isPending}>
                    {saveKey.isPending ? 'Validando...' : 'Salvar Chave no Pool'}
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg">Pool Ativo</CardTitle>
                  <CardDescription>Chaves disponíveis para o V-Agent e extrator de cotações.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
                  ) : !keys?.length ? (
                    <div className="text-center py-8 border border-dashed border-vj-border rounded-lg bg-muted/20">
                      <Key className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma chave cadastrada. O V-Agent está desativado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {keys.map((k: any) => (
                        <div key={k.id} className="flex items-center justify-between p-3 rounded-lg border border-vj-border bg-vj-bg">
                          <div>
                            <p className="font-semibold text-sm capitalize">{k.provider}</p>
                            <p className="text-xs text-muted-foreground font-mono">{k.api_key.substring(0, 4)}...{k.api_key.substring(k.api_key.length - 4)}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteKey.mutate(k.id)} disabled={deleteKey.isPending}>
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

          {/* ── TAB: Políticas / Operadoras ── */}
          <TabsContent value="policies" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-4 w-4 text-vj-green" /> Adicionar ao Cache</CardTitle>
                  <CardDescription>Economize tokens de IA cacheando políticas de operadoras recorrentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold">Operadora (slug) *</Label>
                      <Input placeholder="ex: orinter" value={policyOperadora} onChange={e => setPolicyOperadora(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Nome Exibição</Label>
                      <Input placeholder="ex: Orinter Tour" value={policyDisplay} onChange={e => setPolicyDisplay(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Tipo de Política</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={policyTipo} onChange={e => setPolicyTipo(e.target.value)}>
                      <option value="condicoes_gerais">Condições Gerais</option>
                      <option value="cancelamento_hotel">Cancelamento de Hotel</option>
                      <option value="cancelamento_aereo">Cancelamento Aéreo</option>
                      <option value="taxas_locais">Taxas Locais / Resort Fee</option>
                      <option value="regras_tarifa">Regras de Tarifa</option>
                      <option value="condicoes_seguro">Condições de Seguro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Conteúdo JSON ou Texto *</Label>
                    <Textarea placeholder={'{\n  "condicoes_pagamento": "...",\n  "taxas_locais_aviso": "..."\n}'} value={policyConteudo} onChange={e => setPolicyConteudo(e.target.value)} rows={7} className="font-mono text-xs resize-none" />
                  </div>
                  <Button className="w-full bg-vj-green text-white hover:bg-vj-green/90" disabled={!policyOperadora || !policyConteudo || createPolicy.isPending}
                    onClick={async () => {
                      let conteudo: any;
                      try { conteudo = JSON.parse(policyConteudo); } catch { conteudo = { texto: policyConteudo }; }
                      await createPolicy.mutateAsync({ operadora: policyOperadora, operadora_display: policyDisplay, tipo: policyTipo, conteudo });
                      setPolicyOperadora(''); setPolicyDisplay(''); setPolicyConteudo('');
                    }}>
                    <Plus className="mr-2 h-4 w-4" />{createPolicy.isPending ? 'Salvando...' : 'Salvar no Cache'}
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-vj-border shadow-sm">
                <CardHeader className="bg-vj-bg border-b border-vj-border">
                  <CardTitle className="text-lg">Políticas em Cache</CardTitle>
                  <CardDescription>Cada política evita re-extração em cotações da mesma operadora.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {policiesLoading ? (
                    <div className="space-y-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>
                  ) : !policies?.length ? (
                    <div className="text-center py-8 border border-dashed border-vj-border rounded-lg bg-muted/20">
                      <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma política em cache.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {policies.map((p: any) => (
                        <div key={p.id} className="border border-vj-border rounded-lg overflow-hidden">
                          <div className="flex items-center justify-between p-3 bg-vj-bg">
                            <button onClick={() => setExpandedPolicy(expandedPolicy === p.id ? null : p.id)} className="flex items-center gap-2 text-left flex-1 min-w-0">
                              {expandedPolicy === p.id ? <ChevronDown size={14} className="text-vj-txt3 shrink-0" /> : <ChevronRight size={14} className="text-vj-txt3 shrink-0" />}
                              <div className="min-w-0">
                                <p className="font-semibold text-sm capitalize">{p.operadora_display || p.operadora}</p>
                                <Badge variant="outline" className="text-[10px] mt-0.5 border-vj-border">{p.tipo}</Badge>
                              </div>
                            </button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => deletePolicy.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                          {expandedPolicy === p.id && (
                            <div className="p-3 border-t border-vj-border bg-white">
                              <pre className="text-xs text-vj-txt3 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">{JSON.stringify(p.conteudo, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── TAB: Kanban Columns ── */}
          <TabsContent value="kanban" className="mt-6">
            <Card className="border-vj-border shadow-sm">
              <CardHeader className="bg-vj-bg border-b border-vj-border">
                <CardTitle className="text-lg flex items-center gap-2"><Columns className="h-4 w-4 text-vj-green" /> Colunas dos Boards</CardTitle>
                <CardDescription>Personalize as etapas de cada board. Arraste para reordenar (em breve).</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <KanbanTab />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Integrações (Email) ── */}
          <TabsContent value="integrations" className="mt-6">
            <Card className="border-vj-border shadow-sm">
              <CardHeader className="bg-vj-bg border-b border-vj-border">
                <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-4 w-4 text-vj-green" /> Email Intelligence (GMail)</CardTitle>
                <CardDescription>Configure a ingestão de emails para o Turis Agências gerenciar e criar tickets automáticos com IA.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-md text-sm text-blue-900">
                  <p className="font-semibold mb-1">Endpoint de Ingestão (Webhook URL)</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border border-blue-100 select-all font-mono block mb-2 break-all">
                    https://xhdoupxnpjbzkzuhucpp.supabase.co/functions/v1/email-webhook-ingest
                  </code>
                  <p className="text-xs text-blue-700">Aponte o forwarding do seu Gmail ou serviços de automação (Make/Zapier) para esta URL enviando o payload JSON.</p>
                </div>
                <div className="border border-vj-border rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-vj-txt">Abertura de Ticket Inteligente (IA)</p>
                      <p className="text-xs text-vj-txt3 mt-0.5 max-w-[80%]">A IA analisa todos os emails e gera Tickets de urgência automaticamente (Ex: Cancelamentos).</p>
                    </div>
                    {/* Placeholder switch visual in enabled state */}
                    <div className="w-10 h-5 bg-vj-green rounded-full relative shadow-inner">
                       <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm"></div>
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
