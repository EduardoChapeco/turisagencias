import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useAiTasks, useApproveAiTask, useCancelAiTask } from '@/hooks/useAiTasks';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<any>; className: string }> = {
  queued:             { label: 'Na Fila',         icon: Clock,        className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  running:            { label: 'Executando',      icon: Loader2,      className: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed:          { label: 'Concluída',       icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
  failed:             { label: 'Falhou',          icon: XCircle,      className: 'bg-red-50 text-red-700 border-red-200' },
  awaiting_approval:  { label: 'Aguardando OK',  icon: AlertCircle,  className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const TASK_LABELS: Record<string, string> = {
  scan_brand:          'Scan de Marca',
  extract_group_trip:  'Extração de Grupo (PDF)',
  enrich_knowledge:    'Enriquecimento da Base',
  generate_proposal:   'Geração de Proposta',
};

export function AiLogsTab() {
  const { profile } = useAuthStore();
  const { data: tasks, isLoading } = useAiTasks(profile?.org_id, 50);
  const approveTask = useApproveAiTask();
  const cancelTask  = useCancelAiTask();

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-4 w-4 text-vj-green" />
          Fila de Tarefas IA
        </CardTitle>
        <CardDescription>
          Registro em tempo real de todas as tarefas executadas pelos agentes OMEGA.
          Atualiza automaticamente a cada 5 segundos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : !tasks?.length ? (
          <div className="text-center py-16 opacity-30 flex flex-col items-center gap-2">
            <Activity size={40} />
            <p className="text-sm font-medium">Nenhuma tarefa de IA registrada ainda.</p>
            <p className="text-xs text-muted-foreground">As tarefas aparecem aqui quando o Squad é acionado no Onboarding ou por automações.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.queued;
              const Icon = cfg.icon;
              const needsApproval = task.status === 'awaiting_approval' && task.requires_approval;
              return (
                <div key={task.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-white transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest ${cfg.className}`}>
                        <Icon className={`w-3 h-3 mr-1 ${task.status === 'running' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </Badge>
                      <span className="text-xs font-semibold text-vj-txt">
                        {TASK_LABELS[task.task_type] ?? task.task_type}
                      </span>
                      {task.ai_agents?.agent_type && (
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest">
                          via {task.ai_agents.agent_type}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 flex-shrink-0">
                      {new Date(task.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {task.error_message && (
                    <p className="text-[10px] text-red-500 mt-2 font-medium">↳ Erro: {task.error_message}</p>
                  )}

                  {task.result && task.status === 'completed' && (
                    <p className="text-[10px] text-zinc-500 mt-2">
                      ↳ Resultado: {JSON.stringify(task.result).slice(0, 100)}...
                    </p>
                  )}

                  {needsApproval && profile && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-vj-green hover:bg-vj-green/90"
                        onClick={() => approveTask.mutate({ taskId: task.id, userId: profile.user_id })}
                        disabled={approveTask.isPending}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => cancelTask.mutate(task.id)}
                        disabled={cancelTask.isPending}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
