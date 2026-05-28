import React from 'react';
import { MediaPicker } from '../MediaPicker';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Users, Calendar, Bus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const HeroGroupTripBlock: BlockDef = {
 type: 'hero-group-trip',
 label: 'Hero Excursão',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 title: 'Expedição Serra Gaúcha',
 date: '15 a 18 de Novembro',
 spots: '12 vagas restantes',
 transport: 'Ônibus Leito Cama',
 price: 'R$ 1.450,00',
 buttonText: 'Garantir Minha Vaga',
 backgroundImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1600&auto=format&fit=crop',
 },
 
 defaultStyles: {
 paddingTop: 'py-0',
 paddingBottom: 'pb-0',
 backgroundColor: 'bg-black',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { title, date, spots, transport, price, buttonText, backgroundImage } = node.props;
 const { paddingTop, paddingBottom, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${textColor} relative overflow-hidden flex items-center justify-center min-h-[60vh]`}>
 <div 
 className="absolute inset-0 bg-cover bg-center z-0"
 style={{ backgroundImage: `url(${backgroundImage})` }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-0" />
 
 <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-end justify-between gap-8 h-full">
 <div className="flex-1 w-full">
 <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
 Últimas Vagas
 </div>
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h1"
 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight"
 />
 
 <div className="flex flex-wrap gap-4 md:gap-6">
 <div className="flex items-center text-zinc-300">
 <Calendar className="w-5 h-5 mr-2 text-white" />
 <EditableText nodeId={node.id} propKey="date" value={date} as="span" />
 </div>
 <div className="flex items-center text-zinc-300">
 <Users className="w-5 h-5 mr-2 text-white" />
 <EditableText nodeId={node.id} propKey="spots" value={spots} as="span" />
 </div>
 <div className="flex items-center text-zinc-300">
 <Bus className="w-5 h-5 mr-2 text-white" />
 <EditableText nodeId={node.id} propKey="transport" value={transport} as="span" />
 </div>
 </div>
 </div>
 
 <div className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center md:items-end text-center md:text-right">
 <span className="text-sm font-medium text-zinc-300 mb-1">A partir de</span>
 <EditableText
 nodeId={node.id}
 propKey="price"
 value={price}
 as="div"
 className="text-3xl font-black text-white mb-4"
 />
 <EditableText
 nodeId={node.id}
 propKey="buttonText"
 value={buttonText}
 as="button"
 className="w-full px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors "
 />
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2 col-span-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título do Roteiro</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Data</Label>
 <Input 
 value={node.props.date || ''} 
 onChange={e => onChange({ props: { ...node.props, date: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Vagas</Label>
 <Input 
 value={node.props.spots || ''} 
 onChange={e => onChange({ props: { ...node.props, spots: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Transporte</Label>
 <Input 
 value={node.props.transport || ''} 
 onChange={e => onChange({ props: { ...node.props, transport: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Preço</Label>
 <Input 
 value={node.props.price || ''} 
 onChange={e => onChange({ props: { ...node.props, price: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2 col-span-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão</Label>
 <Input 
 value={node.props.buttonText || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2 col-span-2">
 <MediaPicker label="Imagem de Fundo" value={node.props.backgroundImage || ''} onChange={url => onChange({ props: { ...node.props, backgroundImage: url } })} />
 </div>
 </div>
 </div>
 );
 }
};
