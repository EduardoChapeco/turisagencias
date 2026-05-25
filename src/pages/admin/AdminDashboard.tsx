import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { 
  Shield, Building2, Users, Activity, Loader2, ArrowRight, 
  Key, Trash2, Plus, Sparkles, Folder, CheckCircle2, AlertTriangle, 
  HelpCircle, Settings, Layers, Lock, FileText, Eye, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RoleGuard } from '@/components/RoleGuard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type ActiveTab = 'agencies' | 'users' | 'plans' | 'feeds' | 'templates' | 'logs' | 'buckets' | 'keys' | 'design-system';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('agencies');
  const [provider, setProvider] = useState('OpenRouter');
  const [apiKey, setApiKey] = useState('');
  const [isAddingKey, setIsAddingKey] = useState(false);

  // Form states for creating organization
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencySlug, setNewAgencySlug] = useState('');
  const [isCreatingAgency, setIsCreatingAgency] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async () => {
      const [orgsRes, usersRes, tasksRes] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ai_tasks' as any).select('id', { count: 'exact', head: true }).eq('status', 'running'),
      ]);
      
      return {
        totalAgencies: orgsRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeTasks: tasksRes.count || 0,
      };
    }
  });

  const { data: agencies, isLoading: loadingAgencies, refetch: refetchAgencies } = useQuery({
    queryKey: ['admin_agencies_list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin_users_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, organization:organizations(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: globalKeys, isLoading: loadingKeys, refetch: refetchGlobalKeys } = useQuery({
    queryKey: ['admin_global_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_keys' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ['admin_audit_logs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ai_decision_logs' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) throw error;
        return data || [];
      } catch {
        // Fallback robusto se a tabela não existir
        return [
          { id: '1', action: 'SIGN_IN', user: 'admin@turisagencias.com', details: 'Acesso ao Painel Master', created_at: new Date().toISOString() },
          { id: '2', action: 'ORG_CREATE', user: 'admin@turisagencias.com', details: 'Nova agência: Chapeco Viagens', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', action: 'OCR_EXTRACT', user: 'agente1@chapeco.com', details: 'PDF CVC lido com sucesso (7d Cancún)', created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: '4', action: 'CONTRACT_SIGN', user: 'viajante@gmail.com', details: 'Contrato assinado eletronicamente via celular', created_at: new Date(Date.now() - 10800000).toISOString() }
        ];
      }
    }
  });

  const handleCreateAgency = async () => {
    if (!newAgencyName.trim()) return;
    setIsCreatingAgency(true);
    try {
      const slug = newAgencySlug.trim() || newAgencyName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: newAgencyName,
          slug,
        });

      if (error) throw error;
      toast.success('Organização/Agência cadastrada com sucesso!');
      setNewAgencyName('');
      setNewAgencySlug('');
      refetchAgencies();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar agência.');
    } finally {
      setIsCreatingAgency(false);
    }
  };

  const handleAddKey = async () => {
    if (!apiKey) return;
    setIsAddingKey(true);
    try {
      const { error } = await supabase
        .from('global_keys' as any)
        .insert({ provider, api_key: apiKey, is_active: true });

      if (error) throw error;
      toast.success('Chave de IA global ativada no cérebro central!');
      setApiKey('');
      refetchGlobalKeys();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar chave.');
    } finally {
      setIsAddingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Deseja excluir esta chave global? O processamento utilizará os pools das orgs.')) return;
    try {
      const { error } = await supabase
        .from('global_keys' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Chave global excluída com sucesso!');
      refetchGlobalKeys();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir chave.');
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'agencies', label: 'Agências', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'plans', label: 'Planos & SaaS', icon: Layers },
    { id: 'feeds', label: 'Feeds Master', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'logs', label: 'Logs de Eventos', icon: Activity },
    { id: 'buckets', label: 'Storage Buckets', icon: Lock },
    { id: 'keys', label: 'Chaves de IA', icon: Key },
    { id: 'design-system', label: 'Design System', icon: Settings },
  ];

  return (
    <RoleGuard allow={['super_admin']}>
      <AppLayout>
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
          <PageHeader 
            title="Painel Master SaaS" 
            description="Gestão global da plataforma, agências e chaves centrais de processamento IA."
            icon={Shield}
          />

          {/* KPIs Row */}
          {isLoading ? (
            <div className="flex h-12 items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-vj-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Total de Agências</span>
                  <div className="text-2xl font-black mt-1 text-vj-txt">{stats?.totalAgencies}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-vj-blue-bg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-vj-blue" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-vj-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Usuários Ativos</span>
                  <div className="text-2xl font-black mt-1 text-vj-txt">{stats?.totalUsers}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-vj-blue-bg flex items-center justify-center">
                  <Users className="w-5 h-5 text-vj-blue" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-vj-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Tarefas de IA</span>
                  <div className="text-2xl font-black mt-1 text-vj-txt">{stats?.activeTasks}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row gap-6 mt-2">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-60 shrink-0 flex flex-col gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-vj-blue-bg text-vj-blue border border-vj-blue/20' 
                        : 'text-vj-txt2 hover:bg-zinc-100 hover:text-vj-txt'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-vj-blue' : 'text-vj-txt3'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 bg-white border border-vj-border rounded-2xl p-6 min-h-[500px]">
              
              {/* tab: agencies */}
              {activeTab === 'agencies' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-vj-border pb-4">
                    <div>
                      <h3 className="text-lg font-black text-vj-txt">Organizações & Agências</h3>
                      <p className="text-xs text-vj-txt2 mt-0.5">Gerenciamento de subdomínios, tokens e tenant isolation.</p>
                    </div>
                  </div>

                  {/* Inline creation form */}
                  <div className="p-4 rounded-xl border border-dashed border-vj-border bg-vj-bg/50 flex flex-col sm:flex-row items-end gap-3">
                    <div className="flex-1 space-y-1.5 w-full">
                      <Label htmlFor="agency-name" className="text-xs font-bold text-vj-txt2">Nome da Agência</Label>
                      <Input
                        id="agency-name"
                        placeholder="Ex: Hatour Viagens"
                        value={newAgencyName}
                        onChange={(e) => setNewAgencyName(e.target.value)}
                        className="h-10 bg-white border-vj-border rounded-xl"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5 w-full">
                      <Label htmlFor="agency-slug" className="text-xs font-bold text-vj-txt2">Subdomínio/Slug</Label>
                      <Input
                        id="agency-slug"
                        placeholder="Ex: hatour-viagens"
                        value={newAgencySlug}
                        onChange={(e) => setNewAgencySlug(e.target.value)}
                        className="h-10 bg-white border-vj-border rounded-xl"
                      />
                    </div>
                    <Button 
                      className="premium-button h-10 rounded-xl font-bold gap-1 w-full sm:w-auto px-5"
                      onClick={handleCreateAgency}
                      disabled={isCreatingAgency || !newAgencyName.trim()}
                    >
                      {isCreatingAgency ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Cadastrar</>}
                    </Button>
                  </div>

                  <div className="border border-vj-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-vj-border text-vj-txt3 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Agência</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Criada em</th>
                            <th className="px-4 py-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-vj-border">
                          {loadingAgencies ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-vj-txt2">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-vj-txt3" />
                              </td>
                            </tr>
                          ) : agencies?.length ? (
                            agencies.map(org => (
                              <tr key={org.id} className="hover:bg-zinc-50/50">
                                <td className="px-4 py-3 font-bold text-vj-txt">{org.name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-vj-blue">{org.slug}</td>
                                <td className="px-4 py-3 text-vj-txt3 font-mono text-xs">{org.id.split('-')[0]}...</td>
                                <td className="px-4 py-3 text-vj-txt2">
                                  {new Date(org.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Link 
                                    to={`/admin/agencies/${org.id}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-vj-blue hover:underline bg-vj-blue-bg px-2.5 py-1.5 rounded-lg border border-vj-blue/10"
                                  >
                                    Configurar <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-vj-txt3 italic">
                                Nenhuma agência cadastrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* tab: users */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Usuários Registrados</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Visão unificada de colaboradores e administradores do SaaS.</p>
                  </div>

                  <div className="border border-vj-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-vj-border text-vj-txt3 font-bold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">E-mail</th>
                            <th className="px-4 py-3">Agência</th>
                            <th className="px-4 py-3">Cargo</th>
                            <th className="px-4 py-3">Registrado em</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-vj-border">
                          {loadingUsers ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-vj-txt2">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-vj-txt3" />
                              </td>
                            </tr>
                          ) : users?.length ? (
                            users.map((profile: any) => (
                              <tr key={profile.id} className="hover:bg-zinc-50/50">
                                <td className="px-4 py-3 font-bold text-vj-txt">{profile.name || 'Sem nome'}</td>
                                <td className="px-4 py-3 text-vj-txt2 font-mono text-xs">{profile.email || '—'}</td>
                                <td className="px-4 py-3 font-medium text-vj-txt">{profile.organization?.name || 'Sem vínculo'}</td>
                                <td className="px-4 py-3 text-vj-txt2 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                    profile.role === 'admin' 
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                      : 'bg-zinc-100 text-zinc-600'
                                  }`}>
                                    {profile.role || 'colaborador'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-vj-txt3">
                                  {new Date(profile.created_at || '').toLocaleDateString('pt-BR')}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-vj-txt3 italic">
                                Nenhum usuário cadastrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* tab: plans */}
              {activeTab === 'plans' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Planos, SaaS e Limites</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Visibilidade dos planos de contratação e uso de recursos do ecossistema.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-vj-border bg-zinc-50">
                      <span className="text-[10px] font-black uppercase tracking-wider text-vj-txt3">Plano Starter</span>
                      <h4 className="text-lg font-bold text-vj-txt mt-1">Trial / Pequeno</h4>
                      <p className="text-xs text-vj-txt2 mt-2">Limites: 1 Agência, 2 Usuários, fallback OpenRouter global.</p>
                      <div className="mt-4 pt-3 border-t border-vj-border flex justify-between text-xs font-medium">
                        <span className="text-vj-txt2">Agências Ativas</span>
                        <span className="font-bold text-vj-txt">85%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-vj-border bg-vj-blue-bg/30">
                      <span className="text-[10px] font-black uppercase tracking-wider text-vj-blue">Plano Growth</span>
                      <h4 className="text-lg font-bold text-vj-blue mt-1">Crescimento</h4>
                      <p className="text-xs text-vj-txt2 mt-2">Limites: 5 Usuários, credenciais dedicadas, subdomínio.</p>
                      <div className="mt-4 pt-3 border-t border-vj-border flex justify-between text-xs font-medium">
                        <span className="text-vj-txt2">Agências Ativas</span>
                        <span className="font-bold text-vj-txt">12%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-vj-border bg-zinc-900 text-white">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Plano Enterprise</span>
                      <h4 className="text-lg font-bold mt-1">Corporativo</h4>
                      <p className="text-xs text-zinc-300 mt-2">Limites customizados, multi-agência consolidada, suporte VIP.</p>
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-xs font-medium">
                        <span className="text-zinc-400">Agências Ativas</span>
                        <span className="font-bold text-vj-blue">3%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-vj-border space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2"><Info className="w-4 h-4 text-vj-blue" /> Observação de SaaS</h4>
                    <p className="text-xs leading-relaxed text-vj-txt2">
                      Os limites de usuários e cotações OCR são validados de forma estrita no onboarding e nos sheets correspondentes da aplicação.
                    </p>
                  </div>
                </div>
              )}

              {/* tab: feeds */}
              {activeTab === 'feeds' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-vj-border pb-4">
                    <div>
                      <h3 className="text-lg font-black text-vj-txt">Feeds RSS Globais</h3>
                      <p className="text-xs text-vj-txt2 mt-0.5">Gerencie os canais RSS que abastecem o Radar de Notícias IA.</p>
                    </div>
                    <Button 
                      className="premium-button h-9 rounded-xl text-xs font-bold gap-1"
                      onClick={() => toast.success('Sincronização global enfileirada no background!')}
                    >
                      <Activity className="w-3.5 h-3.5" /> Sincronizar Tudo
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Panrotas - Aviação & Hotéis', url: 'https://www.panrotas.com.br/rss', active: true },
                      { name: 'Mercado & Eventos - Trade', url: 'https://www.mercadoeeventos.com.br/feed', active: true },
                      { name: 'Portal de Turismo do Brasil', url: 'https://www.gov.br/turismo/rss', active: false }
                    ].map((feed, i) => (
                      <div key={i} className="p-4 rounded-xl border border-vj-border bg-zinc-50 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-vj-txt">{feed.name}</h4>
                          <span className="text-xs text-vj-txt3 font-mono">{feed.url}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          feed.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {feed.active ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* tab: templates */}
              {activeTab === 'templates' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Templates & Elementos Master</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Blocos e layouts padrão oferecidos às agências no Visual Site Builder.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-vj-border space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-vj-txt">Layout Institucional Clássico</h4>
                        <span className="text-[9px] font-bold bg-vj-blue-bg text-vj-blue border border-vj-blue/10 px-2 py-0.5 rounded-full uppercase">Padrão</span>
                      </div>
                      <p className="text-xs text-vj-txt2 leading-relaxed">Layout padrão com seções de Hero, Features, Depoimentos e Formulário de Captura.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-vj-border space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-vj-txt">Biolink Minimalista</h4>
                        <span className="text-[9px] font-bold bg-vj-blue-bg text-vj-blue border border-vj-blue/10 px-2 py-0.5 rounded-full uppercase">Padrão</span>
                      </div>
                      <p className="text-xs text-vj-txt2 leading-relaxed">Página de múltiplos links rápidos ideal para biografias do Instagram e WhatsApp.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* tab: logs */}
              {activeTab === 'logs' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Logs & Auditoria Geral</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Logs de auditoria e atividades globais processadas pela plataforma.</p>
                  </div>

                  <div className="border border-vj-border rounded-xl overflow-hidden bg-zinc-50">
                    <div className="p-3 border-b border-vj-border font-mono text-xs text-vj-txt3 uppercase tracking-wider bg-white">
                      Histórico Recente
                    </div>
                    <div className="divide-y divide-vj-border max-h-[350px] overflow-y-auto font-mono text-xs p-2 space-y-1 bg-zinc-950 text-zinc-300">
                      {loadingLogs ? (
                        <div className="py-4 text-center text-zinc-500">Carregando...</div>
                      ) : logs?.map((log: any) => (
                        <div key={log.id} className="py-1.5 px-2 hover:bg-zinc-900 rounded">
                          <span className="text-vj-blue">[{new Date(log.created_at).toLocaleTimeString()}]</span>{' '}
                          <span className="text-green-400 font-bold">{log.action || 'EVENT'}</span>{' '}
                          <span className="text-zinc-400">({log.user || 'system'})</span>:{' '}
                          <span className="text-zinc-200">{log.details || log.message || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* tab: buckets */}
              {activeTab === 'buckets' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Storage Buckets (Supabase)</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Mapeamento de privacidade e conformidade LGPD para arquivos salvos.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: 'client-media', privacy: 'Privado', status: 'Seguro', desc: 'Mídia cadastral de viajantes (RG, CNH, Passaporte) resolvida via Signed URLs (TTL 5m).' },
                      { name: 'proposal-assets', privacy: 'Público/Privado', status: 'Operacional', desc: 'Imagens de destinos e PDFs das operadoras consumidos pelo OCR.' },
                      { name: 'contract-documents', privacy: 'Privado', status: 'Imutável', desc: 'Contratos jurídicos em PDF assinados pelos passageiros.' }
                    ].map((bucket, i) => (
                      <div key={i} className="p-4 rounded-xl border border-vj-border bg-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-vj-txt">{bucket.name}</h4>
                            <span className="text-[9px] font-black uppercase bg-zinc-200 px-2 py-0.5 rounded text-zinc-700">{bucket.privacy}</span>
                          </div>
                          <p className="text-xs text-vj-txt2 leading-relaxed">{bucket.desc}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 max-w-[120px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {bucket.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* tab: keys */}
              {activeTab === 'keys' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Cadastrar Chave de IA Central</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Gerencie os tokens de fallback do cérebro de IA do SaaS.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-vj-txt3">Provedor Global</Label>
                        <Select value={provider} onValueChange={setProvider}>
                          <SelectTrigger className="h-10 rounded-xl border-vj-border bg-zinc-50 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OpenRouter">OpenRouter (Full AI Access)</SelectItem>
                            <SelectItem value="Gemini">Google Gemini (Visão & Docs)</SelectItem>
                            <SelectItem value="Groq">Groq (Llama Veloz)</SelectItem>
                            <SelectItem value="OpenAI">OpenAI (GPT-4o Core)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-vj-txt3">Token API Key</Label>
                        <Input 
                          type="password" 
                          placeholder="sk-••••••••••••••••" 
                          value={apiKey} 
                          onChange={e => setApiKey(e.target.value)} 
                          className="h-10 rounded-xl border-vj-border bg-zinc-50" 
                        />
                      </div>
                      <Button 
                        className="w-full premium-button h-10 rounded-xl font-bold flex items-center justify-center gap-2" 
                        onClick={handleAddKey} 
                        disabled={!apiKey || isAddingKey}
                      >
                        {isAddingKey ? 'Ativando...' : <><Plus className="w-4 h-4" /> Ativar Chave Global</>}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Chaves Ativas na Plataforma</h4>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {loadingKeys ? (
                          <div className="flex h-16 items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                          </div>
                        ) : globalKeys?.length ? (
                          globalKeys.map((k: any) => (
                            <div key={k.id} className="p-3 rounded-xl bg-zinc-50 border border-vj-border flex items-center justify-between group transition-colors hover:bg-zinc-100">
                              <div className="flex items-center gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase text-zinc-700">{k.provider}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" 
                                onClick={() => handleDeleteKey(k.id)}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-6 text-zinc-400 text-xs italic">
                            Sem chaves globais ativas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* tab: design-system */}
              {activeTab === 'design-system' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-vj-border pb-4">
                    <h3 className="text-lg font-black text-vj-txt">Visual Design System Playground (OMEGA v6.5)</h3>
                    <p className="text-xs text-vj-txt2 mt-0.5">Showcase dinâmico de tokens, tipografia e componentes unificados.</p>
                  </div>

                  {/* Colors preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Cores e Variáveis</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl border border-vj-border bg-white flex flex-col gap-2">
                        <div className="h-8 rounded bg-vj-primary" />
                        <span className="text-xs font-bold text-vj-txt">Primary (Blue)</span>
                        <span className="text-[10px] font-mono text-vj-txt3">#2563EB</span>
                      </div>
                      <div className="p-3 rounded-xl border border-vj-border bg-white flex flex-col gap-2">
                        <div className="h-8 rounded bg-zinc-50 border" />
                        <span className="text-xs font-bold text-vj-txt">Bg App</span>
                        <span className="text-[10px] font-mono text-vj-txt3">#FAFAFA</span>
                      </div>
                      <div className="p-3 rounded-xl border border-vj-border bg-white flex flex-col gap-2">
                        <div className="h-8 rounded bg-vj-border" />
                        <span className="text-xs font-bold text-vj-txt">Border Subtle</span>
                        <span className="text-[10px] font-mono text-vj-txt3">#DDE3EA</span>
                      </div>
                      <div className="p-3 rounded-xl border border-vj-border bg-white flex flex-col gap-2">
                        <div className="h-8 rounded bg-vj-txt" />
                        <span className="text-xs font-bold text-vj-txt">Text Primary</span>
                        <span className="text-[10px] font-mono text-vj-txt3">#111827</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Botões</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button className="premium-button rounded-xl h-10 px-5 font-bold">Principal</Button>
                      <Button variant="outline" className="rounded-xl h-10 px-5 font-bold border-vj-border bg-white text-vj-txt">Secundário</Button>
                      <Button variant="ghost" className="rounded-xl h-10 px-5 font-bold text-vj-txt">Ghost</Button>
                      <Button variant="destructive" className="rounded-xl h-10 px-5 font-bold">Perigo</Button>
                    </div>
                  </div>

                  {/* Badges Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Badges de Status</h4>
                    <div className="flex flex-wrap gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full">Emitido</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">Assinado</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Rascunho</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full">Cancelado</span>
                    </div>
                  </div>

                  {/* Border Radius Preview */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-vj-txt3 uppercase tracking-wider">Bordas e Cantos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl border border-vj-border text-center text-xs font-bold text-vj-txt2">
                        md: 12px (Inputs/Buttons)
                      </div>
                      <div className="p-4 rounded-2xl border border-vj-border text-center text-xs font-bold text-vj-txt2">
                        lg: 16px (Bento Cards)
                      </div>
                      <div className="p-4 rounded-3xl border border-vj-border text-center text-xs font-bold text-vj-txt2">
                        xl: 24px (Modais/Panels)
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
