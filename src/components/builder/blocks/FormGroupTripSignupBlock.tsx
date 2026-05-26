import React from 'react';
import { BlockDef } from '../core/types';
import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const FormGroupTripSignupBlock: BlockDef = {
  type: 'formGroupTrip',
  label: 'Group Trip Signup',
  category: 'forms',
  icon: Users,
  
  defaultProps: {
    title: 'Quero participar desta excursão',
    buttonText: 'Garantir Vaga',
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-zinc-950',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-lg mx-auto border border-zinc-800 p-8 rounded-2xl bg-zinc-900/50 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
          <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label className="text-zinc-300">Nome Completo</Label>
              <Input placeholder="Seu nome" className="bg-zinc-950 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">WhatsApp</Label>
              <Input type="tel" placeholder="(00) 00000-0000" className="bg-zinc-950 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Quantas vagas?</Label>
              <Input type="number" min="1" defaultValue="1" className="bg-zinc-950 border-zinc-800" />
            </div>
            <button className="w-full px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-[1.02] transition-transform mt-4">
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
