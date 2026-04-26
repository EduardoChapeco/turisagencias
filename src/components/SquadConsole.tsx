import React from 'react';
import { 
  Terminal, BrainCircuit, ShieldCheck, Activity, 
  MessageSquareCode, Zap, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SquadMessage {
  agent: string;
  text: string;
  sentiment?: 'neutral' | 'critical' | 'supportive';
  timestamp?: string;
}

interface SquadConsoleProps {
  messages: SquadMessage[];
  isThinking?: boolean;
  className?: string;
}

const AGENT_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
  'Agent 0 (Interpreter)': { icon: MessageSquareCode, color: 'text-blue-400', label: 'INTERPRETER' },
  'Agent 4 (Planner)': { icon: BrainCircuit, color: 'text-purple-400', label: 'PLANNER' },
  'Agent 2 (Flight Specialist)': { icon: Zap, color: 'text-amber-400', label: 'FLIGHT_SPEC' },
  'Gap Resolver (Crisis Agent)': { icon: AlertCircle, color: 'text-rose-400', label: 'CRISIS_AUDIT' },
  'Moderator (Prometheus)': { icon: ShieldCheck, color: 'text-emerald-400', label: 'MODERATOR' },
  'Chronos (Memory)': { icon: Activity, color: 'text-zinc-400', label: 'CHRONOS' },
};

export function SquadConsole({ messages, isThinking, className }: SquadConsoleProps) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-zinc-950 rounded-[2rem] border border-white/5 overflow-hidden",
      className
    )}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Squad War Room</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
        </div>
      </div>

      {/* Messages Area - NO SCROLLBARS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar scroll-smooth">
        {messages.length === 0 && !isThinking && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-20">
            <BrainCircuit className="w-12 h-12 text-white mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Aguardando Início do Debate Neural</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const config = AGENT_CONFIG[msg.agent] || { icon: Terminal, color: 'text-zinc-400', label: 'AGENTE_IA' };
          const Icon = config.icon;

          return (
            <div 
              key={i} 
              className={cn(
                "group animate-in fade-in slide-in-from-left-4 duration-500",
                msg.sentiment === 'critical' && "border-l-2 border-rose-500/40 pl-4",
                msg.sentiment === 'supportive' && "border-l-2 border-emerald-500/40 pl-4"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-1.5 rounded-lg bg-white/5", config.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>
                  {config.label}
                </span>
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                  {msg.timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="pl-9">
                <p className="text-xs font-bold text-zinc-300 leading-relaxed font-mono">
                  <span className="text-zinc-600 mr-2">❯</span>
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-4 pl-1 animate-pulse">
            <div className="p-1.5 rounded-lg bg-vj-green/10 text-vj-green">
              <Zap className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-vj-green">
              Sincronizando Cognição Adversarial...
            </span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-vj-green" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Neural Link Active</span>
        </div>
        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter">
          OMEGA ENGINE v4.1 · TURIS AGÊNCIAS
        </div>
      </div>
    </div>
  );
}
