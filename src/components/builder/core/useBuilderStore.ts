import { create } from 'zustand';
import { BuilderNode, ViewportMode } from './types';

interface HistoryState {
 past: BuilderNode[][];
 future: BuilderNode[][];
}

interface BuilderState {
 // Configs
 siteId: string | null;
 pageId: string | null;
 projectType: 'website' | 'linkbio' | 'blog';
 slug: string;
 metaTitle: string;
 metaDescription: string;
 viewport: ViewportMode;
 
 // Node Tree (The actual page content)
 nodes: BuilderNode[];
 
 // Selection & UI
 selectedNodeId: string | null;
 activeTab: 'blocks' | 'settings' | 'edit';
 isPreview: boolean;
 
 // History & Dirty state
 history: HistoryState;
 isDirty: boolean;
 isSavingDraft: boolean;
 lastSavedAt: string | null;

 // Actions
 setNodes: (nodes: BuilderNode[]) => void;
 updateNode: (id: string, updates: Partial<BuilderNode>) => void;
 addNode: (node: BuilderNode, parentId?: string, index?: number) => void;
 removeNode: (id: string) => void;
 moveNode: (id: string, toParentId: string | null, toIndex: number) => void;
 
 setSelectedNodeId: (id: string | null) => void;
 setViewport: (viewport: ViewportMode) => void;
 setActiveTab: (tab: 'blocks' | 'settings' | 'edit') => void;
 setIsPreview: (isPreview: boolean) => void;
 setProjectMeta: (meta: Partial<Pick<BuilderState, 'slug' | 'metaTitle' | 'metaDescription' | 'siteId' | 'pageId' | 'projectType'>>) => void;
 setIsSavingDraft: (isSaving: boolean) => void;
 setLastSavedAt: (dateIso: string) => void;
 
 undo: () => void;
 redo: () => void;
 markSaved: () => void;
}

// Deep clone helper for history
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Recursive helper to update a node in the tree
const updateNodeInTree = (nodes: BuilderNode[], id: string, updates: Partial<BuilderNode>): BuilderNode[] => {
 return nodes.map(node => {
 if (node.id === id) {
 return { ...node, ...updates };
 }
 if (node.children) {
 return { ...node, children: updateNodeInTree(node.children, id, updates) };
 }
 return node;
 });
};

// Recursive helper to remove a node
const removeNodeFromTree = (nodes: BuilderNode[], id: string): BuilderNode[] => {
 return nodes.filter(node => node.id !== id).map(node => {
 if (node.children) {
 return { ...node, children: removeNodeFromTree(node.children, id) };
 }
 return node;
 });
};

const removeAndReturnNode = (nodes: BuilderNode[], id: string): { tree: BuilderNode[], node: BuilderNode | null } => {
 let foundNode: BuilderNode | null = null;
 const filterTree = (list: BuilderNode[]): BuilderNode[] => {
 const result: BuilderNode[] = [];
 for (const item of list) {
 if (item.id === id) {
 foundNode = { ...item };
 } else {
 const newItem = { ...item };
 if (newItem.children) {
 newItem.children = filterTree(newItem.children);
 }
 result.push(newItem);
 }
 }
 return result;
 };
 const newTree = filterTree(nodes);
 return { tree: newTree, node: foundNode };
};

const insertNodeAt = (nodes: BuilderNode[], parentId: string | null, node: BuilderNode, index: number): BuilderNode[] => {
 if (parentId === null) {
 const newNodes = [...nodes];
 newNodes.splice(index, 0, node);
 return newNodes;
 }

 return nodes.map(n => {
 if (n.id === parentId) {
 const children = [...(n.children || [])];
 children.splice(index, 0, node);
 return { ...n, children };
 }
 if (n.children) {
 return { ...n, children: insertNodeAt(n.children, parentId, node, index) };
 }
 return n;
 });
};

let lastHistoryPushTime = 0;

