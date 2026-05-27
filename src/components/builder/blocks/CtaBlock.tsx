import React from 'react';
import { BlockDef } from '../core/types';
import { MousePointerClick } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const CtaBlock: BlockDef = {
 type: 'cta',
 label: 'Call to Action',
 category: 'interactive',
 icon: MousePointerClick,
 
 defaultProps: {
 title: 'Pronto para transformar sua agência?',
 subtitle: 'Junte-se a milhares de parceiros de sucesso hoje mesmo.',
 buttonText: 'Começar Gratuitamente',
 },
 
 defaultStyles: {
 paddingTop: 'py-24',
 paddingBottom: 'pb-24',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-950',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-5xl mx-auto bg-zinc-950 text-white rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden ">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-vj-green/20 blur-[100px] pointer-events-none" />
 <div className="relative z-10">
 <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight max-w-3xl mx-auto">{title}</h2>
 <p className="text-xl md:text-2xl opacity-80 mb-10 max-w-2xl mx-auto">{subtitle}</p>
 <button className="px-10 py-5 bg-vj-green text-zinc-950 text-lg font-black rounded-2xl hover:scale-105 transition-transform ">
 {buttonText}
 </button>
 </div>
 </div>
 </section>
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
 className="bg-zinc-900 border-zinc-800 text-white text-sm"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
 <Input 
 value={node.props.subtitle || ''} 
 onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão Principal</Label>
 <Input 
 value={node.props.buttonText || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm"
 />
 </div>
 </div>
 );
 }
};
