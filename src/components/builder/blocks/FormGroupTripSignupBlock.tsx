import React from 'react';
import { BlockDef } from '../core/types';
import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

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
    
    // Motor Real de Supabase
    const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
      blockId: node.id, 
      source: 'Group Trip Signup Form' 
    });

    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-lg mx-auto border border-zinc-800 p-8 rounded-2xl bg-zinc-900/50 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
          
          {isSuccess ? (
            <div className="w-full p-8 border border-emerald-900/50 bg-emerald-900/20 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">Vaga Pré-Reservada!</h3>
              <p className="text-emerald-200">Um guia entrará em contato via WhatsApp para finalizar a reserva.</p>
            </div>
          ) : (
            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label className="text-zinc-300">Nome Completo</Label>
                <Input name="name" required placeholder="Seu nome" className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">WhatsApp</Label>
                <Input name="phone" type="tel" required placeholder="(00) 00000-0000" className="bg-zinc-950 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Quantas vagas?</Label>
                <Input name="spots" type="number" required min="1" defaultValue="1" className="bg-zinc-950 border-zinc-800" />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-[1.02] transition-transform mt-4 flex items-center justify-center disabled:opacity-50"
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
