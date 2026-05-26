import React from 'react';
import { BlockDef } from '../core/types';
import { PlaneTakeoff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const AirlineCheckinButtonBlock: BlockDef = {
  type: 'airline-checkin-button',
  label: 'Check-in Button',
  category: 'airline',
  icon: PlaneTakeoff,
  
  defaultProps: {
    buttonText: 'Fazer check-in',
    url: 'https://',
  },
  
  defaultStyles: {
    paddingTop: 'py-4',
    paddingBottom: 'pb-4',
  },

  renderComponent: ({ node }) => {
    const { buttonText } = node.props;
    const { paddingTop, paddingBottom } = node.styles;
    
    return (
      <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
        <EditableText
          nodeId={node.id}
          propKey="buttonText"
          value={buttonText}
          as="button"
          className="w-full max-w-md px-6 py-4 bg-zinc-950 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
        />
      </div>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
          <Input 
            value={node.props.buttonText || ''} 
            onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">URL (Ação)</Label>
          <Input 
            value={node.props.url || ''} 
            onChange={e => onChange({ props: { ...node.props, url: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
            placeholder="https://..."
          />
        </div>
      </div>
    );
  }
};
