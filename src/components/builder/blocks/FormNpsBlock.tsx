import React from 'react';
import { BlockDef } from '../core/types';
import { Star } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const FormNpsBlock: BlockDef = {
  type: 'formNps',
  label: 'NPS Scale',
  category: 'forms',
  icon: Star,
  
  defaultProps: {
    title: 'Em uma escala de 0 a 10',
    subtitle: 'O quanto você recomendaria nossa agência para um amigo?',
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 text-center`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-medium mb-1">{title}</h2>
          <p className="text-2xl font-bold mb-8">{subtitle}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button 
                key={num} 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center font-bold hover:bg-zinc-100 transition-colors focus:bg-zinc-950 focus:text-white focus:border-zinc-950"
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between max-w-[600px] mx-auto text-sm opacity-60 px-2">
            <span>0 - Nada provável</span>
            <span>10 - Muito provável</span>
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Pergunta (Subtítulo)</Label>
          <Input 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
