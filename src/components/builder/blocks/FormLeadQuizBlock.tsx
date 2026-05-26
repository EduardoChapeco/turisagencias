import React from 'react';
import { BlockDef } from '../core/types';
import { ListTodo } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const FormLeadQuizBlock: BlockDef = {
  type: 'formLeadQuiz',
  label: 'Lead Quiz',
  category: 'forms',
  icon: ListTodo,
  
  defaultProps: {
    title: 'Descubra seu perfil de viajante',
    subtitle: 'Responda a 3 perguntas e receba um roteiro personalizado.',
    buttonText: 'Começar Quiz',
  },
  
  defaultStyles: {
    paddingTop: 'py-16',
    paddingBottom: 'pb-16',
    backgroundColor: 'bg-zinc-900',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 text-center`}>
        <div className="max-w-xl mx-auto bg-zinc-800/50 p-10 rounded-3xl border border-zinc-700/50">
          <ListTodo className="w-12 h-12 text-vj-green mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          <p className="opacity-80 mb-8">{subtitle}</p>
          <div className="space-y-4 mb-8 text-left">
            <button className="w-full p-4 border border-zinc-700 rounded-xl hover:bg-zinc-700/50 transition-colors flex justify-between items-center group">
              <span>Eu prefiro praia e calor</span>
              <div className="w-5 h-5 rounded-full border-2 border-zinc-600 group-hover:border-vj-green"></div>
            </button>
            <button className="w-full p-4 border border-zinc-700 rounded-xl hover:bg-zinc-700/50 transition-colors flex justify-between items-center group">
              <span>Eu prefiro montanha e frio</span>
              <div className="w-5 h-5 rounded-full border-2 border-zinc-600 group-hover:border-vj-green"></div>
            </button>
          </div>
          <button className="px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-105 transition-transform">
            {buttonText}
          </button>
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
          <Input 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
          <Input 
            value={node.props.buttonText || ''} 
            onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
