import { useAIInsights, type KanbanInsight } from '@/hooks/useAIInsights';
import { AlertCircle, TrendingUp, Sparkles, X, Flame, Clock, DollarSign, Tag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ALERT_CONFIG: Record<KanbanInsight['alert_type'], {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  lead_cold:       { icon: Flame,       color: 'text-red-400',    bgColor: 'bg-red-500/10',    label: 'Lead Frio' },
  lead_cooling:    { icon: Clock,       color: 'text-amber-400',  bgColor: 'bg-amber-500/10',  label: 'Esfriando' },
  high_value_no_quote: { icon: DollarSign, color: 'text-blue-400', bgColor: 'bg-blue-500/10',  label: 'Alto Valor' },
  no_value_estimate:   { icon: Tag,     color: 'text-purple-400', bgColor: 'bg-purple-500/10', label: 'Sem Valor' },
  needs_action:    { icon: AlertCircle, color: 'text-zinc-400',   bgColor: 'bg-zinc-500/10',   label: 'Ação Necessária' },
};

export function AiInsightsWidget() {
  const { data: insights, isLoading, error } = useAIInsights();
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  // Nothing to show if loading, error, no insights or user dismissed
  if (!isVisible) return null;
  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 mb-6 shadow-none">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-xl bg-zinc-800" />
          <Skeleton className="h-4 w-48 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl bg-zinc-800" />
          <Skeleton className="h-20 rounded-xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  // No insights = pipeline saudável, show nothing (no fake content)
  if (!insights || insights.length === 0 || error) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 mb-6 relative overflow-hidden group shadow-none">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <Sparkles size={120} className="text-white" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-vj-green/15 p-2.5 rounded-xl border border-vj-green/20">
            <Sparkles size={16} className="text-vj-green" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Sugestões do Assistente</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">
              {insights.length} {insights.length === 1 ? 'alerta' : 'alertas'} do Funil de Vendas
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
          aria-label="Dispensar sugestões"
        >
          <X size={16} />
        </button>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 relative z-10">
        {insights.map((insight) => {
          const config = ALERT_CONFIG[insight.alert_type];
          const Icon = config.icon;

          return (
            <button
              key={insight.card_id}
              onClick={() => navigate('/kanban/sales')}
              className="text-left bg-zinc-800/40 border border-zinc-700/40 p-4 rounded-2xl hover:bg-zinc-800/70 hover:border-zinc-600 transition-all cursor-pointer group/item"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${config.bgColor}`}>
                  <Icon size={13} className={config.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
                      {config.label}
                    </p>
                    <span className="text-[9px] text-zinc-600 font-medium">{insight.column_name}</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1 group-hover/item:text-vj-green transition-colors line-clamp-1">
                    {insight.card_title}
                  </p>
                  {insight.client_name && (
                    <p className="text-[10px] text-zinc-500 mb-1.5">{insight.client_name}</p>
                  )}
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {insight.alert_message}
                  </p>
                  {insight.estimated_value && (
                    <p className="text-[10px] text-vj-green font-bold mt-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(insight.estimated_value)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-2 relative z-10">
        <TrendingUp size={12} className="text-vj-green" />
        <span className="text-[10px] text-zinc-500 font-medium">
          Análise em tempo real do Funil de Vendas · Atualizado agora
        </span>
      </div>
    </div>
  );
}