export const useBuilderStore = create<BuilderState>((set, get) => ({
 siteId: null,
 pageId: null,
 projectType: 'website',
 slug: 'home',
 metaTitle: '',
 metaDescription: '',
 viewport: 'desktop',
 
 nodes: [],
 
 selectedNodeId: null,
 activeTab: 'blocks',
 isPreview: false,
 
 history: { past: [], future: [] },
 isDirty: false,
 isSavingDraft: false,
 lastSavedAt: null,

 setNodes: (nodes) => set((state) => {
 const currentStr = JSON.stringify(state.nodes);
 const newStr = JSON.stringify(nodes);
 if (currentStr === newStr) return {};

 const now = Date.now();
 // Se a última edição no histórico foi há menos de 1.5 segundos, nós substituímos o último frame 
 // em vez de criar milhares de frames para cada letra digitada num EditableText. (Prevenção de Memory Leak)
 const shouldReplaceLast = state.history.past.length > 0 && (now - lastHistoryPushTime < 1500);
 lastHistoryPushTime = now;

 return {
 nodes,
 history: {
 past: shouldReplaceLast 
 ? [...state.history.past.slice(0, -1), clone(state.nodes)]
 : [...state.history.past, clone(state.nodes)].slice(-50), // keep last 50
 future: []
 },
 isDirty: true
 };
 }),

 updateNode: (id, updates) => set((state) => {
 const newNodes = updateNodeInTree(state.nodes, id, updates);
 return {
 nodes: newNodes,
 history: {
 past: [...state.history.past, clone(state.nodes)].slice(-50),
 future: []
 },
 isDirty: true
 };
 }),

 addNode: (node, parentId, index) => set((state) => {
 let newNodes = clone(state.nodes);
 
 if (!parentId) {
 if (typeof index === 'number') {
 newNodes.splice(index, 0, node);
 } else {
 newNodes.push(node);
 }
 } else {
 // Need recursive find and insert
 const insertIntoParent = (list: BuilderNode[]): BuilderNode[] => {
 return list.map(n => {
 if (n.id === parentId) {
 const children = n.children || [];
 if (typeof index === 'number') {
 children.splice(index, 0, node);
 } else {
 children.push(node);
 }
 return { ...n, children };
 }
 if (n.children) {
 return { ...n, children: insertIntoParent(n.children) };
 }
 return n;
 });
 };
 newNodes = insertIntoParent(newNodes);
 }

 return {
 nodes: newNodes,
 history: {
 past: [...state.history.past, clone(state.nodes)].slice(-50),
 future: []
 },
 isDirty: true,
 selectedNodeId: node.id,
 activeTab: 'edit'
 };
 }),

 removeNode: (id) => set((state) => {
 const newNodes = removeNodeFromTree(state.nodes, id);
 return {
 nodes: newNodes,
 selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
 activeTab: state.selectedNodeId === id ? 'blocks' : state.activeTab,
 history: {
 past: [...state.history.past, clone(state.nodes)].slice(-50),
 future: []
 },
 isDirty: true
 };
 }),

 moveNode: (id, toParentId, toIndex) => set((state) => {
 const { tree: treeAfterRemoval, node } = removeAndReturnNode(state.nodes, id);
 if (!node) return {};
 
 const newNodes = insertNodeAt(treeAfterRemoval, toParentId, node, toIndex);
 
 return {
 nodes: newNodes,
 history: {
 past: [...state.history.past, clone(state.nodes)].slice(-50),
 future: []
 },
 isDirty: true
 };
 }),

 setSelectedNodeId: (id) => set({ selectedNodeId: id, activeTab: id ? 'edit' : 'blocks' }),
 setViewport: (viewport) => set({ viewport }),
 setActiveTab: (tab) => set({ activeTab: tab }),
 setIsPreview: (isPreview) => set({ isPreview, selectedNodeId: isPreview ? null : get().selectedNodeId }),
 
 setProjectMeta: (meta) => set((state) => ({ ...state, ...meta, isDirty: true })),
 setIsSavingDraft: (isSavingDraft) => set({ isSavingDraft }),
 setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

 undo: () => set((state) => {
 const { past, future } = state.history;
 if (past.length === 0) return {};
 
 const previous = past[past.length - 1];
 const newPast = past.slice(0, past.length - 1);
 
 return {
 nodes: clone(previous),
 history: {
 past: newPast,
 future: [clone(state.nodes), ...future]
 },
 isDirty: true
 };
 }),

 redo: () => set((state) => {
 const { past, future } = state.history;
 if (future.length === 0) return {};
 
 const next = future[0];
 const newFuture = future.slice(1);
 
 return {
 nodes: clone(next),
 history: {
 past: [...past, clone(state.nodes)],
 future: newFuture
 },
 isDirty: true
 };
 }),

 markSaved: () => set({ isDirty: false })
}));
