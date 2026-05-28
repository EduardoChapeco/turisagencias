import React, { useState } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BlockRegistry } from './registry';
import { BuilderNode } from './types';
import { X, SlidersHorizontal, Settings2, Code, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaPicker } from '../MediaPicker';

// Helper para encontrar nó
function findNode(nodes: BuilderNode[], id: string): BuilderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

type TabId = 'content' | 'style' | 'advanced';

// ---------------------------------------------------------------------------
// Reusable field primitives
// ---------------------------------------------------------------------------
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3 pt-1">
      {children}
    </h4>
  );
}

function Divider() {
  return <div className="border-t border-white/8 my-4" />;
}

const selectCls =
  'w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green';

// ---------------------------------------------------------------------------
// ESTILO TAB
// ---------------------------------------------------------------------------
function EstiloTab({ node, updateNode }: { node: BuilderNode; updateNode: (id: string, u: Partial<BuilderNode>) => void }) {
  const s = node.styles || {};

  const set = (key: string, value: string) => {
    updateNode(node.id, { styles: { ...node.styles, [key]: value } });
  };

  return (
    <div className="space-y-1">
      {/* ── Espaçamento ── */}
      <SectionTitle>Espaçamento</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Padding Topo</FieldLabel>
          <select className={selectCls} value={s.paddingTop || '0'} onChange={e => set('paddingTop', e.target.value)}>
            <option value="0">0</option>
            <option value="16px">16px</option>
            <option value="32px">32px</option>
            <option value="48px">48px</option>
            <option value="64px">64px</option>
            <option value="96px">96px</option>
            <option value="128px">128px</option>
          </select>
        </div>
        <div>
          <FieldLabel>Padding Fundo</FieldLabel>
          <select className={selectCls} value={s.paddingBottom || '0'} onChange={e => set('paddingBottom', e.target.value)}>
            <option value="0">0</option>
            <option value="16px">16px</option>
            <option value="32px">32px</option>
            <option value="48px">48px</option>
            <option value="64px">64px</option>
            <option value="96px">96px</option>
            <option value="128px">128px</option>
          </select>
        </div>
      </div>
      <div>
        <FieldLabel>Padding Esq/Dir</FieldLabel>
        <select className={selectCls} value={s.paddingHorizontal || '0'} onChange={e => set('paddingHorizontal', e.target.value)}>
          <option value="0">0</option>
          <option value="16px">16px</option>
          <option value="32px">32px</option>
          <option value="64px">64px</option>
          <option value="auto">auto</option>
        </select>
      </div>

      <Divider />

      {/* ── Fundo ── */}
      <SectionTitle>Fundo</SectionTitle>
      <div>
        <FieldLabel>Cor de Fundo</FieldLabel>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={s.backgroundColor || '#ffffff'}
            onChange={e => set('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={s.backgroundColor || ''}
            onChange={e => set('backgroundColor', e.target.value)}
            placeholder="#ffffff"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green"
          />
        </div>
      </div>

      <div className="mt-2">
        <FieldLabel>Imagem de Fundo</FieldLabel>
        <MediaPicker
          value={s.backgroundImage || ''}
          onChange={url => set('backgroundImage', url)}
          label="Selecionar imagem de fundo"
          blockKind="background"
        />
      </div>

      <div className="mt-2">
        <FieldLabel>Sobreposição</FieldLabel>
        <select className={selectCls} value={s.overlay || 'none'} onChange={e => set('overlay', e.target.value)}>
          <option value="none">Nenhuma</option>
          <option value="dark-30">Escura 30%</option>
          <option value="dark-50">Escura 50%</option>
          <option value="gradient">Gradiente</option>
        </select>
      </div>

      <Divider />

      {/* ── Borda ── */}
      <SectionTitle>Borda</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Arredondamento</FieldLabel>
          <select className={selectCls} value={s.borderRadius || '0'} onChange={e => set('borderRadius', e.target.value)}>
            <option value="0">0</option>
            <option value="4px">4px</option>
            <option value="8px">8px</option>
            <option value="12px">12px</option>
            <option value="16px">16px</option>
            <option value="24px">24px</option>
            <option value="50%">50%</option>
          </select>
        </div>
        <div>
          <FieldLabel>Espessura</FieldLabel>
          <select className={selectCls} value={s.borderWidth || '0'} onChange={e => set('borderWidth', e.target.value)}>
            <option value="0">0</option>
            <option value="1px">1px</option>
            <option value="2px">2px</option>
          </select>
        </div>
      </div>
      <div className="mt-2">
        <FieldLabel>Cor da Borda</FieldLabel>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={s.borderColor || '#e4e4e7'}
            onChange={e => set('borderColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
          />
          <input
            type="text"
            value={s.borderColor || ''}
            onChange={e => set('borderColor', e.target.value)}
            placeholder="#e4e4e7"
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green"
          />
        </div>
      </div>

      <Divider />

      {/* ── Visibilidade ── */}
      <SectionTitle>Visibilidade</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Animação de Entrada</FieldLabel>
          <select className={selectCls} value={s.entranceAnimation || 'none'} onChange={e => set('entranceAnimation', e.target.value)}>
            <option value="none">Nenhuma</option>
            <option value="fadeIn">Fade In</option>
            <option value="slideUp">Slide Up</option>
            <option value="slideLeft">Slide Left</option>
            <option value="zoomIn">Zoom In</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>
        <div>
          <FieldLabel>Delay</FieldLabel>
          <select className={selectCls} value={s.animationDelay || '0ms'} onChange={e => set('animationDelay', e.target.value)}>
            <option value="0ms">0ms</option>
            <option value="100ms">100ms</option>
            <option value="200ms">200ms</option>
            <option value="300ms">300ms</option>
            <option value="500ms">500ms</option>
            <option value="800ms">800ms</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AVANÇADO TAB
// ---------------------------------------------------------------------------
function AvancadoTab({ node, updateNode }: { node: BuilderNode; updateNode: (id: string, u: Partial<BuilderNode>) => void }) {
  const p = node.props || {};
  const s = node.styles || {};

  const setProps = (key: string, value: string) => {
    updateNode(node.id, { props: { ...node.props, [key]: value } });
  };
  const setStyles = (key: string, value: string) => {
    updateNode(node.id, { styles: { ...node.styles, [key]: value } });
  };

  return (
    <div className="space-y-1">
      {/* ── Identificador ── */}
      <SectionTitle>Identificador</SectionTitle>
      <div>
        <FieldLabel>ID do Bloco</FieldLabel>
        <input
          type="text"
          value={p.customId || node.id}
          onChange={e => setProps('customId', e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green font-mono"
        />
      </div>
      <div className="mt-2">
        <FieldLabel>Classes CSS (separadas por vírgula)</FieldLabel>
        <input
          type="text"
          value={p.customClasses || ''}
          onChange={e => setProps('customClasses', e.target.value)}
          placeholder="ex: my-class, another-class"
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green font-mono"
        />
      </div>

      <Divider />

      {/* ── AOS ── */}
      <SectionTitle>Animação de Scroll (AOS)</SectionTitle>
      <div>
        <FieldLabel>Tipo</FieldLabel>
        <select className={selectCls} value={p.aosAnimation || 'none'} onChange={e => setProps('aosAnimation', e.target.value)}>
          <option value="none">Nenhuma</option>
          <option value="fade">fade</option>
          <option value="fade-up">fade-up</option>
          <option value="fade-left">fade-left</option>
          <option value="fade-right">fade-right</option>
          <option value="flip-up">flip-up</option>
          <option value="zoom-in">zoom-in</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <FieldLabel>Duração</FieldLabel>
          <select className={selectCls} value={p.aosDuration || '500'} onChange={e => setProps('aosDuration', e.target.value)}>
            <option value="300">300ms</option>
            <option value="500">500ms</option>
            <option value="700">700ms</option>
            <option value="1000">1000ms</option>
          </select>
        </div>
        <div>
          <FieldLabel>Delay</FieldLabel>
          <select className={selectCls} value={p.aosDelay || '0'} onChange={e => setProps('aosDelay', e.target.value)}>
            <option value="0">0</option>
            <option value="100">100ms</option>
            <option value="200">200ms</option>
            <option value="300">300ms</option>
          </select>
        </div>
      </div>

      <Divider />

      {/* ── CSS Customizado ── */}
      <SectionTitle>Código</SectionTitle>
      <div>
        <FieldLabel>CSS Customizado</FieldLabel>
        <textarea
          value={s.customCss || ''}
          onChange={e => setStyles('customCss', e.target.value)}
          placeholder={'/* ex: */\ncolor: red;\nopacity: 0.8;'}
          rows={6}
          className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-vj-green font-mono resize-y"
        />
        <p className="text-[10px] text-zinc-600 mt-1">
          Apenas propriedades CSS válidas. Sem seletores ou <code>{'{ }'}</code>.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function BuilderRightPanel() {
  const nodes = useBuilderStore(state => state.nodes);
  const selectedNodeId = useBuilderStore(state => state.selectedNodeId);
  const updateNode = useBuilderStore(state => state.updateNode);

  const [activeTab, setActiveTab] = useState<TabId>('content');

  const selectedNode = selectedNodeId ? findNode(nodes, selectedNodeId) : null;
  const blockDef = selectedNode ? BlockRegistry.get(selectedNode.type) : null;

  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="w-72 h-full bg-[#1A1A1A] border-l border-white/10 shrink-0 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
        <LayoutTemplate className="w-10 h-10 mb-3 opacity-20" />
        <h3 className="text-sm font-medium text-zinc-400 mb-1">Nenhum bloco selecionado</h3>
        <p className="text-xs">Selecione um bloco no canvas para editar suas propriedades e estilo.</p>
      </div>
    );
  }

  const Inspector = blockDef?.settingsComponent;

  const handleChange = (updates: Partial<BuilderNode>) => {
    updateNode(selectedNode.id, updates);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'content', label: 'Conteúdo', icon: Settings2 },
    { id: 'style', label: 'Estilo', icon: SlidersHorizontal },
    { id: 'advanced', label: 'Avançado', icon: Code },
  ];

  return (
    <div className="w-72 h-full bg-[#1A1A1A] border-l border-white/10 shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#111]">
        <div className="flex items-center gap-2">
          {blockDef?.icon && <blockDef.icon className="w-4 h-4 text-zinc-400" />}
          <span className="text-sm font-semibold text-white">{blockDef?.label || selectedNode.type}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10"
          onClick={() => useBuilderStore.getState().setSelectedNodeId(null)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-2 border-b border-white/10 gap-1 bg-[#151515]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'content' && (
          Inspector ? (
            <Inspector node={selectedNode} onChange={handleChange} />
          ) : (
            <div className="text-sm text-zinc-500 border border-white/10 border-dashed rounded p-4 text-center">
              Este bloco não possui inspetor configurado.
            </div>
          )
        )}

        {activeTab === 'style' && (
          <EstiloTab node={selectedNode} updateNode={updateNode} />
        )}

        {activeTab === 'advanced' && (
          <AvancadoTab node={selectedNode} updateNode={updateNode} />
        )}
      </div>
    </div>
  );
}
