import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Shield, Building2, Users, Activity, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RoleGuard } from '@/components/RoleGuard';

export default function AdminDashboard() {
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

  return (
    <RoleGuard allow={['super_admin']}>
      <AppLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader 
            title="Painel Master SaaS" 
            description="Gestão global da plataforma, agências e monitoramento de infraestrutura."
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

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Últimas Agências Cadastradas</h3>
            <div className="bg-white border rounded-xl overflow-hidden">
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
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
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
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
