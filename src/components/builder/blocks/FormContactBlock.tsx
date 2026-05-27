import React from 'react';
import { BlockDef } from '../core/types';
import { FormInput } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

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
    
    // Motor Real de Supabase
    const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
      blockId: node.id, 
      source: 'Contact Form' 
    });
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-6">{title}</h2>
          
          {isSuccess ? (
            <div className="w-full p-8 border border-emerald-200 bg-emerald-50 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">Mensagem Enviada!</h3>
              <p className="text-emerald-700">Agradecemos o contato. Retornaremos em breve.</p>
            </div>
          ) : (
            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input name="name" required placeholder="Seu nome completo" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input name="email" type="email" required placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input name="phone" type="tel" required placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea name="message" required placeholder="Como podemos ajudar?" className="min-h-[120px]" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-[1.02] transition-transform mt-4 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
              </button>
            </form>
          )}
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
