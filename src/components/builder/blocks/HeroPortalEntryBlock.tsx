import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, User, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const HeroPortalEntryBlock: BlockDef = {
 type: 'hero-portal-entry',
 label: 'Hero Portal do Cliente',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 title: 'Bem-vindo de volta',
 subtitle: 'Acesse seu portal para visualizar orçamentos, confirmar vouchers e gerenciar suas viagens em um só lugar.',
 buttonText: 'Acessar Meu Portal',
 illustrationUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1600&auto=format&fit=crop',
 },
 
 defaultStyles: {
 paddingTop: 'py-20',
 paddingBottom: 'pb-20',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText, illustrationUrl } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 relative overflow-hidden flex items-center`}>
 <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
 <div className="flex flex-col items-start order-2 lg:order-1">
 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
 <User className="w-6 h-6" />
 </div>
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h1"
 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight w-full"
 />
 <EditableText
 nodeId={node.id}
 propKey="subtitle"
 value={subtitle}
 as="p"
 className="text-lg text-zinc-600 mb-8 leading-relaxed max-w-md w-full"
 />
 
 <div className="w-full max-w-sm">
 <button className="w-full px-6 py-4 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-between transition-colors group">
 <EditableText nodeId={node.id} propKey="buttonText" value={buttonText} as="span" />
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </button>
 <p className="text-xs text-center text-zinc-500 mt-4">
 Ainda não tem acesso? Fale com seu agente.
 </p>
 </div>
 </div>
 
 <div className="order-1 lg:order-2 w-full h-[300px] lg:h-[500px] rounded-3xl overflow-hidden relative">
 <div 
 className="absolute inset-0 bg-cover bg-center"
 style={{ backgroundImage: `url(${illustrationUrl})` }}
 />
 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent mix-blend-multiply" />
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
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
 <Input 
 value={node.props.subtitle || ''} 
 onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
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
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Imagem de Apoio (URL)</Label>
 <Input 
 value={node.props.illustrationUrl || ''} 
 onChange={e => onChange({ props: { ...node.props, illustrationUrl: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
