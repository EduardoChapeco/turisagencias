import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { X, SlidersHorizontal, Settings2, Code, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BuilderRightPanel() {
  const { selectedNodeId, nodes, setNodes } = useBuilderStore();

  const selectedNode = selectedNodeId ? findNode(nodes, selectedNodeId) : null;
  const blockDef = selectedNode ? BlockRegistry.get(selectedNode.type) : null;

  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="w-80 h-full bg-[#1A1A1A] border-l border-white/10 shrink-0 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
        <LayoutTemplate className="w-10 h-10 mb-3 opacity-20" />
        <h3 className="text-sm font-medium text-zinc-400 mb-1">Nenhum bloco selecionado</h3>
        <p className="text-xs">Selecione um bloco no canvas para editar suas propriedades e estilo.</p>
      </div>
    );
  }

  // Se o bloco foi recém adaptado ao v7, ele pode expor o SettingsComponent
  const Inspector = blockDef?.settingsComponent;

  const updateNodeData = (id: string, newProps: any) => {
    // recursively update node
    const updateRecursively = (nodesArray: any[]): any[] => {
      return nodesArray.map(node => {
        if (node.id === id) {
          return { ...node, props: { ...node.props, ...newProps } };
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) };
        }
        return node;
      });
    };
    setNodes(updateRecursively(nodes));
  };

  return (
    <div className="w-80 h-full bg-[#1A1A1A] border-l border-white/10 shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#111]">
        <div className="flex items-center gap-2">
          {blockDef?.icon && <blockDef.icon className="w-4 h-4 text-zinc-400" />}
          <span className="text-sm font-semibold text-white">{blockDef?.label || selectedNode.type}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10" onClick={() => useBuilderStore.getState().setSelectedNodeId(null)}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tabs (Content / Style / Advanced) */}
      <div className="flex items-center p-2 border-b border-white/10 gap-1 bg-[#151515]">
        <button className="flex-1 py-1.5 rounded bg-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          Conteúdo
        </button>
        <button className="flex-1 py-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-medium flex items-center justify-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Estilo
        </button>
        <button className="flex-1 py-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-medium flex items-center justify-center gap-1.5">
          <Code className="w-3.5 h-3.5" />
          Avançado
        </button>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {Inspector ? (
          <Inspector data={selectedNode.props} onChange={(newProps: any) => updateNodeData(selectedNode.id, newProps)} />
        ) : (
          <div className="text-sm text-zinc-500 border border-white/10 border-dashed rounded p-4 text-center">
            Este bloco não possui inspetor configurado.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper para encontrar nó
function findNode(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
