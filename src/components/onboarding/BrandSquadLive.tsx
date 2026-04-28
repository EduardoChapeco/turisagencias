import React, { useState, useEffect } from 'react';
import { Cloud, Search, Camera, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandSquadLiveProps {
  instagramUrl: string;
  websiteUrl: string;
  primaryColor: string;
  isProcessing: boolean;
  onComplete: () => void;
}

const steps = [
  { id: 'scout', label: 'Agent Scout: Rastreando Presença Digital', icon: Search, duration: 2000 },
  { id: 'vision', label: 'Agent Vision: Analisando Identidade Visual', icon: Camera, duration: 3000 },
  { id: 'writer', label: 'Agent Writer: Extraindo Tom de Voz', icon: Cpu, duration: 2500 },
  { id: 'db', label: 'Knowledge Base: Salvando Brand DNA', icon: Database, duration: 1500 },
];

export function BrandSquadLive({ instagramUrl, websiteUrl, primaryColor, isProcessing, onComplete }: BrandSquadLiveProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isProcessing || completed) return;

    let timeout: NodeJS.Timeout;
    const runStep = (index: number) => {
      if (index >= steps.length) {
        setCompleted(true);
        setLogs(prev => [...prev, '[Sistema] Brand DNA extraído com sucesso.']);
        setTimeout(() => {
          onComplete();
        }, 1500);
        return;
      }

      const step = steps[index];
      setLogs(prev => [...prev, `[${step.id.toUpperCase()}] Iniciando: ${step.label}`]);
      
      // Add fake sub-logs for realism
      if (step.id === 'scout') {
        setTimeout(() => setLogs(prev => [...prev, `[SCOUT] Acessando ${instagramUrl || 'redes sociais'}...`]), 800);
      } else if (step.id === 'vision') {
        setTimeout(() => setLogs(prev => [...prev, `[VISION] Capturando grid e mapeando paleta de cores...`]), 1000);
      } else if (step.id === 'writer') {
        setTimeout(() => setLogs(prev => [...prev, `[WRITER] Sintetizando manifesto da marca...`]), 1200);
      }

      timeout = setTimeout(() => {
        setLogs(prev => [...prev, `[${step.id.toUpperCase()}] Concluído.`]);
        setCurrentStepIndex(index + 1);
        runStep(index + 1);
      }, step.duration);
    };

    runStep(0);

    return () => clearTimeout(timeout);
  }, [isProcessing, completed]);

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
            <h3 className="font-black text-white">OMEGA Brand Squad</h3>
            <p className="text-xs text-zinc-500">Inteligência Artificial em Execução</p>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isDone = index < currentStepIndex;
            
            return (
              <div key={step.id} className={cn(
                "flex items-center gap-3 transition-opacity duration-300",
                isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-30"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
                  isDone ? "bg-vj-green/20 border-vj-green/50 text-vj-green" : 
                  isActive ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-600"
                )}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isDone ? "text-vj-green" : isActive ? "text-white" : "text-zinc-500"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Terminal Logs */}
        <div className="bg-black border border-zinc-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className="text-zinc-400 mb-1">
              <span className="text-zinc-600 mr-2">{'>'}</span>
              <span dangerouslySetInnerHTML={{ __html: log.replace(/\[(.*?)\]/g, '<span class="text-blue-400">[$1]</span>') }} />
            </div>
          ))}
          {isProcessing && !completed && (
            <div className="text-zinc-500 animate-pulse mt-2">_</div>
          )}
        </div>
      </div>
    </div>
  );
}
