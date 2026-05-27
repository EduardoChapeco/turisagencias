import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroSplitImageBlock: BlockDef = {
 type: 'hero-split-image',
 label: 'Hero com Imagem Lado a Lado',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 title: 'Explore o Inexplorado',
 subtitle: 'Uma jornada inesquecível pelas maravilhas da natureza.',
 buttonText: 'Quero Conhecer',
 imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1600&auto=format&fit=crop',
 },
 
 defaultStyles: {
 paddingTop: 'py-0',
 paddingBottom: 'pb-0',
 backgroundColor: 'bg-white',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText, imageUrl } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} relative overflow-hidden flex flex-col md:flex-row min-h-[80vh]`}>
 <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h1"
 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight w-full"
 />
 <EditableText
 nodeId={node.id}
 propKey="subtitle"
 value={subtitle}
 as="p"
 className="text-lg md:text-xl opacity-80 mb-8 leading-relaxed w-full text-zinc-600"
 />
 {buttonText && (
 <div>
 <EditableText
 nodeId={node.id}
 propKey="buttonText"
 value={buttonText}
 as="button"
 className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors"
 />
 </div>
 )}
 </div>
 <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full">
 <div 
 className="absolute inset-0 bg-cover bg-center"
 style={{ backgroundImage: `url(${imageUrl})` }}
 />
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
 <Textarea 
 value={node.props.subtitle || ''} 
 onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm min-h-[80px]"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão</Label>
 <Input 
 value={node.props.buttonText || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">URL da Imagem</Label>
 <div className="flex gap-2">
 <Input 
 value={node.props.imageUrl || ''} 
 onChange={e => onChange({ props: { ...node.props, imageUrl: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9 flex-1"
 />
 <div className="w-9 h-9 bg-zinc-800 rounded flex items-center justify-center">
 <ImageIcon className="w-4 h-4 text-zinc-400" />
 </div>
 </div>
 </div>
 </div>
 );
 }
};
