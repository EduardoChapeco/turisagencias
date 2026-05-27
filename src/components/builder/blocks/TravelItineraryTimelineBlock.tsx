import React from 'react';
import { BlockDef } from '../core/types';
import { Route } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';

export const TravelItineraryTimelineBlock: BlockDef = {
 type: 'travel-itinerary-timeline',
 label: 'Itinerary Timeline',
 category: 'travel',
 icon: Route,
 
 defaultProps: {
 title: 'Trip Itinerary',
 days: [
 { day: 'Day 1', title: 'Arrival & Welcome', description: 'Arrive at the airport, transfer to hotel, and enjoy a welcome dinner.' },
 { day: 'Day 2', title: 'City Tour', description: 'Visit the main landmarks and historical sites.' },
 { day: 'Day 3', title: 'Free Day', description: 'Explore the city at your own pace or join an optional excursion.' }
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-white',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, days } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-3xl mx-auto">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-3xl font-black mb-8"
 />
 <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
 {days?.map((day: any, index: number) => (
 <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
 <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-vj-green text-slate-500 group-[.is-active]:text-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold text-sm">
 {index + 1}
 </div>
 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white">
 <div className="flex items-center justify-between mb-1">
 <div className="font-bold text-vj-green text-sm">{day.day}</div>
 </div>
 <h3 className="font-bold text-lg mb-1">{day.title}</h3>
 <p className="text-slate-600 text-sm leading-relaxed">{day.description}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-6">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título do Itinerário</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 
 <ArrayField
 title="Dias do Roteiro"
 items={node.props.days || []}
 onChange={(days) => onChange({ props: { ...node.props, days } })}
 defaultItem={{ day: 'Novo Dia', title: 'Título do Dia', description: 'Atividades e horários.' }}
 schema={[
 { key: 'day', label: 'Rótulo (ex: Dia 1, 14h00)', type: 'text' },
 { key: 'title', label: 'Título', type: 'text' },
 { key: 'description', label: 'Descrição da Atividade', type: 'textarea' }
 ]}
 />
 </div>
 );
 }
};
