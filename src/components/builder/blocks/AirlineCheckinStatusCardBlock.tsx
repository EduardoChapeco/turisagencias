import React from 'react';
import { BlockDef } from '../core/types';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const AirlineCheckinStatusCardBlock: BlockDef = {
  type: 'airline-checkin-status',
  label: 'Check-in Status Card',
  category: 'airline',
  icon: Clock,
  
  defaultProps: {
    title: 'Check-in Aberto',
    description: 'Encerra em 45 minutos',
    status: 'open',
  },
  
  defaultStyles: {
    paddingTop: 'py-6',
    paddingBottom: 'pb-6',
  },

  renderComponent: ({ node }) => {
    const { title, description, status } = node.props;
    const { paddingTop, paddingBottom } = node.styles;
    
    return (
      <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${status === 'open' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
            <Clock className="w-6 h-6" />
          </div>
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h3"
            className="text-lg font-bold text-zinc-900 mb-1"
          />
          <EditableText
            nodeId={node.id}
            propKey="description"
            value={description}
            as="p"
            className="text-sm text-zinc-500"
          />
        </div>
      </div>
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Descrição</Label>
          <Input 
            value={node.props.description || ''} 
            onChange={e => onChange({ props: { ...node.props, description: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Status da Janela</Label>
          <select 
            value={node.props.status || 'open'}
            onChange={e => onChange({ props: { ...node.props, status: e.target.value } })}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
          >
            <option value="open">Aberto (Verde)</option>
            <option value="closed">Fechado (Cinza)</option>
          </select>
        </div>
      </div>
    );
  }
};
