import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { BrainCircuit, TrendingUp, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';

export interface AiInsight {
  id: string;
  type: 'trend' | 'alert' | 'opportunity' | 'operational';
  title: string;
  content: string;
  score: number;
  icon: any;
  color: string;
}

export function useAiInsights() {
  const { organization } = useAuthStore();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    // SIMULAÇÃO DE MOTOR COGNITIVO REAL (Integrável com FastAPI/LangGraph)
    const fetchInsights = async () => {
      setIsLoading(true);
      
      // Simula latência de processamento do esquadrão
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockInsights: AiInsight[] = [
        {
          id: '1',
          type: 'trend',
          title: 'Boom no Caribe',
          content: 'Detectamos uma alta de 22% na demanda para Punta Cana. Sugerimos revisar o markup dos pacotes "Early Bird".',
          score: 92,
          icon: TrendingUp,
          color: 'text-vj-green bg-vj-green/10'
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Gargalo em GRU',
          content: 'A malha aérea para Julho em GRU está instável. O Agente ATLAS recomenda rotear voos via VCP para maior segurança.',
          score: 88,
          icon: BrainCircuit,
          color: 'text-blue-500 bg-blue-50'
        },
        {
          id: '3',
          type: 'alert',
          title: 'Risco Operacional',
          content: '3 cotações pendentes expiram em 2h. Probabilidade de conversão cai 40% se não houver followup agora.',
          score: 95,
          icon: Zap,
          color: 'text-amber-500 bg-amber-50'
        }
      ];

      setInsights(mockInsights);
      setIsLoading(false);
    };

    fetchInsights();
  }, [organization?.id]);

  return { insights, isLoading };
}
