import React from 'react';
import { Columns } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const LayoutGrid2ColBlock = {
 type: 'layout_grid_2_col',
 category: 'layout',
 label: '2 Column Grid',
 icon: Columns,
 acceptsChildren: true,
 defaultProps: {
 gap: '16px'
 },
 defaultStyles: {
 padding: '16px 0',
 backgroundColor: 'transparent'
 },
 renderComponent: ({ node, children }) => {
 return (
 <div 
 style={{
 ...node.styles,
 display: 'grid',
 gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
 gap: node.props?.gap || '16px'
 }}
 className="w-full relative"
 >
 {children || (
 <div className="col-span-2 p-8 border-2 border-dashed border-gray-300 text-center text-gray-400 bg-gray-50 rounded">
 Arraste componentes para dentro deste grid (2 Colunas)
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="p-4 space-y-4">
 <div className="space-y-2">
 <Label>Espaçamento (Gap)</Label>
 <Input 
 value={node.props?.gap || '16px'}
 onChange={(e) => onChange({ props: { ...node.props, gap: e.target.value } })}
 placeholder="Ex: 16px ou 1rem"
 />
 </div>
 </div>
 );
 }
};
