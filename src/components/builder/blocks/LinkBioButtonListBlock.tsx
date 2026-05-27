import React from 'react';
import { BlockDef } from '../core/types';
import { List, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const LinkBioButtonListBlock: BlockDef = {
 type: 'linkbio-button-list',
 label: 'LinkBio Button List',
 category: 'linkbio',
 icon: List,
 
 defaultProps: {
 buttons: [
 { id: '1', text: 'Nosso Site Oficial', url: 'https://seusite.com.br' },
 { id: '2', text: 'Fale Conosco', url: 'https://wa.me/5511999999999' },
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-4',
 paddingBottom: 'pb-4',
 },

 renderComponent: ({ node }) => {
 const { buttons } = node.props;
 const { paddingTop, paddingBottom } = node.styles;
 
 return (
 <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
 <div className="w-full max-w-md flex flex-col gap-3">
 {(buttons || []).map((btn: any) => (
 <a key={btn.id} href={btn.url} target="_blank" rel="noopener noreferrer" className="block w-full">
 <div className="w-full p-4 bg-white border border-zinc-200 text-zinc-900 font-medium rounded-xl hover:bg-zinc-50 transition-colors text-center ">
 {btn.text}
 </div>
 </a>
 ))}
 </div>
 </div>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 const buttons = node.props.buttons || [];

 const updateButton = (id: string, field: string, value: string) => {
 const newButtons = buttons.map((b: any) => 
 b.id === id ? { ...b, [field]: value } : b
 );
 onChange({ props: { ...node.props, buttons: newButtons } });
 };

 const removeButton = (id: string) => {
 const newButtons = buttons.filter((b: any) => b.id !== id);
 onChange({ props: { ...node.props, buttons: newButtons } });
 };

 const addButton = () => {
 const newId = String(Date.now());
 const newButtons = [...buttons, { id: newId, text: 'Novo Link', url: 'https://' }];
 onChange({ props: { ...node.props, buttons: newButtons } });
 };

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <Label className="text-xs uppercase text-zinc-500 font-bold">Botões do LinkBio</Label>
 <button 
 onClick={addButton}
 className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded"
 >
 <Plus className="w-3 h-3" />
 Adicionar
 </button>
 </div>

 <div className="space-y-3">
 {buttons.map((btn: any, index: number) => (
 <div key={btn.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg relative">
 <button 
 onClick={() => removeButton(btn.id)}
 className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 
 <div className="space-y-2 pr-6">
 <div className="space-y-1">
 <Label className="text-[10px] text-zinc-400">Texto ({index + 1})</Label>
 <Input 
 value={btn.text} 
 onChange={e => updateButton(btn.id, 'text', e.target.value)}
 className="bg-zinc-950 border-zinc-800 text-white text-xs h-8"
 />
 </div>
 <div className="space-y-1">
 <Label className="text-[10px] text-zinc-400">URL Destino</Label>
 <Input 
 value={btn.url} 
 onChange={e => updateButton(btn.id, 'url', e.target.value)}
 className="bg-zinc-950 border-zinc-800 text-white text-xs h-8"
 placeholder="https://"
 />
 </div>
 </div>
 </div>
 ))}
 {buttons.length === 0 && (
 <p className="text-xs text-zinc-500 text-center py-4">Nenhum botão configurado.</p>
 )}
 </div>
 </div>
 );
 }
};
