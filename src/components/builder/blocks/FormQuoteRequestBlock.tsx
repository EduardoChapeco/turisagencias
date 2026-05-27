import React from 'react';
import { BlockDef } from '../core/types';
import { CalendarRange } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const FormQuoteRequestBlock: BlockDef = {
  type: 'formQuote',
  label: 'Quote Request',
  category: 'forms',
  icon: CalendarRange,
  
  defaultProps: {
    title: 'Solicitar Orçamento',
    buttonText: 'Receber Cotação',
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-zinc-50',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    // Motor Real de Supabase
    const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
      blockId: node.id, 
      source: 'Quote Request Form' 
    });
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-zinc-100">
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
          
          {isSuccess ? (
            <div className="w-full p-8 border border-emerald-200 bg-emerald-50 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">Cotação Solicitada!</h3>
              <p className="text-emerald-700">Recebemos seu pedido. Um especialista entrará em contato em breve.</p>
            </div>
          ) : (
            <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="space-y-2 md:col-span-2">
                <Label>Nome Completo</Label>
                <Input name="name" required placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input name="email" type="email" required placeholder="seu@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input name="phone" type="tel" required placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Destino Desejado</Label>
                <Input name="destination" required placeholder="Para onde você quer ir?" />
              </div>
              <div className="space-y-2">
                <Label>Data de Ida</Label>
                <Input name="departure_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data de Volta</Label>
                <Input name="return_date" type="date" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Número de Passageiros</Label>
                <Input name="passengers" type="number" min="1" defaultValue="2" />
              </div>
              <div className="md:col-span-2 mt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-zinc-950 text-white font-black rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
                </button>
              </div>
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
