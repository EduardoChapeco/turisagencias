import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Star } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroDarkLuxuryBlock: BlockDef = {
  type: 'hero-dark-luxury',
  label: 'Hero Luxo Dark',
  category: 'hero',
  icon: LayoutTemplate,
  
  defaultProps: {
    kicker: 'Experiências Exclusivas',
    title: 'Redefina sua forma de viajar.',
    subtitle: 'Roteiros de alto padrão criados sob medida para clientes que buscam sofisticação e conforto inigualáveis.',
    buttonText: 'Descobrir Experiências',
    backgroundImage: 'https://images.unsplash.com/photo-1542314831-c6a4d1421044?q=80&w=1600&auto=format&fit=crop'
  },
  
  defaultStyles: {
    paddingTop: 'py-0',
    paddingBottom: 'pb-0',
    backgroundColor: 'bg-zinc-950',
    textColor: 'text-amber-50',
  },

  renderComponent: ({ node }) => {
    const { kicker, title, subtitle, buttonText, backgroundImage } = node.props;
    const { paddingTop, paddingBottom, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${textColor} relative overflow-hidden min-h-[85vh] flex items-center`}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-0" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 md:px-16 flex flex-col items-start">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-amber-500"></div>
            <EditableText
              nodeId={node.id}
              propKey="kicker"
              value={kicker}
              as="span"
              className="text-amber-500 text-sm font-semibold tracking-[0.2em] uppercase"
            />
          </div>
          
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h1"
            className="text-5xl md:text-7xl font-serif mb-8 leading-[1.1] max-w-2xl drop-shadow-xl"
          />
          
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            as="p"
            className="text-lg md:text-xl font-light text-zinc-300 max-w-xl mb-12 leading-relaxed"
          />
          
          {buttonText && (
            <EditableText
              nodeId={node.id}
              propKey="buttonText"
              value={buttonText}
              as="button"
              className="px-8 py-4 border border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 uppercase tracking-widest text-sm font-medium transition-all backdrop-blur-sm"
            />
          )}
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Kicker (Texto acima do título)</Label>
          <Input 
            value={node.props.kicker || ''} 
            onChange={e => onChange({ props: { ...node.props, kicker: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título (Serif)</Label>
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
            className="bg-zinc-900 border-zinc-800 text-white text-sm min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão</Label>
          <Input 
            value={node.props.buttonText || ''} 
            onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Imagem de Fundo (URL)</Label>
          <Input 
            value={node.props.backgroundImage || ''} 
            onChange={e => onChange({ props: { ...node.props, backgroundImage: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
