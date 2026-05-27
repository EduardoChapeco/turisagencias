import React from 'react';
import { BlockDef } from '../core/types';
import { MessageSquareQuote } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrayField } from '../core/ArrayField';

export const TestimonialsBlock: BlockDef = {
  type: 'testimonials',
  label: 'Depoimentos',
  category: 'premium',
  icon: MessageSquareQuote,
  
  defaultProps: {
    title: 'O que dizem sobre nós',
    testimonials: [
      { quote: "A melhor experiência que já tive! O roteiro foi impecável do início ao fim, não precisei me preocupar com absolutamente nada.", author: "Mariana Silva", role: "Cliente Premium" },
      { quote: "Atendimento de ponta. Fizeram upgrades no meu hotel que eu nem sabia que eram possíveis. Recomendo de olhos fechados.", author: "Carlos Andrade", role: "Viajante Frequente" },
      { quote: "Organizaram nosso cruzeiro pela Europa em tempo recorde. A Turis é fantástica em curadoria de luxo.", author: "Juliana & Marcos", role: "Lua de Mel" }
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-24',
    paddingBottom: 'pb-24',
    backgroundColor: 'bg-zinc-950',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, testimonials } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">{title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.map((test: any, i: number) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative">
                <MessageSquareQuote className="w-10 h-10 text-vj-green/50 absolute top-8 right-8" />
                <p className="text-lg italic leading-relaxed mb-8 relative z-10">"{test.quote}"</p>
                <div>
                  <h4 className="font-bold text-lg">{test.author}</h4>
                  <p className="text-sm opacity-60">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
        
        <ArrayField
          title="Depoimentos"
          items={node.props.testimonials || []}
          onChange={(testimonials) => onChange({ props: { ...node.props, testimonials } })}
          defaultItem={{ quote: 'Novo depoimento', author: 'Nome', role: 'Cliente' }}
          schema={[
            { key: 'quote', label: 'Citação', type: 'textarea' },
            { key: 'author', label: 'Autor', type: 'text' },
            { key: 'role', label: 'Cargo / Papel', type: 'text' }
          ]}
        />
      </div>
    );
  }
};
