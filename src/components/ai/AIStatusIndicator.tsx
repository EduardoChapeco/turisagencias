import { useState } from 'react';
import { useAITasks, usePendingApprovals } from '@/hooks/useAIAgents';
import { Bot, Loader2, BellRing } from 'lucide-react';
import { AIAgentsDashboard } from './AIAgentsDashboard';

export function AIStatusIndicator() {
 const [dashboardOpen, setDashboardOpen] = useState(false);
 
 // Quick fetch just for the indicator badges
 const { data: pendingApprovals = [] } = usePendingApprovals();
 const { data: tasks = [] } = useAITasks();
 
 const activeTasksCount = tasks.filter(t => t.status === 'running' || t.status === 'queued').length;
 const requiresAttention = pendingApprovals.length > 0;
 
 if (activeTasksCount === 0 && !requiresAttention) {
 // Optionally render a smaller/idle version, or just the regular button
 return (
 <>
 <button 
 onClick={() => setDashboardOpen(true)}
 className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105"
 aria-label="Abrir Dashboard de IA"
 >
 <Bot size={20} />
 </button>
 <AIAgentsDashboard open={dashboardOpen} onOpenChange={setDashboardOpen} />
 </>
 );
 }

 return (
 <>
 <button 
 onClick={() => setDashboardOpen(true)}
 className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 h-12 rounded-full transition-all hover:scale-105 ${requiresAttention ? 'bg-red-500 hover:bg-red-600' : 'bg-vj-green hover:bg-vj-green/90'} text-white`}
 >
 <div className="relative">
 <Bot size={20} className={requiresAttention ? 'animate-bounce' : ''} />
 {requiresAttention && (
 <span className="absolute -top-1 -right-1 flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
 </span>
 )}
 </div>
 
 <span className="text-sm font-bold tracking-wide">
 {requiresAttention ? `${pendingApprovals.length} Ação Pendente` : `${activeTasksCount} Agente${activeTasksCount > 1 ? 's' : ''} Ativo${activeTasksCount > 1 ? 's' : ''}`}
 </span>
 
 {!requiresAttention && activeTasksCount > 0 && (
 <Loader2 size={16} className="animate-spin opacity-70" />
 )}
 
 {requiresAttention && (
 <BellRing size={16} className="animate-pulse" />
 )}
 </button>

 <AIAgentsDashboard open={dashboardOpen} onOpenChange={setDashboardOpen} />
 </>
 );
}
