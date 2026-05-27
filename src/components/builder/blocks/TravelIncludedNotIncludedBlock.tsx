import React from 'react';
import { BlockDef } from '../core/types';
import { CheckCircle2, XCircle, ListChecks } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';

export const TravelIncludedNotIncludedBlock: BlockDef = {
 type: 'travel-included',
 label: 'Included / Not Included',
 category: 'travel',
 icon: ListChecks,
 
 defaultProps: {
 title: 'What\'s included',
 included: [
 { text: 'Passagens aéreas ida e volta' },
 { text: '4 noites em hotel 5 estrelas' },
 { text: 'Café da manhã diário' },
 { text: 'Transfer aeroporto/hotel' }
 ],
 notIncluded: [
 { text: 'Seguro viagem' },
 { text: 'Despesas pessoais' },
 { text: 'Passeios opcionais' },
 { text: 'Taxas de visto' }
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { title, included, notIncluded } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-5xl mx-auto">
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-3xl font-black text-center mb-10"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-white p-8 rounded-2xl border border-emerald-100">
 <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800">
 <CheckCircle2 className="text-emerald-500 w-6 h-6" />
 Included
 </h3>
 <ul className="space-y-4">
 {included?.map((item: any, i: number) => (
 <li key={i} className="flex items-start gap-3">
 <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
 <span className="text-zinc-700">{item.text || item}</span>
 </li>
 ))}
 </ul>
 </div>
 <div className="bg-white p-8 rounded-2xl border border-red-100">
 <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-800">
 <XCircle className="text-red-500 w-6 h-6" />
 Not Included
 </h3>
 <ul className="space-y-4">
 {notIncluded?.map((item: any, i: number) => (
 <li key={i} className="flex items-start gap-3">
 <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
 <span className="text-zinc-700">{item.text || item}</span>
 </li>
 ))}
 </ul>
 </div>
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
 title="Itens Inclusos"
 items={node.props.included || []}
 onChange={(included) => onChange({ props: { ...node.props, included } })}
 defaultItem={{ text: 'Novo Item' }}
 schema={[{ key: 'text', label: 'Item Incluso', type: 'text' }]}
 />

 <ArrayField
 title="Itens Não Inclusos"
 items={node.props.notIncluded || []}
 onChange={(notIncluded) => onChange({ props: { ...node.props, notIncluded } })}
 defaultItem={{ text: 'Novo Item' }}
 schema={[{ key: 'text', label: 'Item Não Incluso', type: 'text' }]}
 />
 </div>
 );
 }
};
