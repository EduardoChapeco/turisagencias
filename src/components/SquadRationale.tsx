import React, { useMemo } from 'react';
import { 
  Terminal, BrainCircuit, ShieldCheck, 
  MessageSquareCode, Zap, AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SquadRationaleProps {
  rationaleText?: string;
  className?: string;
}

const AGENT_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
  'Agent 0': { icon: MessageSquareCode, color: 'text-blue-400', label: 'INTERPRETER' },
  'Agent 4': { icon: BrainCircuit, color: 'text-purple-400', label: 'PLANNER' },
  'Agent 2': { icon: Zap, color: 'text-amber-400', label: 'FLIGHT_SPEC' },
  'Gap Resolver': { icon: AlertCircle, color: 'text-rose-400', label: 'CRISIS_AUDIT' },
  'Moderator': { icon: ShieldCheck, color: 'text-emerald-400', label: 'MODERATOR' },
  'System': { icon: Terminal, color: 'text-zinc-400', label: 'SYS_CORE' },
};

function parseRationale(text: string) {
  if (!text) return [];
  
  // Regex to find markers like [Agent 4 (Planner)] or [Moderator]
  const regex = /\[(.*?)\]\s*([^\[]+)/g;
  const messages = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const rawAgent = match[1];
    const content = match[2].trim();
    
    // Normalize agent name for matching config
    let agentKey = 'System';
    if (rawAgent.includes('Agent 0')) agentKey = 'Agent 0';
    else if (rawAgent.includes('Agent 4')) agentKey = 'Agent 4';
    else if (rawAgent.includes('Agent 2') || rawAgent.includes('Flight Specialist')) agentKey = 'Agent 2';
    else if (rawAgent.includes('Gap Resolver') || rawAgent.includes('Crisis')) agentKey = 'Gap Resolver';
    else if (rawAgent.includes('Moderator') || rawAgent.includes('Prometheus')) agentKey = 'Moderator';
    
    // Determine sentiment heuristically based on keywords
    let sentiment: 'neutral' | 'critical' | 'supportive' = 'neutral';
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('risco') || lowerContent.includes('crítico') || lowerContent.includes('alerta') || lowerContent.includes('ruim') || lowerContent.includes('acima da média')) {
      sentiment = 'critical';
    } else if (lowerContent.includes('aprovado') || lowerContent.includes('consenso') || lowerContent.includes('excelente') || lowerContent.includes('viável')) {
      sentiment = 'supportive';
    }

    messages.push({
      agentKey,
      content,
      sentiment
    });
  }

  // Fallback se o texto for legado e não tiver tags de agente
  if (messages.length === 0) {
    messages.push({
      agentKey: 'Agent 4',
      content: text,
      sentiment: 'neutral' as const
    });
  }

  return messages;
}

export function SquadRationale({ rationaleText, className }: SquadRationaleProps) {
  const messages = useMemo(() => parseRationale(rationaleText || ''), [rationaleText]);

  return (
    <div className={cn(
      "flex flex-col bg-zinc-950 rounded-[1.5rem] border border-white/5 overflow-hidden",
      className
    )}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">War Room Audit Log</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-vj-green/20 border border-vj-green/30" />
        </div>
      </div>

      {/* Messages Area - Shadowless */}
      <div className="p-4 space-y-4 no-scrollbar">
        {messages.map((msg, i) => {
          const config = AGENT_CONFIG[msg.agentKey] || AGENT_CONFIG['System'];
          const Icon = config.icon;

          return (
            <div 
              key={i} 
              className={cn(
                "group animate-in fade-in slide-in-from-left-2 duration-500",
                msg.sentiment === 'critical' && "border-l-2 border-rose-500/40 pl-3",
                msg.sentiment === 'supportive' && "border-l-2 border-emerald-500/40 pl-3"
              )}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className={cn("p-1 rounded-md bg-white/5", config.color)}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", config.color)}>
                  {config.label}
                </span>
              </div>
              
              <div className="pl-7">
                <p className="text-[11px] font-medium text-zinc-300 leading-relaxed font-mono">
                  <span className="text-zinc-600 mr-2">❯</span>
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
