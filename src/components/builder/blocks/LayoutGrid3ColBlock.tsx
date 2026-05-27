import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const LayoutGrid3ColBlock = {
 type: 'layout_grid_3_col',
 category: 'layout',
 label: '3 Column Grid',
 icon: LayoutGrid,
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
 gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
 gap: node.props?.gap || '16px'
 }}
 className="w-full relative"
 >
 {children || (
 <div className="col-span-3 p-8 border-2 border-dashed border-gray-300 text-center text-gray-400 bg-gray-50 rounded">
 Arraste componentes para dentro deste grid (3 Colunas)
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
