import React from 'react';
import { BlockDef } from '../core/types';
import { Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const FormWaitlistBlock: BlockDef = {
  type: 'formWaitlist',
  label: 'Waitlist',
  category: 'forms',
  icon: Mail,
  
  defaultProps: {
    title: 'Entre na Lista de Espera',
    subtitle: 'Seja o primeiro a saber quando abrirmos novas vagas.',
    buttonText: 'Inscrever-se',
  },
  
  defaultStyles: {
    paddingTop: 'py-16',
    paddingBottom: 'pb-16',
    backgroundColor: 'bg-zinc-100',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 text-center`}>
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          <p className="opacity-80 mb-8">{subtitle}</p>
          <form className="w-full flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="Seu melhor e-mail" className="h-12 bg-white" />
            <button className="px-6 py-3 bg-zinc-950 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap">
              {buttonText}
            </button>
          </form>
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
