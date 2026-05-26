import React from 'react';
import { BlockDef } from '../core/types';
import { BarChart3 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const StatsBlock: BlockDef = {
  type: 'stats',
  label: 'Estatísticas',
  category: 'premium',
  icon: BarChart3,
  
  defaultProps: {
    stats: [
      { label: 'Países Visitados', value: '150+' },
      { label: 'Viajantes Satisfeitos', value: '10.000+' },
      { label: 'Anos de Experiência', value: '15' },
      { label: 'Parceiros Globais', value: '500+' }
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-20',
    paddingBottom: 'pb-20',
    backgroundColor: 'bg-vj-green',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { stats } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats?.map((stat: any, i: number) => (
              <div key={i}>
                <div className="text-5xl md:text-7xl font-black mb-2">{stat.value}</div>
                <div className="text-sm md:text-base font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
          Você tem {node.props.stats?.length || 0} estatísticas ativas. A edição detalhada dos valores estará disponível na próxima atualização do motor.
        </div>
      </div>
    );
  }
};
