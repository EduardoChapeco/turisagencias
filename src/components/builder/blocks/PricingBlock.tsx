import React from 'react';
import { BlockDef } from '../core/types';
import { CreditCard, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const PricingBlock: BlockDef = {
  type: 'pricing',
  label: 'Tabela de Preços',
  category: 'premium',
  icon: CreditCard,
  
  defaultProps: {
    title: 'Planos Transparentes',
    subtitle: 'Escolha o melhor plano para a sua necessidade.',
    plans: [
      { name: 'Básico', price: 'R$ 99', features: 'Suporte email, 10 Projetos', isPopular: false },
      { name: 'Pro', price: 'R$ 199', features: 'Suporte 24/7, Projetos Ilimitados', isPopular: true },
      { name: 'Enterprise', price: 'Custom', features: 'Gerente dedicado, SLA 99.9%', isPopular: false },
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-20',
    paddingBottom: 'pb-20',
    backgroundColor: 'bg-zinc-50',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, plans } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{title}</h2>
            <p className="text-lg opacity-70">{subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans?.map((plan: any, i: number) => (
              <div 
                key={i} 
                className={`rounded-3xl p-8 relative border ${plan.isPopular ? 'bg-zinc-950 text-white border-zinc-800 scale-105 shadow-2xl z-10' : 'bg-white border-zinc-200'}`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-vj-green text-zinc-950 text-xs font-black uppercase tracking-wider py-1 px-4 rounded-full">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-6">{plan.price}<span className="text-sm font-normal opacity-50">/mês</span></div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.split(',').map((f: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      <Check className={`w-5 h-5 ${plan.isPopular ? 'text-vj-green' : 'text-zinc-400'}`} />
                      <span className="opacity-80">{f.trim()}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.isPopular ? 'bg-vj-green text-zinc-950 hover:bg-green-400' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'}`}>
                  Assinar Agora
                </button>
              </div>
            ))}
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
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
          <Input 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
        <div className="p-3 bg-blue-900/20 text-blue-400 text-xs rounded-lg border border-blue-900/50">
          Para editar os planos individualmente, em breve disponibilizaremos edição em linha direto no canvas!
        </div>
      </div>
    );
  }
};
