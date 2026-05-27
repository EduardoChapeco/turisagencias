import React from 'react';
import { BlockDef } from '../core/types';
import { PanelBottom } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const CtaStickyBottomBlock: BlockDef = {
 type: 'ctaStickyBottom',
 label: 'Sticky Bottom Bar',
 category: 'cta',
 icon: PanelBottom,
 
 defaultProps: {
 title: 'Fale com um Especialista Agora',
 buttonText: 'Chamar no WhatsApp',
 },
 
 defaultStyles: {
 backgroundColor: 'bg-zinc-950',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { title, buttonText } = node.props;
 const { backgroundColor, textColor } = node.styles;
 
 return (
 <div className={`fixed bottom-0 left-0 w-full z-50 ${backgroundColor} ${textColor} _-4px_20px_rgba(0,0,0,0.1)] border-t border-white/10`}>
 <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-3">
 <span className="font-medium text-sm sm:text-base text-center sm:text-left">{title}</span>
 <button className="w-full sm:w-auto px-6 py-2.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors ">
 {buttonText}
 </button>
 </div>
 </div>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto Principal</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
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
