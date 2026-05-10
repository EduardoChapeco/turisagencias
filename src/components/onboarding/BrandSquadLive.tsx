import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface BrandSquadLiveProps {
  orgId: string;
  primaryColor: string;
  onComplete: () => void;
}

export function BrandSquadLive({ orgId, primaryColor, onComplete }: BrandSquadLiveProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!orgId) return;

    // Fetch initial logs if the task started quickly
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('ai_tasks')
        .select('execution_log, status')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data?.execution_log && Array.isArray(data.execution_log)) {
        setLogs(data.execution_log);
      }
      if (data?.status === 'completed' || data?.status === 'failed') {
        setCompleted(true);
      }
    };
    
    fetchInitial();

    // Subscribe to changes in ai_tasks for this organization
    const channel = supabase.channel(`ai_tasks_${orgId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ai_tasks',
        filter: `org_id=eq.${orgId}`
      }, (payload) => {
        const row = payload.new as any;
        if (row.execution_log && Array.isArray(row.execution_log)) {
          setLogs(row.execution_log);
        }
        if (row.status === 'completed' || row.status === 'failed') {
          setCompleted(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  useEffect(() => {
    if (completed) {
      onComplete();
    }
  }, [completed, onComplete]);

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full pointer-events-none opacity-20"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
            <Cloud className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="font-black text-white">Central de Inteligência</h3>
            <p className="text-xs text-zinc-500">Agentes Autônomos em Execução</p>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
              completed ? "bg-vj-green/20 border-vj-green/50 text-vj-green" : "bg-blue-500/20 border-blue-500/50 text-blue-400 animate-pulse"
            )}>
              {completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
            </div>
            <span className={cn(
              "text-sm font-medium",
              completed ? "text-vj-green" : "text-white"
            )}>
              {completed ? "Análise Concluída" : "Processando informações em tempo real..."}
            </span>
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="bg-black border border-zinc-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[10px] leading-relaxed flex flex-col flex-col-reverse">
          <div>
            {logs.map((log, i) => (
              <div key={i} className="text-zinc-400 mb-1 break-words">
                <span className="text-zinc-600 mr-2">{'>'}</span>
                <span>{typeof log === 'string' ? log : JSON.stringify(log)}</span>
              </div>
            ))}
            {!completed && (
              <div className="text-zinc-500 animate-pulse mt-2">_</div>
            )}
            {logs.length === 0 && !completed && (
              <div className="text-zinc-600 italic">Aguardando logs do motor Python...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
