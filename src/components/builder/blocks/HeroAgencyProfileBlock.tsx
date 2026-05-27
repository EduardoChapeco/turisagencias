import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroAgencyProfileBlock: BlockDef = {
 type: 'hero-agency-profile',
 label: 'Hero Perfil Agência',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 agencyName: 'Mundo Afora Viagens',
 description: 'Especialistas em roteiros personalizados para casais e famílias.',
 whatsappText: 'Falar no WhatsApp',
 coverImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600&auto=format&fit=crop',
 logoImage: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop'
 },
 
 defaultStyles: {
 paddingTop: 'py-0',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { agencyName, description, whatsappText, coverImage, logoImage } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} relative`}>
 <div 
 className="w-full h-[250px] md:h-[350px] bg-cover bg-center"
 style={{ backgroundImage: `url(${coverImage})` }}
 />
 
 <div className="max-w-4xl mx-auto px-6 relative -mt-16 md:-mt-24">
 <div className="flex flex-col items-center md:items-start text-center md:text-left">
 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-white mb-4">
 <img src={logoImage} alt={agencyName} className="w-full h-full object-cover" />
 </div>
 
 <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
 <div>
 <EditableText
 nodeId={node.id}
 propKey="agencyName"
 value={agencyName}
 as="h1"
 className="text-3xl md:text-4xl font-black tracking-tight mb-2"
 />
 <EditableText
 nodeId={node.id}
 propKey="description"
 value={description}
 as="p"
 className="text-zinc-600 max-w-lg"
 />
 </div>
 
 <button className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors w-full md:w-auto">
 <MessageCircle className="w-5 h-5" />
 <span>{whatsappText}</span>
 </button>
 </div>
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Nome da Agência</Label>
 <Input 
 value={node.props.agencyName || ''} 
 onChange={e => onChange({ props: { ...node.props, agencyName: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Descrição</Label>
 <Textarea 
 value={node.props.description || ''} 
 onChange={e => onChange({ props: { ...node.props, description: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm min-h-[60px]"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto WhatsApp</Label>
 <Input 
 value={node.props.whatsappText || ''} 
 onChange={e => onChange({ props: { ...node.props, whatsappText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Imagem de Capa (URL)</Label>
 <Input 
 value={node.props.coverImage || ''} 
 onChange={e => onChange({ props: { ...node.props, coverImage: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Logo (URL)</Label>
 <Input 
 value={node.props.logoImage || ''} 
 onChange={e => onChange({ props: { ...node.props, logoImage: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
