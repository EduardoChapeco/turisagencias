import React from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuilderNode } from './types';

export function BuilderSidebar() {
 const activeTab = useBuilderStore(state => state.activeTab);
 const setActiveTab = useBuilderStore(state => state.setActiveTab);
 const selectedNodeId = useBuilderStore(state => state.selectedNodeId);
 const nodes = useBuilderStore(state => state.nodes);
 const addNode = useBuilderStore(state => state.addNode);
 const updateNode = useBuilderStore(state => state.updateNode);

 const handleDragStart = (e: React.DragEvent, type: string) => {
 e.dataTransfer.setData('blockType', type);
 e.dataTransfer.effectAllowed = 'copy';
 };

 const renderBlocksTab = () => {
 const blocks = BlockRegistry.getAll();
 const categories = Array.from(new Set(blocks.map(b => b.category)));

 return (
 <div className="space-y-2">
 {categories.map(cat => (
 <details key={cat} className="group bg-[#151515] border border-white/5 rounded-lg overflow-hidden" open={cat === 'travel' || cat === 'hero'}>
 <summary className="flex items-center justify-between p-3 cursor-pointer select-none bg-white/5 group-hover:bg-white/10 transition-colors">
 <span className="text-xs font-bold text-zinc-300 uppercase">{cat}</span>
 <span className="text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
 </summary>
 <div className="grid grid-cols-2 gap-2 p-3 bg-[#0A0A0A]">
 {blocks.filter(b => b.category === cat).map(block => (
 <div
 key={block.type}
 draggable
 onDragStart={(e) => handleDragStart(e, block.type)}
 className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-grab hover:border-vj-green hover:bg-zinc-800 transition-colors text-center h-20"
 onClick={() => {
 const newNode: BuilderNode = {
 id: `${block.type}-${Date.now()}`,
 type: block.type,
 props: { ...block.defaultProps },
 styles: { ...block.defaultStyles },
 children: block.acceptsChildren ? [] : undefined
 };
 addNode(newNode);
 }}
 >
 {block.icon && <block.icon className="w-5 h-5 text-zinc-400 shrink-0" />}
 <span className="text-[9px] font-bold text-zinc-300 leading-tight">{block.label}</span>
 </div>
 ))}
 </div>
 </details>
 ))}
 </div>
 );
 };



 return (
 <aside className="w-64 md:w-72 bg-[#0A0A0A] border-r border-zinc-800 flex flex-col h-full overflow-hidden shrink-0 z-10">
 {/* Tabs */}
 <div className="flex border-b border-zinc-800 p-2 gap-1 bg-black/20">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs font-bold gap-2 bg-zinc-800 text-white"
        >
          <Plus className="w-4 h-4" /> Blocos
        </Button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      {renderBlocksTab()}
 </div>
 </aside>
 );
}
