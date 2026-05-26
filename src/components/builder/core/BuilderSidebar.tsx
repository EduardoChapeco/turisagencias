import React from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { Button } from '@/components/ui/button';
import { Layers, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuilderNode } from './types';

export function BuilderSidebar() {
  const { activeTab, setActiveTab, selectedNodeId, nodes, addNode, updateNode } = useBuilderStore();

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

  const renderSettingsTab = () => {
    if (!selectedNodeId) {
      return (
        <div className="text-center py-10 text-zinc-500 text-xs italic">
          Selecione um bloco no canvas para editá-lo.
        </div>
      );
    }

    const findNode = (nodesList: BuilderNode[]): BuilderNode | null => {
      for (const n of nodesList) {
        if (n.id === selectedNodeId) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(nodes);
    if (!node) return null;

    const blockDef = BlockRegistry.get(node.type);
    if (!blockDef) return null;

    const SettingsComponent = blockDef.settingsComponent;

    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            {blockDef.icon && <blockDef.icon className="w-4 h-4 text-vj-green" />}
            {blockDef.label}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">ID: {node.id}</p>
        </div>

        <div className="space-y-6">
          <SettingsComponent 
            node={node} 
            onChange={(updates) => updateNode(node.id, updates)} 
          />
        </div>

        {/* Global Styles Panel */}
        <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase">Estilos Universais</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-zinc-500 font-bold">Cor de Fundo</label>
            <select 
              value={node.styles?.backgroundColor || 'bg-white'}
              onChange={e => updateNode(node.id, { styles: { ...node.styles, backgroundColor: e.target.value } })}
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
            >
              <option value="bg-white">Branco (Padrão)</option>
              <option value="bg-zinc-50">Cinza Claro</option>
              <option value="bg-zinc-100">Cinza</option>
              <option value="bg-zinc-900">Escuro (Dark Mode)</option>
              <option value="bg-zinc-950">Ultra Escuro (OLED)</option>
              <option value="bg-vj-green">Verde Turis (Destaque)</option>
              <option value="bg-blue-600">Azul Brand</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase text-zinc-500 font-bold">Cor do Texto</label>
            <select 
              value={node.styles?.textColor || 'text-zinc-900'}
              onChange={e => updateNode(node.id, { styles: { ...node.styles, textColor: e.target.value } })}
              className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
            >
              <option value="text-zinc-900">Preto (Para fundos claros)</option>
              <option value="text-white">Branco (Para fundos escuros)</option>
              <option value="text-zinc-950">Preto Profundo</option>
              <option value="text-vj-green">Verde Turis</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500 font-bold">Espaçamento Topo</label>
              <select 
                value={node.styles?.paddingTop || 'py-16'}
                onChange={e => updateNode(node.id, { styles: { ...node.styles, paddingTop: e.target.value } })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
              >
                <option value="pt-0">Nenhum</option>
                <option value="pt-8">Pequeno</option>
                <option value="pt-16">Médio</option>
                <option value="py-24">Grande</option>
                <option value="pt-32">Gigante</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500 font-bold">Espaçamento Fundo</label>
              <select 
                value={node.styles?.paddingBottom || 'pb-16'}
                onChange={e => updateNode(node.id, { styles: { ...node.styles, paddingBottom: e.target.value } })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2"
              >
                <option value="pb-0">Nenhum</option>
                <option value="pb-8">Pequeno</option>
                <option value="pb-16">Médio</option>
                <option value="pb-24">Grande</option>
                <option value="pb-32">Gigante</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 bg-[#0A0A0A] border-r border-zinc-800 flex flex-col h-full overflow-hidden shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-zinc-800 p-2 gap-1 bg-black/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab('blocks')}
          className={cn(
            "flex-1 text-xs font-bold gap-2",
            activeTab === 'blocks' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab('edit')}
          className={cn(
            "flex-1 text-xs font-bold gap-2",
            activeTab === 'edit' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Settings className="w-4 h-4" /> Editar
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'blocks' && renderBlocksTab()}
        {activeTab === 'edit' && renderSettingsTab()}
      </div>
    </aside>
  );
}
