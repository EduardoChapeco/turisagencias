import React from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { BuilderNode } from './types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { TemplateModal } from './TemplateModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableBlock = React.memo(function SortableBlock({ node }: { node: BuilderNode }) {
  const isSelected = useBuilderStore(state => state.selectedNodeId === node.id);
  const setSelectedNodeId = useBuilderStore(state => state.setSelectedNodeId);
  const removeNode = useBuilderStore(state => state.removeNode);
  
  const blockDef = BlockRegistry.get(node.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!blockDef) return null;

  const RenderComponent = blockDef.renderComponent;

  return (
      <div
        ref={setNodeRef}
        style={style}
        tabIndex={0}
        role="region"
        aria-label={`Bloco de ${blockDef.label}`}
        className={cn(
          "relative group transition-all ring-inset cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-vj-green/50",
          isSelected ? "ring-2 ring-vj-green z-10" : "hover:ring-1 hover:ring-zinc-400"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setSelectedNodeId(node.id);
          }
        }}
      >
        {/* Block Controls (Absolute positioned, visible on hover/select) */}
        <div className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 bg-vj-green text-zinc-950 px-3 py-1 text-[10px] font-bold rounded-full opacity-0 transition-opacity z-20 flex items-center gap-2 shadow-lg",
          (isSelected || "group-hover:opacity-100") && "opacity-100",
          "focus-within:opacity-100"
        )}>
          <button 
            {...attributes} 
            {...listeners} 
            className="cursor-grab hover:text-white px-1 outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            aria-label={`Arrastar bloco de ${blockDef.label}`}
          >
            :: Drag
          </button>
          <span className="capitalize">{blockDef.label}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
          className="hover:text-red-900 ml-1"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div className="pointer-events-none relative z-0">
        <RenderComponent node={node}>
          {node.children && node.children.length > 0 && (
            <div className="w-full h-full min-h-[50px]">
               {node.children.map(childNode => (
                 <SortableBlock key={childNode.id} node={childNode} />
               ))}
            </div>
          )}
        </RenderComponent>
      </div>
    </div>
  );
});

export function BuilderCanvas() {
  const { nodes, setNodes, viewport, setSelectedNodeId } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = nodes.findIndex(n => n.id === active.id);
      const newIndex = nodes.findIndex(n => n.id === over.id);
      setNodes(arrayMove(nodes, oldIndex, newIndex));
    }
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
  };

  return (
    <div 
      className="flex-1 overflow-y-auto bg-zinc-900/50 relative flex justify-center custom-scrollbar"
      onClick={handleCanvasClick}
    >
      {/* Canvas Area */}
      <div className={cn(
        "bg-white min-h-full transition-all duration-500 origin-top shadow-2xl relative",
        viewport === 'desktop' && "w-full",
        viewport === 'tablet' && "w-[768px] my-8 rounded-2xl overflow-hidden",
        viewport === 'mobile' && "w-[375px] my-8 rounded-[2rem] overflow-hidden border-8 border-zinc-800"
      )}>
        
        {nodes.length === 0 ? (
          <TemplateModal />
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={nodes.map(n => n.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col min-h-screen">
                {nodes.map(node => (
                  <SortableBlock key={node.id} node={node} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
