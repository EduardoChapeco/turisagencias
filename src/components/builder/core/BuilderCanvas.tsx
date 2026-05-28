import React from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { BuilderNode } from './types';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
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

// ---------------------------------------------------------------------------
// Viewport label
// ---------------------------------------------------------------------------
const VIEWPORT_LABELS: Record<string, string> = {
  desktop: 'Desktop (1280px)',
  tablet: 'Tablet (768px)',
  mobile: 'Mobile (375px)',
};

// ---------------------------------------------------------------------------
// Compute block wrapper styles from node.styles
// ---------------------------------------------------------------------------
function buildBlockStyle(styles: Record<string, any> = {}): React.CSSProperties {
  const css: React.CSSProperties = {};

  if (styles.backgroundColor) css.backgroundColor = styles.backgroundColor;
  if (styles.paddingTop) css.paddingTop = styles.paddingTop;
  if (styles.paddingBottom) css.paddingBottom = styles.paddingBottom;
  if (styles.paddingHorizontal) {
    css.paddingLeft = styles.paddingHorizontal;
    css.paddingRight = styles.paddingHorizontal;
  }
  if (styles.borderRadius) css.borderRadius = styles.borderRadius;
  if (styles.borderWidth && styles.borderWidth !== '0') {
    css.borderWidth = styles.borderWidth;
    css.borderStyle = 'solid';
    if (styles.borderColor) css.borderColor = styles.borderColor;
  }

  // Background image + overlay
  if (styles.backgroundImage) {
    const overlay =
      styles.overlay === 'dark-30' ? 'rgba(0,0,0,0.3)' :
      styles.overlay === 'dark-50' ? 'rgba(0,0,0,0.5)' :
      styles.overlay === 'gradient' ? 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)' :
      null;
    css.backgroundImage = overlay
      ? `${overlay}, url(${styles.backgroundImage})`
      : `url(${styles.backgroundImage})`;
    css.backgroundSize = 'cover';
    css.backgroundPosition = 'center';
  }

  return css;
}

// ---------------------------------------------------------------------------
// SortableBlock
// ---------------------------------------------------------------------------
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

  const dndStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!blockDef) return null;

  const RenderComponent = blockDef.renderComponent;
  const blockStyle = buildBlockStyle(node.styles);

  // AOS attributes from node.props
  const aosAnimation = node.props?.aosAnimation && node.props.aosAnimation !== 'none'
    ? node.props.aosAnimation
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      tabIndex={0}
      role="region"
      aria-label={`Bloco de ${blockDef.label}`}
      className={cn(
        'relative group transition-all ring-inset cursor-pointer outline-none',
        isSelected ? 'ring-2 ring-vj-green z-10' : 'hover:ring-1 hover:ring-zinc-300'
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
        'absolute -top-3 left-1/2 -translate-x-1/2 bg-vj-green text-zinc-950 px-3 py-1 text-[10px] font-bold rounded-full opacity-0 transition-opacity z-20 flex items-center gap-2 ',
        (isSelected || 'group-hover:opacity-100') && 'opacity-100',
        'focus-within:opacity-100'
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

      {/* Block content — styles applied to this wrapper */}
      <div
        className="pointer-events-none relative z-0"
        style={blockStyle}
        data-aos={aosAnimation}
        data-aos-duration={aosAnimation ? (node.props?.aosDuration || '500') : undefined}
        data-aos-delay={aosAnimation ? (node.props?.aosDelay || '0') : undefined}
      >
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

// ---------------------------------------------------------------------------
// Empty canvas state
// ---------------------------------------------------------------------------
function EmptyCanvas() {
  const addNode = useBuilderStore(state => state.addNode);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8 gap-6">
      <div className="w-24 h-24 rounded-3xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mb-2 shadow-xl">
        <Plus className="w-10 h-10 text-zinc-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Página em branco</h3>
        <p className="text-sm text-zinc-500 max-w-xs">
          Arraste blocos da barra lateral ou clique abaixo para escolher um template.
        </p>
      </div>
      <TemplateModal />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Canvas
// ---------------------------------------------------------------------------
export function BuilderCanvas() {
  const { nodes, setNodes, viewport, projectType, setSelectedNodeId } = useBuilderStore();

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

  const handleDragOverNative = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropNative = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('blockType');
    if (!type) return;

    const blockDef = BlockRegistry.get(type);
    if (!blockDef) return;

    const newNode: BuilderNode = {
      id: `${blockDef.type}-${Date.now()}`,
      type: blockDef.type,
      props: { ...blockDef.defaultProps },
      styles: { ...blockDef.defaultStyles },
      children: blockDef.acceptsChildren ? [] : undefined
    };

    useBuilderStore.getState().addNode(newNode);
  };

  // linkbio: always shows phone frame even in desktop view
  const isLinkbio = projectType === 'linkbio';

  const viewportLabel = VIEWPORT_LABELS[viewport] || viewport;

  return (
    <div
      className="flex-1 overflow-y-auto bg-zinc-900/50 relative flex flex-col items-center custom-scrollbar"
      onClick={handleCanvasClick}
    >
      {/* Viewport label bar */}
      <div className="sticky top-0 z-30 w-full flex justify-center pointer-events-none">
        <span className="mt-2 mb-0 px-3 py-1 bg-zinc-800/90 border border-white/10 rounded-full text-[11px] font-semibold text-zinc-400 tracking-wide shadow">
          {isLinkbio ? 'Linkbio — Mobile (375px)' : viewportLabel}
        </span>
      </div>

      {/* Canvas Area */}
      <div
        className={cn(
          'bg-white min-h-full transition-all duration-500 origin-top relative border border-transparent',
          isLinkbio && [
            'w-[375px] my-6 rounded-[2.5rem] overflow-hidden border-[10px] border-zinc-800',
          ],
          !isLinkbio && viewport === 'desktop' && 'w-full',
          !isLinkbio && viewport === 'tablet' && 'w-[768px] my-8 rounded-2xl overflow-hidden border-zinc-200',
          !isLinkbio && viewport === 'mobile' && 'w-[375px] my-8 rounded-[2rem] overflow-hidden border-[12px] border-zinc-800'
        )}
        onDragOver={handleDragOverNative}
        onDrop={handleDropNative}
      >
        {/* Phone-like top bar for linkbio/mobile frames */}
        {(isLinkbio || (!isLinkbio && viewport === 'mobile')) && (
          <div className="h-7 bg-zinc-900 flex items-center justify-center shrink-0">
            <div className="w-20 h-1.5 bg-zinc-600 rounded-full" />
          </div>
        )}

        {nodes.length === 0 ? (
          <EmptyCanvas />
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
