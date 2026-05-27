import React from 'react';
import { BlockDef } from '../core/types';
import { Clock, Flame } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelLastSpotsBlock: BlockDef = {
 type: 'travel-last-spots',
 label: 'Last Spots Alert',
 category: 'travel',
 icon: Clock,
 
 defaultProps: {
 message: 'Hurry up! Only 2 spots left at this price.',
 },
 
 defaultStyles: {
 paddingTop: 'py-6',
 paddingBottom: 'pb-6',
 backgroundColor: 'bg-red-500',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { message } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
 <Flame className="w-6 h-6 animate-pulse" />
 <EditableText
 nodeId={node.id}
 propKey="message"
 value={message}
 as="p"
 className="text-lg md:text-xl font-bold text-center m-0"
 />
 <Flame className="w-6 h-6 animate-pulse" />
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Mensagem</Label>
 <Input 
 value={node.props.message || ''} 
 onChange={e => onChange({ props: { ...node.props, message: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
