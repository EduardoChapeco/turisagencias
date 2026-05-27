import React from 'react';
import { BlockDef } from '../core/types';
import { Building2, Star, MapPin, Wifi, Coffee, Dumbbell, Waves } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelHotelSummaryBlock: BlockDef = {
 type: 'travel-hotel-summary',
 label: 'Hotel Summary',
 category: 'travel',
 icon: Building2,
 
 defaultProps: {
 title: 'Your Accommodation',
 hotelName: 'Grand Resort & Spa',
 location: 'Maldives',
 stars: 5,
 description: 'Experience luxury at its finest with our overwater villas featuring direct ocean access, private pools, and world-class dining.',
 image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'
 },
 
 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-white',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, hotelName, location, stars, description, image } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-5xl mx-auto">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-2xl font-black mb-8"
 />
 <div className="bg-white rounded-3xl overflow-hidden border border-zinc-100 flex flex-col md:flex-row">
 <div className="md:w-2/5 h-64 md:h-auto relative">
 <img src={image} alt={hotelName} className="w-full h-full object-cover" />
 </div>
 <div className="p-8 md:w-3/5 flex flex-col justify-center">
 <div className="flex text-yellow-400 mb-2">
 {[...Array(stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
 </div>
 <EditableText
 nodeId={node.id}
 propKey="hotelName"
 value={hotelName}
 as="h3"
 className="text-3xl font-bold mb-2"
 />
 <div className="flex items-center text-zinc-500 mb-6">
 <MapPin className="w-4 h-4 mr-1" />
 <EditableText
 nodeId={node.id}
 propKey="location"
 value={location}
 as="span"
 />
 </div>
 <EditableText
 nodeId={node.id}
 propKey="description"
 value={description}
 as="p"
 className="text-zinc-600 mb-8 leading-relaxed"
 />
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-100">
 <div className="flex items-center gap-2 text-zinc-600 font-medium">
 <Wifi className="w-5 h-5" /> Free WiFi
 </div>
 <div className="flex items-center gap-2 text-zinc-600 font-medium">
 <Coffee className="w-5 h-5" /> Breakfast
 </div>
 <div className="flex items-center gap-2 text-zinc-600 font-medium">
 <Waves className="w-5 h-5" /> Pool
 </div>
 <div className="flex items-center gap-2 text-zinc-600 font-medium">
 <Dumbbell className="w-5 h-5" /> Gym
 </div>
 </div>
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
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título da Seção</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Nome do Hotel</Label>
 <Input 
 value={node.props.hotelName || ''} 
 onChange={e => onChange({ props: { ...node.props, hotelName: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
