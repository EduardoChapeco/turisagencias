import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Shield, Building2, Users, Activity, Loader2, ArrowRight, Key, Trash2, Plus, Sparkles } from 'lucide-react';
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

export default function AdminDashboard() {
  const [provider, setProvider] = useState('OpenRouter');
  const [apiKey, setApiKey] = useState('');
  const [isAddingKey, setIsAddingKey] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin_dashboard_stats'],
    queryFn: async () => {
      const [orgsRes, usersRes, tasksRes] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ai_tasks').select('id', { count: 'exact', head: true }).eq('status', 'running'),
      ]);
      
      return {
        totalAgencies: orgsRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeTasks: tasksRes.count || 0,
      };
    }
  });

  const { data: agencies, isLoading: loadingAgencies } = useQuery({
    queryKey: ['admin_agencies_list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
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

  return (
    <RoleGuard allow={['super_admin']}>
      <AppLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader 
            title="Painel Master SaaS" 
            description="Gestão global da plataforma, agências e chaves centrais de processamento IA."
            icon={Shield}
          />

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total de Agências</CardTitle>
                  <Building2 className="w-4 h-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAgencies}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-zinc-400">Usuários Ativos</CardTitle>
                  <Users className="w-4 h-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-zinc-400">Tarefas de IA Rodando</CardTitle>
                  <Activity className="w-4 h-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{stats?.activeTasks}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            
            {/* Tabela de Agências */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold">Últimas Agências Cadastradas</h3>
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 border-b text-zinc-500 font-semibold text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Nome da Agência</th>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Criada em</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loadingAgencies ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                            Carregando...
                          </td>
                        </tr>
                      ) : agencies?.map(org => (
                        <tr key={org.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 font-medium text-zinc-900">{org.name}</td>
                          <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{org.id.split('-')[0]}...</td>
                          <td className="px-4 py-3 text-zinc-500">
                            {new Date(org.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link 
                              to={`/admin/agencies/${org.id}`}
                              className="inline-flex items-center gap-1 text-vj-primary hover:text-green-700 font-semibold text-xs bg-vj-primary-bg hover:bg-green-100/70 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Gerenciar <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Gestão de Chaves Globais */}
            <div className="space-y-6">
              <Card className="premium-card shadow-sm border border-zinc-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Cadastrar Chave Central
                  </CardTitle>
                  <CardDescription>
                    Fallbacks gerais para agências sem chaves configuradas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Provedor Global</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="h-10 rounded-xl border-zinc-100 bg-zinc-50 font-medium">
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
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Token API Key</Label>
                    <Input 
                      type="password" 
                      placeholder="sk-••••••••••••••••" 
                      value={apiKey} 
                      onChange={e => setApiKey(e.target.value)} 
                      className="h-10 rounded-xl border-zinc-100 bg-zinc-50" 
                    />
                  </div>
                  <Button 
                    className="w-full bg-zinc-950 text-white hover:bg-zinc-800 h-10 rounded-xl font-bold flex items-center justify-center gap-2" 
                    onClick={handleAddKey} 
                    disabled={!apiKey || isAddingKey}
                  >
                    {isAddingKey ? 'Ativando...' : <><Plus className="w-4 h-4" /> Ativar Chave Global</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="premium-card shadow-sm border border-zinc-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-bold flex items-center gap-2">
                    <Key className="w-4 h-4 text-vj-green" /> Chaves Ativas na Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {loadingKeys ? (
                      <div className="flex h-16 items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                      </div>
                    ) : globalKeys?.length ? (
                      globalKeys.map((k: any) => (
                        <div key={k.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between group transition-colors hover:bg-zinc-100">
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
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
