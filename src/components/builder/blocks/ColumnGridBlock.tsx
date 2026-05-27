import React from 'react';
import { Columns } from 'lucide-react';
import { BlockDef } from '../core/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ColumnGridBlock: BlockDef = {
 type: 'column-grid',
 label: 'Columns',
 category: 'layout',
 icon: Columns,
 defaultProps: {
 columns: 2,
 gap: '16px',
 },
 defaultStyles: {
 padding: '16px 0',
 width: '100%',
 },
 renderComponent: ({ node }) => {
 const { columns, gap } = node.props;
 
 const colsArray = Array.from({ length: columns });

 return (
 <div 
 style={{
 ...node.styles,
 display: 'grid',
 gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
 gap: gap || '16px',
 }}
 >
 {colsArray.map((_, i) => (
 <div 
 key={i} 
 className="min-h-[100px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-400 text-sm"
 >
 Drop blocks here (Col {i + 1})
 </div>
 ))}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 const handlePropChange = (key: string, value: any) => {
 onChange({ props: { ...node.props, [key]: value } });
 };
 const handleStyleChange = (key: string, value: any) => {
 onChange({ styles: { ...node.styles, [key]: value } });
 };

 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label>Number of Columns</Label>
 <select 
 className="w-full p-2 border rounded-md text-sm"
 value={node.props.columns}
 onChange={(e) => handlePropChange('columns', parseInt(e.target.value, 10))}
 >
 <option value={2}>2 Columns</option>
 <option value={3}>3 Columns</option>
 <option value={4}>4 Columns</option>
 </select>
 </div>
 <div className="space-y-2">
 <Label>Gap</Label>
 <Input 
 type="text"
 value={node.props.gap}
 onChange={(e) => handlePropChange('gap', e.target.value)}
 placeholder="e.g. 16px"
 />
 </div>
 <div className="space-y-2">
 <Label>Padding</Label>
 <Input 
 type="text"
 value={node.styles.padding}
 onChange={(e) => handleStyleChange('padding', e.target.value)}
 placeholder="e.g. 16px 0"
 />
 </div>
 </div>
 );
 }
};
