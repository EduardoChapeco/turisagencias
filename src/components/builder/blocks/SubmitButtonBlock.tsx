import React from 'react';
import { BlockDef } from '../core/types';
import { Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const SubmitButtonBlock: BlockDef = {
 type: 'form_submit',
 label: 'Botão de Envio',
 category: 'forms',
 icon: Play,
 
 defaultProps: {
 text: 'Enviar Formulário',
 styleMode: 'primary'
 },
 
 defaultStyles: {
 paddingTop: 'py-4',
 paddingBottom: 'pb-2',
 backgroundColor: 'bg-transparent',
 textColor: 'text-zinc-950',
 },

 renderComponent: ({ node }) => {
 const { text, styleMode } = node.props;
 
 return (
 <div className="w-full">
 <button 
 type="submit"
 className={`w-full py-4 px-6 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] ${
 styleMode === 'primary' 
 ? 'bg-vj-green text-zinc-950 hover:bg-vj-green/90' 
 : 'bg-zinc-900 text-white hover:bg-zinc-800'
 }`}
 >
 {text}
 </button>
 </div>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
 <Input 
 value={node.props.text || ''} 
 onChange={e => onChange({ props: { ...node.props, text: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Estilo</Label>
 <select 
 value={node.props.styleMode || 'primary'} 
 onChange={e => onChange({ props: { ...node.props, styleMode: e.target.value } })}
 className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2 h-9"
 >
 <option value="primary">Verde Turis (Destaque)</option>
 <option value="secondary">Preto/Escuro</option>
 </select>
 </div>
 </div>
 );
 }
};
