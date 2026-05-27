import React from 'react';
import { BlockDef } from '../core/types';
import { Grid } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';

export const TravelPackageGridBlock: BlockDef = {
 type: 'travel-package-grid',
 label: 'Package Grid',
 category: 'travel',
 icon: Grid,
 
 defaultProps: {
 sectionTitle: 'Recommended Packages',
 packages: [
 { id: '1', title: 'Maldives Paradise', price: '$2,999', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' },
 { id: '2', title: 'Swiss Alps Adventure', price: '$1,899', image: 'https://images.unsplash.com/photo-1531366936336-d63c5a6baeb0?w=800&q=80' },
 { id: '3', title: 'Tokyo Explorer', price: '$2,499', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80' }
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => {
 const { sectionTitle, packages } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-6xl mx-auto">
 <EditableText
 nodeId={node.id}
 propKey="sectionTitle"
 value={sectionTitle}
 as="h2"
 className="text-3xl font-black tracking-tight mb-8"
 />
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {packages?.map((pkg: any) => (
 <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-200 group">
 <div className="h-48 overflow-hidden">
 <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 </div>
 <div className="p-5">
 <h3 className="font-bold text-lg mb-2">{pkg.title}</h3>
 <div className="text-vj-green font-black">{pkg.price}</div>
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
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título da Seção</Label>
 <Input 
 value={node.props.sectionTitle || ''} 
 onChange={e => onChange({ props: { ...node.props, sectionTitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 
 <ArrayField
 title="Pacotes de Viagem"
 items={node.props.packages || []}
 onChange={(packages) => onChange({ props: { ...node.props, packages } })}
 defaultItem={{ title: 'Novo Pacote', price: '$999', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80' }}
 schema={[
 { key: 'title', label: 'Nome do Destino / Pacote', type: 'text' },
 { key: 'price', label: 'Preço Formatado (ex: $1,200 ou Sob Consulta)', type: 'text' },
 { key: 'image', label: 'URL da Imagem de Capa', type: 'url' }
 ]}
 />
 </div>
 );
 }
};
