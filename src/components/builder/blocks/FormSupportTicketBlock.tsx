import React from 'react';
import { BlockDef } from '../core/types';
import { LifeBuoy } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const FormSupportTicketBlock: BlockDef = {
  type: 'formSupportTicket',
  label: 'Support Ticket',
  category: 'forms',
  icon: LifeBuoy,
  
  defaultProps: {
    title: 'Abrir Chamado de Suporte',
    buttonText: 'Enviar Solicitação',
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
        <div className="max-w-xl mx-auto border border-zinc-200 p-8 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <LifeBuoy className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
          <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label>E-mail do Passageiro</Label>
              <Input type="email" placeholder="E-mail usado na compra" />
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <select className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option>Cancelamento</option>
                <option>Alteração de Voo</option>
                <option>Dúvida sobre Bagagem</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva seu problema com detalhes..." className="min-h-[120px]" />
            </div>
            <button className="w-full px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2">
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
