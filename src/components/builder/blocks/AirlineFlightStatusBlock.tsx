import React from 'react';
import { BlockDef } from '../core/types';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const AirlineFlightStatusBlock: BlockDef = {
 type: 'airline-flight-status',
 label: 'Flight Status Banner',
 category: 'airline',
 icon: Info,
 
 defaultProps: {
 statusText: 'No horário',
 flightNumber: 'AD 1234',
 statusType: 'ontime',
 },
 
 defaultStyles: {
 paddingTop: 'py-2',
 paddingBottom: 'pb-2',
 },

 renderComponent: ({ node }) => {
 const { statusText, flightNumber, statusType } = node.props;
 const { paddingTop, paddingBottom } = node.styles;
 
 let bgClass = 'bg-green-100 text-green-800';
 if (statusType === 'delayed') bgClass = 'bg-yellow-100 text-yellow-800';
 if (statusType === 'cancelled') bgClass = 'bg-red-100 text-red-800';

 return (
 <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
 <div className={`w-full max-w-md px-4 py-3 rounded-lg flex items-center justify-between ${bgClass}`}>
 <span className="font-bold text-sm">{flightNumber}</span>
 <EditableText
 nodeId={node.id}
 propKey="statusText"
 value={statusText}
 as="span"
 className="font-medium text-sm uppercase tracking-wide"
 />
 </div>
 </div>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Voo</Label>
 <Input 
 value={node.props.flightNumber || ''} 
 onChange={e => onChange({ props: { ...node.props, flightNumber: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Status</Label>
 <Input 
 value={node.props.statusText || ''} 
 onChange={e => onChange({ props: { ...node.props, statusText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Tipo de Status</Label>
 <select 
 value={node.props.statusType || 'ontime'}
 onChange={e => onChange({ props: { ...node.props, statusType: e.target.value } })}
 className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
 >
 <option value="ontime">No horário (Verde)</option>
 <option value="delayed">Atrasado (Amarelo)</option>
 <option value="cancelled">Cancelado (Vermelho)</option>
 </select>
 </div>
 </div>
 );
 }
};
