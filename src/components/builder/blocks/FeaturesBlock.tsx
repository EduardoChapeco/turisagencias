import React from 'react';
import { BlockDef } from '../core/types';
import { Layers, Shield, Zap, Globe, Compass } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const iconsMap: Record<string, any> = {
  shield: Shield,
  zap: Zap,
  globe: Globe,
  compass: Compass
};

export const FeaturesBlock: BlockDef = {
  type: 'features',
  label: 'Grid de Features',
  category: 'layout',
  icon: Layers,
  
  defaultProps: {
    title: 'Por que viajar conosco?',
    features: [
      { title: 'Segurança Total', desc: 'Sua viagem protegida de ponta a ponta.', iconName: 'shield' },
      { title: 'Velocidade', desc: 'Reservas confirmadas instantaneamente.', iconName: 'zap' },
      { title: 'Destinos Globais', desc: 'Mais de 150 países no catálogo.', iconName: 'globe' },
      { title: 'Guias Locais', desc: 'Experiências autênticas com quem entende.', iconName: 'compass' },
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-24',
    paddingBottom: 'pb-24',
    backgroundColor: 'bg-zinc-950',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, features } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-16 text-center">{title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features?.map((feat: any, i: number) => {
              const IconComp = iconsMap[feat.iconName] || Shield;
              return (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-vj-green/20 text-vj-green flex items-center justify-center mb-6">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="opacity-70 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título Principal</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
      </div>
    );
  }
};
