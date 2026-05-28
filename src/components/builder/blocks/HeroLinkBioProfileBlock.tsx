import React from 'react';
import { MediaPicker } from '../MediaPicker';
import { BlockDef } from '../core/types';
import { LayoutTemplate, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const HeroLinkBioProfileBlock: BlockDef = {
 type: 'hero-link-bio-profile',
 label: 'Hero Link na Bio',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 name: 'TurisAgências',
 role: 'Sua Agência Digital',
 location: 'São Paulo, Brasil',
 profileImage: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=200&auto=format&fit=crop'
 },
 
 defaultStyles: {
 paddingTop: 'py-12',
 paddingBottom: 'pb-8',
 backgroundColor: 'bg-zinc-950',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { name, role, location, profileImage } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} flex flex-col items-center justify-center text-center px-6 relative overflow-hidden`}>
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600 blur-[100px]" />
 <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 blur-[100px]" />
 </div>

 <div className="relative z-10 flex flex-col items-center w-full max-w-sm mx-auto">
 <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-4 ">
 <div className="w-full h-full rounded-full overflow-hidden">
 <img src={profileImage} alt={name} className="w-full h-full object-cover" />
 </div>
 </div>
 
 <EditableText
 nodeId={node.id}
 propKey="name"
 value={name}
 as="h1"
 className="text-2xl font-black tracking-tight mb-1"
 />
 <EditableText
 nodeId={node.id}
 propKey="role"
 value={role}
 as="p"
 className="text-sm font-medium text-zinc-400 mb-2"
 />
 <div className="flex items-center text-xs text-zinc-500 font-medium bg-white/5 px-3 py-1 rounded-full">
 <MapPin className="w-3 h-3 mr-1" />
 <EditableText nodeId={node.id} propKey="location" value={location} as="span" />
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Nome</Label>
 <Input 
 value={node.props.name || ''} 
 onChange={e => onChange({ props: { ...node.props, name: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Papel/Slogan</Label>
 <Input 
 value={node.props.role || ''} 
 onChange={e => onChange({ props: { ...node.props, role: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Localização</Label>
 <Input 
 value={node.props.location || ''} 
 onChange={e => onChange({ props: { ...node.props, location: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <MediaPicker label="Imagem de Perfil (URL)" value={node.props.profileImage || ''} onChange={url => onChange({ props: { ...node.props, profileImage: url } })} />
 </div>
 </div>
 );
 }
};
