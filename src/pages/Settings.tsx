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
  UserX, Grip, Pencil, Check, X, Database, ArrowRight, ArrowUpRight, Activity, Bus
} from 'lucide-react';
import { useAiKeys, useSaveAiKey, useDeleteAiKey } from '@/hooks/useAiKeys';
import { usePolicies, useCreatePolicy, useDeletePolicy } from '@/hooks/usePoliciesAndExperiences';
import { useKnowledgeBase, useUpsertKnowledge, useDeleteKnowledge } from '@/hooks/useKnowledgeBase';
import { useAiDecisionLogs } from '@/hooks/useQuotationScenarios';
import {
  useTeamMembers, useInviteAgent, useUpdateMemberRole,
  useKanbanBoardColumns, useCreateKanbanColumnInBoard,
  useUpdateKanbanColumn, useDeleteKanbanColumn,
} from '@/hooks/useSettings';
import { useB2bCredentials, useSaveB2bCredential, useEmailInbound } from '@/hooks/useB2bCredentials';
import { useBusLayouts, useCreateBusLayout, useDeleteBusLayout } from '@/hooks/useBusLayouts';
import { BusSeatMap } from '@/components/group-trips/BusSeatMap';
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
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white group hover: transition-shadow">
      <div className="h-4 w-4 rounded-full border-2 border-white  shrink-0" style={{ backgroundColor: color }} />
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
  const [boardSlug, setBoardSlug] = useState<'sales' | 'departures' | 'tasks'>('sales');
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
        {(['sales', 'departures', 'tasks'] as const).map(b => (
          <button key={b} onClick={() => setBoardSlug(b)} className={cn(
            "w-full p-5 rounded-[32px] text-left border transition-all duration-300",
            boardSlug === b ? "bg-vj-txt text-white  " : "bg-white border-zinc-100 hover:bg-zinc-50"
          )}>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Board</p>
            <p className="text-base font-bold">{b === 'sales' ? 'Vendas (CRM)' : b === 'departures' ? 'Embarques' : 'Tarefas do Dia'}</p>
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

/* ── Aba Logs de Decisão IA ───────────────────────────────── */
function AiLogsTab() {
  const { data: logs, isLoading } = useAiDecisionLogs(50);
  const AGENT_COLORS: Record<string, string> = {
    'ai-chat-agent': 'bg-blue-50 text-blue-700 border-blue-200',
    'interpret-request': 'bg-purple-50 text-purple-700 border-purple-200',
    'score-quotation': 'bg-amber-50 text-amber-700 border-amber-200',
    'extract-quotation': 'bg-green-50 text-green-700 border-green-200',
    'generate-embedding': 'bg-zinc-50 text-zinc-600 border-zinc-200',
  };
  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-4 w-4 text-vj-green" />
          Painel de Auditoria IA
        </CardTitle>
        <CardDescription>Registro completo de todas as decisões tomadas pelos agentes de IA da sua agência.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
        ) : !logs?.length ? (
          <div className="text-center py-20 opacity-20"><Activity size={40} className="mx-auto" /></div>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white hover: transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${AGENT_COLORS[log.agent_name] ?? 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
                      {log.agent_name}
                    </span>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest">{log.decision_type}</span>
                    {log.confidence_score != null && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.confidence_score >= 0.8 ? 'bg-green-50 text-green-700' : log.confidence_score >= 0.5 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-500'}`}>
                        {(log.confidence_score * 100).toFixed(0)}% conf.
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 flex-shrink-0">{new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <p className="text-xs text-zinc-600 mt-2 line-clamp-1"><span className="text-zinc-400 font-semibold mr-1">↳</span>{log.output_summary}</p>
                {log.input_summary && <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">Input: {log.input_summary}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Aba Integrações B2B + Gmail ──────────────────────── */
function IntegrationsTab() {
  const { data: creds, isLoading: credsLoading } = useB2bCredentials();
  const saveB2b = useSaveB2bCredential();
  const { data: emails, isLoading: emailsLoading } = useEmailInbound(20);

  const [b2bPortal, setB2bPortal] = useState('orinter');
  const [b2bUser, setB2bUser] = useState('');
  const [b2bPass, setB2bPass] = useState('');

  const handleSaveB2b = async () => {
    if (!b2bUser.trim() || !b2bPass.trim()) return;
    await saveB2b.mutateAsync({ portal_name: b2bPortal, username: b2bUser, password: b2bPass });
    setB2bUser(''); setB2bPass('');
  };

  const intentBadge: Record<string, string> = {
    new_lead: 'bg-vj-green/10 text-vj-green',
    ticket_reply: 'bg-blue-50 text-blue-600',
    operator_invoice: 'bg-yellow-50 text-yellow-700',
    '2fa_code': 'bg-red-50 text-red-600',
    other: 'bg-zinc-100 text-zinc-500',
  };
  const intentLabel: Record<string, string> = {
    new_lead: '✈ Novo Lead', ticket_reply: '↩ Resposta', operator_invoice: '📄 Fatura', '2fa_code': '🔑 2FA Code', other: 'Outro'
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cofre B2B */}
        <Card className="premium-card overflow-hidden">
          <div className="p-1.5 bg-zinc-950 text-white font-mono text-[10px] text-center uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-vj-green" /> Cofre de Credenciais RPA
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Portais B2B (Orinter/Flytour)</CardTitle>
            <CardDescription>Credenciais usadas pelo Playwright para cotar e emitir pacotes automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Portal</Label>
              <select className="flex h-12 w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-2 text-sm font-medium" value={b2bPortal} onChange={e => setB2bPortal(e.target.value)}>
                <option value="orinter">Orinter / Infotravel</option>
                <option value="flytour">Flytour</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Usuário B2B</Label>
              <Input placeholder="usuario.agencia@operadora.com.br" value={b2bUser} onChange={e => setB2bUser(e.target.value)} className="h-12 rounded-2xl border-zinc-100 bg-zinc-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Senha / Token de Acesso</Label>
              <Input type="password" placeholder="••••••••••••••••" value={b2bPass} onChange={e => setB2bPass(e.target.value)} className="h-12 rounded-2xl border-zinc-100 bg-zinc-50" />
            </div>
            <Button className="w-full premium-button h-12" onClick={handleSaveB2b} disabled={!b2bUser || !b2bPass || saveB2b.isPending}>
              {saveB2b.isPending ? 'Salvando no Cofre...' : 'Salvar Credencial Segura'}
            </Button>
            {/* Lista de Credenciais Salvas */}
            {!credsLoading && creds && creds.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Acessos Ativos</p>
                {creds.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="h-2 w-2 rounded-full bg-vj-green animate-pulse" />
                    <span className="text-xs font-bold uppercase flex-1">{c.portal_name}</span>
                    <span className="text-xs text-muted-foreground">{c.username}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gmail / Webhook info */}
        <Card className="premium-card overflow-hidden">
          <div className="p-1.5 bg-blue-600 text-white font-mono text-[10px] text-center uppercase tracking-widest">
            Endpoint da Extensão Gmail (Leitura Inteligente)
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Integração Gmail + 2FA Automático</CardTitle>
            <CardDescription>Cole este webhook na sua extensão do Chrome. A IA classifica cada e-mail e age: cria leads, responde tickets, captura códigos 2FA da Orinter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-2xl">
              <code className="text-[11px] font-mono select-all break-all text-vj-green block">
                https://xhdoupxnpjbzkzuhucpp.supabase.co/functions/v1/email-webhook-ingest
              </code>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {['✈ Novo Lead → Kanban', '🔑 2FA → Python RPA', '↩ Reply → Ticket'].map(label => (
                <div key={label} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-[10px] font-bold text-vj-txt leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              Versão v3 da edge function ativa — classifica com IA em tempo real + Regex Fallback sem custo.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feed de Emails Inbound */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" /> Caixa de Entrada Inteligente
          </CardTitle>
          <CardDescription>Emails recebidos e classificados automaticamente pela IA da Turis.</CardDescription>
        </CardHeader>
        <CardContent>
          {emailsLoading ? <Skeleton className="h-40 w-full" /> :
            !emails?.length ? (
              <div className="text-center py-16 opacity-30">
                <Mail size={48} className="mx-auto mb-3" />
                <p className="text-sm">Nenhum email ingerido ainda. Configure o Webhook acima.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-none">
                {emails.map((em: any) => (
                  <div key={em.id} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${intentBadge[em.ai_intent] ?? intentBadge.other}`}>
                          {intentLabel[em.ai_intent] ?? 'Outro'}
                        </span>
                        <span className="text-[10px] text-zinc-400">{em.sender_email}</span>
                        {em.ai_confidence && <span className="text-[9px] font-mono text-zinc-400">{(em.ai_confidence * 100).toFixed(0)}% conf.</span>}
                      </div>
                      <p className="text-xs font-bold text-zinc-800 truncate">{em.subject}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{em.ai_summary}</p>
                    </div>
                    <p className="text-[9px] text-zinc-400 flex-shrink-0 pt-1">
                      {new Date(em.received_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Aba Layouts de Ônibus ────────────────────────────────────────────────── */
function BusLayoutTab() {
  const { data: layouts, isLoading } = useBusLayouts();
  const create = useCreateBusLayout();
  const remove = useDeleteBusLayout();

  const [form, setForm] = useState({
    name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '',
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await create.mutateAsync(form);
    setForm({ name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '' });
  };

  const vehicleEmoji: Record<string, string> = {
    bus: '🚌', van: '🚐', plane: '✈️', boat: '⛵',
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Create form */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-4 w-4 text-vj-green" /> Novo Layout de Ônibus
          </CardTitle>
          <CardDescription>
            Defina a configuração de assentos gerada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome do layout *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Comil Campione 45 lugares" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Tipo de veículo</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm mt-1"
              value={form.vehicle_type}
              onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
            >
              <option value="bus">🚌 Ônibus</option>
              <option value="van">🚐 Van</option>
              <option value="plane">✈️ Avião</option>
              <option value="boat">⛵ Barco</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fileiras</Label>
              <Input type="number" min={3} max={20} value={form.rows}
                onChange={e => setForm(p => ({ ...p, rows: Number(e.target.value) }))}
                className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Colunas (sem corredor)</Label>
              <Input type="number" min={2} max={6} value={form.cols}
                onChange={e => setForm(p => ({ ...p, cols: Number(e.target.value) }))}
                className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label>Notas internas</Label>
            <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Ex: Ônibus da Cooperativa Sul" className="rounded-xl mt-1" />
          </div>
          <p className="text-xs text-zinc-400">
            Layout com corredor central gerado automaticamente.
            Aprox. {(form.rows - 1) * (form.cols - 1)} assentos + WC.
          </p>
          <Button className="w-full" onClick={handleCreate} disabled={!form.name.trim() || create.isPending}>
            {create.isPending ? 'Criando...' : <><Plus size={14} className="mr-1" /> Criar Layout</>}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">Layouts cadastrados</h3>
        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : !layouts?.length ? (
          <Card className="premium-card">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bus size={36} className="text-zinc-200 mb-2" />
              <p className="text-sm text-zinc-400">Nenhum layout criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          layouts.map(layout => (
            <Card key={layout.id} className="premium-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{vehicleEmoji[layout.vehicle_type] ?? '🚌'}</span>
                    {layout.name}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg"
                      onClick={() => setPreview(preview === layout.id ? null : layout.id)}>
                      {preview === layout.id ? 'Ocultar' : 'Preview'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                      onClick={() => { if (confirm('Remover layout?')) remove.mutate(layout.id); }}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-zinc-400">
                  {layout.rows} fileiras × {layout.cols} colunas · {layout.vehicle_type}
                </p>
                {layout.notes && <p className="text-xs text-zinc-500 mt-0.5">{layout.notes}</p>}
                {preview === layout.id && layout.seat_map && (
                  <div className="mt-4 overflow-x-auto">
                    <BusSeatMap
                      layout={{ rows: layout.rows, cols: layout.cols, seat_map: layout.seat_map }}
                      occupied={[]}
                      selected={[]}
                      maxSelect={0}
                      onSelect={() => {}}
                      readOnly
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
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
              { id: 'agents',       label: 'Equipe',     icon: Users },
              { id: 'aikeys',       label: 'Chaves IA',  icon: Key },
              { id: 'knowledge',    label: 'Especialista', icon: Brain },
              { id: 'policies',     label: 'Operadoras', icon: Database },
              { id: 'kanban',       label: 'Board',      icon: Columns },
              { id: 'integrations', label: 'Webhooks',   icon: Mail },
              { id: 'bus',          label: 'Ônibus',     icon: Bus },
              { id: 'logs',         label: 'Logs IA',    icon: Activity },
            ].map(t => (
              <TabsTrigger 
                key={t.id} 
                value={t.id} 
                className="px-8 py-3 rounded-[24px] text-xs font-bold uppercase tracking-widest transition-all data-[state=active]:bg-vj-txt data-[state=active]:text-white data-[state=active]:"
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
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="bus" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BusLayoutTab />
          </TabsContent>

          <TabsContent value="logs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AiLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
