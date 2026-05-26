import React from 'react';
import { BlockDef } from '../core/types';
import { FormInput } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const FormContactBlock: BlockDef = {
  type: 'formContact',
  label: 'Contact Form',
  category: 'forms',
  icon: FormInput,
  
  defaultProps: {
    title: 'Fale Conosco',
    buttonText: 'Enviar Mensagem',
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder="Como podemos ajudar?" className="min-h-[120px]" />
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título do Formulário</Label>
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
