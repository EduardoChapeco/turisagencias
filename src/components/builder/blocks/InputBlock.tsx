import React from 'react';
import { BlockDef } from '../core/types';
import { Type } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const InputBlock: BlockDef = {
  type: 'form_input',
  label: 'Campo de Texto',
  category: 'forms',
  icon: Type,
  
  defaultProps: {
    label: 'Nome Completo',
    placeholder: 'Digite seu nome...',
    name: 'nome',
    type: 'text',
    required: true
  },
  
  defaultStyles: {
    paddingTop: 'py-2',
    paddingBottom: 'pb-2',
    backgroundColor: 'bg-transparent',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { label, placeholder, name, type, required } = node.props;
    
    return (
      <div className="w-full space-y-2">
        <label className="text-sm font-bold block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Input 
          type={type} 
          name={name}
          placeholder={placeholder} 
          required={required}
          className="border-zinc-200 focus-visible:ring-vj-green rounded-xl"
        />
      </div>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Rótulo (Label)</Label>
          <Input 
            value={node.props.label || ''} 
            onChange={e => onChange({ props: { ...node.props, label: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Placeholder</Label>
          <Input 
            value={node.props.placeholder || ''} 
            onChange={e => onChange({ props: { ...node.props, placeholder: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Nome do Campo (BD/Payload)</Label>
          <Input 
            value={node.props.name || ''} 
            onChange={e => onChange({ props: { ...node.props, name: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Tipo de Campo</Label>
          <Select 
            value={node.props.type || 'text'} 
            onValueChange={v => onChange({ props: { ...node.props, type: v } })}
          >
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="tel">Telefone</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="date">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox"
            id="req-checkbox"
            checked={node.props.required || false}
            onChange={e => onChange({ props: { ...node.props, required: e.target.checked } })}
            className="rounded border-zinc-800 bg-zinc-900 text-vj-green focus:ring-vj-green"
          />
          <Label htmlFor="req-checkbox" className="text-xs text-zinc-300 cursor-pointer">Obrigatório</Label>
        </div>
      </div>
    );
  }
};
