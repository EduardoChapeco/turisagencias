import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroBlock: BlockDef = {
  type: 'hero',
  label: 'Hero Section',
  category: 'layout',
  icon: LayoutTemplate,
  
  defaultProps: {
    title: 'Sua Próxima Aventura Começa Aqui',
    subtitle: 'Descubra destinos incríveis com roteiros exclusivos e suporte premium 24h.',
    buttonText: 'Ver Roteiros',
    align: 'center',
  },
  
  defaultStyles: {
    paddingTop: 'py-24',
    paddingBottom: 'pb-24',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, buttonText, align } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 relative overflow-hidden`}>
        <div className={`max-w-4xl mx-auto flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h1"
            className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight w-full"
          />
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            as="p"
            className="text-lg md:text-xl opacity-80 max-w-2xl mb-8 leading-relaxed w-full"
          />
          {buttonText && (
            <EditableText
              nodeId={node.id}
              propKey="buttonText"
              value={buttonText}
              as="button"
              className="px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-105 transition-transform shadow-xl"
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título Principal</Label>
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão Principal</Label>
          <Input 
            value={node.props.buttonText || ''} 
            onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Alinhamento</Label>
          <select 
            value={node.props.align || 'center'}
            onChange={e => onChange({ props: { ...node.props, align: e.target.value } })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
          </select>
        </div>
      </div>
    );
  }
};
