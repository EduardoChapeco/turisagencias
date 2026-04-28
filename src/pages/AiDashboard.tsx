import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAiTasks } from '@/hooks/useAiTasks';
import { useAuthStore } from '@/stores/authStore';
import { Bot, CheckCircle2, Clock, XCircle, AlertCircle, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { supabase } from '@/integrations/supabase/client';

export default function AiDashboard() {
  const { profile } = useAuthStore();
  const { data: tasks, isLoading, refetch } = useAiTasks(profile?.org_id, 100);

  const handleApprove = async (taskId: string, approved: boolean) => {
    try {
      await supabase.rpc('approve_ai_task', {
        p_task_id: taskId,
        p_approved: approved,
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  return (
    <AppLayout fullHeight>
      <div className="flex h-full min-h-0 flex-col gap-4">
        <PageHeader
          title="Central de IA (Cérebro OMEGA)"
          description="Monitore os agentes, veja a fila de tarefas e aprove execuções críticas."
          icon={Bot}
        />

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-white p-4 dark:bg-zinc-900 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">Fila de Tarefas Ativas</h2>
          
          <div className="min-h-0 flex-1 overflow-auto rounded-xl border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Agente</th>
                  <th className="px-4 py-3 font-medium">Tarefa</th>
                  <th className="px-4 py-3 font-medium">Aprovação Humana</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(!tasks || tasks.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Nenhuma tarefa na fila.
                    </td>
                  </tr>
                ) : (
                  tasks.map(t => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                         {{
                           queued: <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">Na Fila</Badge>,
                           running: <Badge className="bg-blue-500 text-white animate-pulse">Rodando...</Badge>,
                           completed: <Badge className="bg-green-500 text-white">Concluída</Badge>,
                           failed: <Badge variant="destructive">Falhou</Badge>,
                           awaiting_approval: <Badge variant="outline" className="text-amber-600 border-amber-300">Aguardando Aval</Badge>,
                           cancelled: <Badge variant="outline" className="text-zinc-400">Cancelada</Badge>,
                         }[t.status] ?? <Badge variant="secondary">{t.status}</Badge>}
                      </td>
                      <td className="px-4 py-3 font-medium">
                         {t.ai_agents?.name || 'Agente Desconhecido'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                         {t.task_type}
                      </td>
                      <td className="px-4 py-3">
                         {t.status === 'awaiting_approval' && t.requires_approval ? (
                           <div className="flex items-center gap-2 text-amber-600 font-medium">
                             <AlertCircle className="w-4 h-4" />
                             Requer aprovação
                           </div>
                         ) : t.requires_approval && t.approved_at ? (
                           <span className="text-green-600 text-xs">Aprovado</span>
                         ) : t.requires_approval && t.rejected_at ? (
                           <span className="text-red-600 text-xs">Rejeitado</span>
                         ) : (
                           <span className="text-zinc-400 text-xs">-</span>
                         )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                         {new Date(t.queued_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {t.status === 'awaiting_approval' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleApprove(t.id, false)}>
                              <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(t.id, true)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                            </Button>
                          </div>
                        )}
                        {t.status === 'failed' && (
                          <Button size="sm" variant="outline" onClick={() => {/* retry logic */}}>
                            <Play className="w-4 h-4 mr-1" /> Tentar Novamente
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
