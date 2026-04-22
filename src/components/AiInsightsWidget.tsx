import { useEffect, useState } from 'react';
import { Sparkles, AlertCircle, TrendingUp, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

type Insight = {
  card_id: string;
  title: string;
  alert: string;
  reason: string;
};

export function AiInsightsWidget() {
  const { organization } = useAuthStore();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulação de chamada para o Python Engine (main.py:80 /api/v1/kanban/audit)
    // Em produção: fetch(`${import.meta.env.VITE_PYTHON_ENGINE_URL}/api/v1/kanban/audit?org_id=${organization?.id}`)
    
    const mockInsights: Insight[] = [
      {
        card_id: "1",
        title: "Viagem para Fernando de Noronha",
        alert: "Lead Esfriando 🔥",
        reason: "O card está na coluna 'Negociação' há mais de 3 dias sem movimentação."
      },
      {
        card_id: "2",
        title: "Pacote Europa Setembro",
        alert: "Ação Necessária 📋",
        reason: "Oportunidade avançada sem cotação vinculada. Sugerido gerar proposta via IA."
      }
    ];

    const timer = setTimeout(() => {
      setInsights(mockInsights);
    }, 1500);

    return () => clearTimeout(timer);
  }, [organization?.id]);

  if (!isVisible || insights.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 mb-6 relative overflow-hidden group shadow-none">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={100} className="text-white" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-vj-green/20 p-2 rounded-lg">
            <Sparkles size={18} className="text-vj-green" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Sugestões do Assistente [Vendas]</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Análise em Tempo Real</p>
          </div>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-zinc-800/50 border border-zinc-700/50 p-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group/item">
             <div className="flex items-start gap-3">
                <div className={insight.alert.includes('Esfriando') ? "text-amber-500 pt-0.5" : "text-blue-400 pt-0.5"}>
                  <AlertCircle size={14} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{insight.alert}</p>
                   <p className="text-xs font-bold text-white mb-1 group-hover/item:text-vj-green transition-colors">{insight.title}</p>
                   <p className="text-[11px] text-zinc-500 leading-relaxed">{insight.reason}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
         <TrendingUp size={12} className="text-vj-green" />
         <span className="text-[10px] text-zinc-500 font-medium italic">Sugerido: Priorizar estes cards para aumentar a conversão em 12% este mês.</span>
      </div>
    </div>
  );
}
