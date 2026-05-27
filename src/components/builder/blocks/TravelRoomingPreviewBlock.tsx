import React from 'react';
import { BlockDef } from '../core/types';
import { BedDouble, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';

export const TravelRoomingPreviewBlock: BlockDef = {
 type: 'travel-rooming-preview',
 label: 'Rooming Preview',
 category: 'travel',
 icon: BedDouble,
 
 defaultProps: {
 title: 'Room Distribution',
 rooms: [
 { id: '1', type: 'Double Standard', passengers: 'John Doe, Jane Doe' },
 { id: '2', type: 'Single Premium', passengers: 'Alice Smith' },
 { id: '3', type: 'Triple Family', passengers: 'Bob Johnson, Mary Johnson, Timmy Johnson' }
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-12',
 paddingBottom: 'pb-12',
 backgroundColor: 'bg-white',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, rooms } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-4xl mx-auto">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-2xl font-black mb-6"
 />
 <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden ">
 <table className="w-full text-left text-sm">
 <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-xs font-bold">
 <tr>
 <th className="px-6 py-4">Room</th>
 <th className="px-6 py-4">Type</th>
 <th className="px-6 py-4">Passengers</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-100">
 {rooms?.map((room: any, idx: number) => (
 <tr key={room.id} className="hover:bg-zinc-50/50 transition-colors">
 <td className="px-6 py-4 font-medium">Room {idx + 1}</td>
 <td className="px-6 py-4 flex items-center gap-2">
 <BedDouble className="w-4 h-4 text-zinc-400" />
 {room.type}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-zinc-400" />
 {room.passengers}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-6">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 
 <ArrayField
 title="Quartos (Rooming)"
 items={node.props.rooms || []}
 onChange={(rooms) => onChange({ props: { ...node.props, rooms } })}
 defaultItem={{ type: 'Duplo Standard', passengers: 'Nome dos Passageiros' }}
 schema={[
 { key: 'type', label: 'Tipo de Quarto (Ex: Casal, Duplo, Triplo)', type: 'text' },
 { key: 'passengers', label: 'Passageiros Alocados', type: 'text' }
 ]}
 />
 </div>
 );
 }
};
