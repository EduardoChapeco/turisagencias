import React from 'react';
import { BlockDef } from '../core/types';
import { Grid } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';
import { Button } from '@/components/ui/button';

export const FeatureAdvancedGridBlock: BlockDef = {
  type: 'feature-advanced-grid',
  label: 'Bento Grid Features',
  category: 'features',
  icon: Grid,
  
  defaultProps: {
    title: 'Por que escolher a Turis?',
    subtitle: 'Nossos diferenciais que transformam a sua viagem em uma experiência única e inesquecível.',
    features: [
      { id: '1', title: 'Suporte 24/7', description: 'Atendimento humanizado em qualquer fuso horário.', icon: 'Headphones' },
      { id: '2', title: 'Roteiros Exclusivos', description: 'Curadoria especializada para destinos exóticos.', icon: 'Map' },
      { id: '3', title: 'Seguro Viagem', description: 'Cobertura completa para imprevistos.', icon: 'Shield' },
      { id: '4', title: 'Pagamento Flexível', description: 'Parcele em até 12x sem juros no cartão.', icon: 'CreditCard' },
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-24',
    paddingBottom: 'pb-24',
    backgroundColor: 'bg-zinc-50',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, features } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    const items = Array.isArray(features) ? features : [];
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <EditableText
              nodeId={node.id}
              propKey="title"
              value={title}
              as="h2"
              className="text-4xl md:text-5xl font-black tracking-tight mb-6"
            />
            <EditableText
              nodeId={node.id}
              propKey="subtitle"
              value={subtitle}
              as="p"
              className="text-lg md:text-xl opacity-70"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((feature: any, index: number) => {
              // Create dynamic bento layout - different sizes for different index
              const isLarge = index === 0 || index === 3;
              return (
                <div 
                  key={feature.id || index}
                  className={`bg-white rounded-3xl p-8 border border-zinc-200/50 shadow-sm hover:shadow-xl transition-all duration-300 ${
                    isLarge ? 'md:col-span-2' : 'col-span-1'
                  }`}
                >
                  <div className="w-12 h-12 bg-vj-green/20 text-vj-green rounded-xl flex items-center justify-center mb-6">
                    <Grid className="w-6 h-6" /> {/* Placeholder for dynamic icon */}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    const items = Array.isArray(node.props.features) ? node.props.features : [];
    
    const updateFeature = (index: number, key: string, value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [key]: value };
      onChange({ props: { ...node.props, features: newItems } });
    };

    const addFeature = () => {
      onChange({ 
        props: { 
          ...node.props, 
          features: [...items, { id: Math.random().toString(), title: 'Novo Recurso', description: 'Descrição detalhada.' }] 
        } 
      });
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título da Seção</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
          <Textarea 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
        
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Itens da Grade</Label>
          {items.map((feature: any, index: number) => (
            <div key={feature.id || index} className="p-3 bg-zinc-900 rounded-lg space-y-3 border border-zinc-800">
              <Input 
                value={feature.title || ''} 
                onChange={e => updateFeature(index, 'title', e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white text-sm h-8"
                placeholder="Título"
              />
              <Textarea 
                value={feature.description || ''} 
                onChange={e => updateFeature(index, 'description', e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white text-xs min-h-[60px]"
                placeholder="Descrição"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full h-7 text-xs"
                onClick={() => {
                  const newItems = [...items];
                  newItems.splice(index, 1);
                  onChange({ props: { ...node.props, features: newItems } });
                }}
              >
                Remover
              </Button>
            </div>
          ))}
          <Button 
            variant="outline" 
            className="w-full border-dashed border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            onClick={addFeature}
          >
            + Adicionar Item
          </Button>
        </div>
      </div>
    );
  }
};
