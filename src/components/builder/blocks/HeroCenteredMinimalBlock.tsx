import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroCenteredMinimalBlock: BlockDef = {
 type: 'hero-centered-minimal',
 label: 'Hero Minimalista',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 eyebrow: 'Acesso Antecipado',
 title: 'Viaje com Propósito',
 subtitle: 'Nossos roteiros são cuidadosamente planejados.',
 buttonPrimary: 'Explorar',
 buttonSecondary: 'Saber Mais'
 },
 
 defaultStyles: {
 paddingTop: 'py-32',
 paddingBottom: 'pb-32',
 backgroundColor: 'bg-gradient-to-br from-indigo-50 to-white',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { eyebrow, title, subtitle, buttonPrimary, buttonSecondary } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 relative overflow-hidden flex items-center justify-center`}>
 <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
 {eyebrow && (
 <EditableText
 nodeId={node.id}
 propKey="eyebrow"
 value={eyebrow}
 as="span"
 className="text-sm font-bold tracking-widest uppercase text-indigo-600 mb-4"
 />
 )}
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h1"
 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight w-full"
 />
 <EditableText
 nodeId={node.id}
 propKey="subtitle"
 value={subtitle}
 as="p"
 className="text-lg md:text-xl opacity-80 max-w-2xl mb-10 leading-relaxed w-full text-zinc-600"
 />
 <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
 {buttonPrimary && (
 <EditableText
 nodeId={node.id}
 propKey="buttonPrimary"
 value={buttonPrimary}
 as="button"
 className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-full hover:bg-zinc-800 transition-colors "
 />
 )}
 {buttonSecondary && (
 <EditableText
 nodeId={node.id}
 propKey="buttonSecondary"
 value={buttonSecondary}
 as="button"
 className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
 />
 )}
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Eyebrow</Label>
 <Input 
 value={node.props.eyebrow || ''} 
 onChange={e => onChange({ props: { ...node.props, eyebrow: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
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
 value={node.props.buttonPrimary || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonPrimary: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão Secundário</Label>
 <Input 
 value={node.props.buttonSecondary || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonSecondary: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
