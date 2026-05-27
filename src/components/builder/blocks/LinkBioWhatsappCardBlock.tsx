import React from 'react';
import { BlockDef } from '../core/types';
import { MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const LinkBioWhatsappCardBlock: BlockDef = {
 type: 'linkbio-whatsapp-card',
 label: 'WhatsApp Contact Card',
 category: 'linkbio',
 icon: MessageCircle,
 
 defaultProps: {
 title: 'Fale Conosco',
 description: 'Atendimento via WhatsApp',
 phoneNumber: '+5511999999999',
 },
 
 defaultStyles: {
 paddingTop: 'py-4',
 paddingBottom: 'pb-4',
 },

 renderComponent: ({ node }) => {
 const { title, description, phoneNumber } = node.props;
 const { paddingTop, paddingBottom } = node.styles;
 
 const waUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;

 return (
 <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
 <a href={waUrl} className="block w-full max-w-md">
 <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4 hover:bg-green-100 transition-colors ">
 <div className="w-12 h-12 bg-green-500 rounded-full flex flex-shrink-0 items-center justify-center text-white">
 <MessageCircle className="w-6 h-6" />
 </div>
 <div className="flex flex-col">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="span"
 className="font-bold text-green-950 text-base"
 />
 <EditableText
 nodeId={node.id}
 propKey="description"
 value={description}
 as="span"
 className="text-green-800 text-sm"
 />
 </div>
 </div>
 </a>
 </div>
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
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Descrição</Label>
 <Input 
 value={node.props.description || ''} 
 onChange={e => onChange({ props: { ...node.props, description: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Número de WhatsApp (com DDI/DDD)</Label>
 <Input 
 value={node.props.phoneNumber || ''} 
 onChange={e => onChange({ props: { ...node.props, phoneNumber: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 placeholder="+55 11 99999-9999"
 />
 </div>
 </div>
 );
 }
};
