import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAiDecisionLogs } from '@/hooks/useQuotationScenarios';

export function AiLogsTab() {
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
