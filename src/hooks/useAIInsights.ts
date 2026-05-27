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

 const fetchInsights = async () => {
 setIsLoading(true);
 
 try {
 const { data, error } = await supabase
 .from('ai_decision_logs')
 .select('*')
 .eq('org_id', organization.id)
 .order('created_at', { ascending: false })
 .limit(5);

 if (error) {
 console.error("Error fetching AI insights from decision logs:", error);
 setInsights([]);
 return;
 }

 if (data && data.length > 0) {
 const realInsights: AiInsight[] = data.map((log: any) => {
 let type: AiInsight['type'] = 'operational';
 let icon = BrainCircuit;
 let color = 'text-blue-500 bg-blue-50';

 if (log.decision_type === 'alert' || log.confidence_score < 70) {
 type = 'alert';
 icon = AlertTriangle;
 color = 'text-amber-500 bg-amber-50';
 } else if (log.decision_type === 'optimization') {
 type = 'opportunity';
 icon = Zap;
 color = 'text-vj-green bg-vj-green/10';
 } else if (log.decision_type === 'trend') {
 type = 'trend';
 icon = TrendingUp;
 color = 'text-purple-500 bg-purple-50';
 }

 return {
 id: log.id,
 type,
 title: log.agent_name || 'Agente Turis AI',
 content: log.output_summary || log.input_summary || 'Análise registrada.',
 score: log.confidence_score || 85,
 icon,
 color
 };
 });
 setInsights(realInsights);
 } else {
 setInsights([]);
 }
 } catch (err) {
 console.error("Failed to load insights:", err);
 setInsights([]);
 } finally {
 setIsLoading(false);
 }
 };

 fetchInsights();
 }, [organization?.id]);

 return { insights, isLoading };
}
