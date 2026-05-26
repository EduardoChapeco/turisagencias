import React from 'react';
import { BlockDef } from '../core/types';
import { Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelDynamicPriceBadgeBlock: BlockDef = {
  type: 'travel-dynamic-price-badge',
  label: 'Dynamic Price Badge',
  category: 'travel',
  icon: Tag,
  
  defaultProps: {
    prefix: 'Starting from',
    price: '$2,999',
    suffix: 'per person',
    buttonText: 'Book Now'
  },
  
  defaultStyles: {
    paddingTop: 'py-8',
    paddingBottom: 'pb-8',
    backgroundColor: 'bg-transparent',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { prefix, price, suffix, buttonText } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 pointer-events-none`}>
        <div className="max-w-5xl mx-auto relative h-0">
          <div className="absolute right-0 -top-20 bg-white rounded-2xl shadow-2xl border border-zinc-100 p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto z-50">
            <div>
              <EditableText
                nodeId={node.id}
                propKey="prefix"
                value={prefix}
                as="div"
                className="text-sm text-zinc-500 font-medium"
              />
              <EditableText
                nodeId={node.id}
                propKey="price"
                value={price}
                as="div"
                className="text-4xl font-black text-vj-green"
              />
              <EditableText
                nodeId={node.id}
                propKey="suffix"
                value={suffix}
                as="div"
                className="text-xs text-zinc-400 mt-1"
              />
            </div>
            <EditableText
              nodeId={node.id}
              propKey="buttonText"
              value={buttonText}
              as="button"
              className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform w-full md:w-auto"
            />
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Preço</Label>
          <Input 
            value={node.props.price || ''} 
            onChange={e => onChange({ props: { ...node.props, price: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto Botão</Label>
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
