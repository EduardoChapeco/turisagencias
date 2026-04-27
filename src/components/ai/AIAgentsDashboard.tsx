import { useState } from 'react';
import { SheetPage } from '@/components/ui/SheetPage';
import { useAIAgents, useAITasks, usePendingApprovals, useApproveTask, useCancelTask, useAITasksRealtime, useAIDashboardSummary } from '@/hooks/useAIAgents';
import { Sparkles, Bot, AlertCircle, CheckCircle2, Clock, Play, Pause, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAgentsDashboard({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history' | 'agents'>('active');

  // Activate realtime subscription
  useAITasksRealtime();

  const { data: agents = [] } = useAIAgents();
  const { data: summary = [] } = useAIDashboardSummary();
  const { data: pendingApprovals = [] } = usePendingApprovals();
  
  // Tasks query is broader for history, but we can filter active client-side for simplicity, 
  // or query them differently.
  const { data: tasks = [] } = useAITasks();
  
  const activeTasks = tasks.filter(t => t.status === 'running' || t.status === 'queued');
  const historyTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled');

  const approveTask = useApproveTask();
  const cancelTask = useCancelTask();

  const handleApprove = (taskId: string, approved: boolean) => {
    approveTask.mutate({ task_id: taskId, approved });
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Agente Desconhecido';
  };

  return (
    <SheetPage
      open={open}
      onClose={() => onOpenChange(false)}
      title="Centro de Inteligência OMEGA"
      subtitle="Monitoramento em tempo real dos Agentes de IA"
      icon={Bot}
    >
      <div className="flex flex-col h-full bg-zinc-50/50">
        
        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-vj-border bg-white sticky top-0 z-10 gap-1">
          <TabButton 
            active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')}
            label="Tarefas Ativas"
            badge={activeTasks.length}
            badgeColor="bg-vj-green-bg text-vj-green"
          />
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
            label="Aguardando"
            badge={pendingApprovals.length}
            badgeColor={pendingApprovals.length > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-zinc-100 text-zinc-500"}
          />
          <TabButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            label="Histórico"
          />
          <TabButton 
            active={activeTab === 'agents'} 
            onClick={() => setActiveTab('agents')}
            label="Agentes"
          />
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">

            {/* TAB: ATIVAS */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeTasks.length === 0 ? (
                  <EmptyState icon={<Sparkles />} text="Nenhuma tarefa em execução no momento." />
                ) : (
                  activeTasks.map(task => (
                    <div key={task.id} className="bg-white border border-vj-border rounded-xl p-5 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.status === 'running' ? 'bg-vj-green-bg text-vj-green' : 'bg-blue-50 text-blue-500'}`}>
                            {task.status === 'running' ? <Play size={16} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-vj-txt">{getAgentName(task.ai_agent_id)}</h4>
                            <p className="text-xs text-vj-txt3 font-medium capitalize">{task.task_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => cancelTask.mutate(task.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                          Cancelar
                        </Button>
                      </div>
                      
                      <div className="w-full bg-zinc-100 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div className={`h-full rounded-full ${task.status === 'running' ? 'bg-vj-green w-3/4 animate-pulse' : 'bg-blue-400 w-1/4'}`}></div>
                      </div>

                      {task.execution_log && task.execution_log.length > 0 && (
                        <div className="bg-zinc-900 rounded-lg p-3 font-mono text-[11px] text-zinc-400 leading-relaxed max-h-32 overflow-y-auto mt-4">
                          {task.execution_log.map((log, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-emerald-400'}>
                                {log.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: AGUARDANDO APROVAÇÃO */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingApprovals.length === 0 ? (
                  <EmptyState icon={<CheckCircle2 />} text="Nenhuma ação aguardando sua aprovação." />
                ) : (
                  pendingApprovals.map(task => (
                    <div key={task.id} className="bg-white border-2 border-red-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider">{getAgentName(task.ai_agent_id)} — Requer Atenção</h4>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 mb-5 border border-red-100/50">
                        <p className="text-sm text-red-900 font-medium">
                          {task.approval_prompt || 'O agente preparou uma ação e aguarda sua aprovação para prosseguir.'}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={() => handleApprove(task.id, true)} className="bg-vj-green hover:bg-vj-green/90 text-white flex-1" disabled={approveTask.isPending}>
                          ✅ Aprovar e Prosseguir
                        </Button>
                        <Button onClick={() => handleApprove(task.id, false)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex-1" disabled={approveTask.isPending}>
                          ❌ Descartar Ação
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: HISTÓRICO */}
            {activeTab === 'history' && (
              <div className="bg-white border border-vj-border rounded-xl overflow-hidden">
                {historyTasks.length === 0 ? (
                  <div className="p-8"><EmptyState icon={<Clock />} text="Histórico vazio." /></div>
                ) : (
                  <div className="divide-y divide-vj-border">
                    {historyTasks.map(task => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          {task.status === 'completed' ? <CheckCircle2 className="text-vj-green" size={20} /> : 
                           task.status === 'failed' ? <AlertCircle className="text-red-500" size={20} /> :
                           <XCircle className="text-zinc-400" size={20} />}
                          <div>
                            <p className="text-sm font-bold text-vj-txt">{getAgentName(task.ai_agent_id)}</p>
                            <p className="text-xs text-vj-txt3 capitalize">{task.task_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-vj-txt2">
                            {new Date(task.completed_at || task.updated_at).toLocaleTimeString()}
                          </p>
                          <p className="text-[10px] text-vj-txt3 mt-0.5">
                            {task.status === 'failed' && task.error_message ? <span className="text-red-500 truncate max-w-[200px] block">{task.error_message}</span> : task.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AGENTES */}
            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.map(agent => (
                  <div key={agent.agent_id} className="bg-white border border-vj-border rounded-xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-vj-txt flex items-center gap-2">
                          {agent.agent_name}
                          <span className={`w-2 h-2 rounded-full ${agent.agent_status === 'running' ? 'bg-vj-green animate-pulse' : agent.agent_status === 'idle' ? 'bg-zinc-300' : 'bg-red-500'}`}></span>
                        </h4>
                        <p className="text-xs text-vj-txt3 mt-1 font-medium capitalize">{agent.agent_type.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-vj-txt">{agent.success_rate}%</span>
                        <p className="text-[10px] uppercase tracking-wider text-vj-txt3 font-bold mt-0.5">Taxa de Sucesso</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-vj-border">
                      <div className="text-center">
                        <span className="block text-sm font-bold text-vj-txt2">{agent.total_tasks_run}</span>
                        <span className="block text-[10px] uppercase text-vj-txt3">Execuções</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-vj-green">{agent.tasks_running}</span>
                        <span className="block text-[10px] uppercase text-vj-txt3">Ativas</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-bold text-red-500">{agent.error_count}</span>
                        <span className="block text-[10px] uppercase text-vj-txt3">Erros</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
    </SheetPage>
  );
}

function TabButton({ active, onClick, label, badge, badgeColor }: { active: boolean, onClick: () => void, label: string, badge?: number, badgeColor?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-bold transition-all relative flex items-center gap-2 ${active ? 'text-vj-green' : 'text-vj-txt2 hover:text-vj-txt'}`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black min-w-[20px] text-center ${badgeColor || 'bg-zinc-100 text-zinc-500'}`}>
          {badge}
        </span>
      )}
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vj-green rounded-t-full"></div>}
    </button>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-vj-txt3">{text}</p>
    </div>
  );
}
