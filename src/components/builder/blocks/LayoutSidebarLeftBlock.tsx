import React from 'react';
import { LayoutPanelLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const LayoutSidebarLeftBlock = {
 type: 'layout_sidebar_left',
 category: 'layout',
 label: 'Sidebar Left Layout',
 icon: LayoutPanelLeft,
 acceptsChildren: true,
 defaultProps: {
 sidebarWidth: '300px',
 gap: '24px'
 },
 defaultStyles: {
 padding: '24px 0',
 backgroundColor: 'transparent'
 },
 renderComponent: ({ node, children }) => {
 return (
 <div 
 style={{
 ...node.styles,
 display: 'grid',
 gridTemplateColumns: `${node.props?.sidebarWidth || '300px'} 1fr`,
 gap: node.props?.gap || '24px'
 }}
 className="w-full relative"
 >
 {children || (
 <div className="col-span-2 p-8 border-2 border-dashed border-gray-300 text-center text-gray-400 bg-gray-50 rounded flex flex-col gap-2">
 <LayoutPanelLeft className="mx-auto opacity-50" size={32} />
 <span>Arraste componentes para dentro deste layout (Sidebar + Conteúdo Principal)</span>
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="p-4 space-y-4">
 <div className="space-y-2">
 <Label>Largura da Sidebar</Label>
 <Input 
 value={node.props?.sidebarWidth || '300px'}
 onChange={(e) => onChange({ props: { ...node.props, sidebarWidth: e.target.value } })}
 placeholder="Ex: 300px ou 25%"
 />
 </div>
 <div className="space-y-2">
 <Label>Espaçamento (Gap)</Label>
 <Input 
 value={node.props?.gap || '24px'}
 onChange={(e) => onChange({ props: { ...node.props, gap: e.target.value } })}
 placeholder="Ex: 24px"
 />
 </div>
 </div>
 );
 }
};
