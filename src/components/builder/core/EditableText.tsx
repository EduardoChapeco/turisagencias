import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBuilderStore } from './useBuilderStore';
import { BuilderNode } from './types';

interface EditableTextProps {
 nodeId: string;
 propKey: string;
 value: string;
 as?: React.ElementType;
 className?: string;
 placeholder?: string;
 onChange?: (val: any) => void;
 multiline?: boolean;
}

export function EditableText({ 
 nodeId, 
 propKey, 
 value, 
 as: Component = 'span', 
 className,
 placeholder = 'Digite aqui...',
 onChange,
 multiline
}: EditableTextProps) {
 const updateNode = useBuilderStore(state => state.updateNode);
 const isPreview = useBuilderStore(state => state.isPreview);
 const isSelected = useBuilderStore(state => state.selectedNodeId === nodeId);
 const nodes = useBuilderStore(state => state.nodes);

 const [isEditing, setIsEditing] = useState(false);
 const elementRef = useRef<HTMLElement>(null);
 
 const content = value || placeholder;

 // Find current node props for merging (prevents overwriting sibling props)
 const findNodeProps = useCallback(() => {
 const findInTree = (list: BuilderNode[]): Record<string, any> | null => {
 for (const n of list) {
 if (n.id === nodeId) return n.props;
 if (n.children) {
 const found = findInTree(n.children);
 if (found) return found;
 }
 }
 return null;
 };
 return findInTree(nodes) ?? {};
 }, [nodes, nodeId]);

 useEffect(() => {
 // Sync external value changes if not actively editing
 if (!isEditing && elementRef.current && elementRef.current.innerText !== value) {
 elementRef.current.innerText = value || '';
 }
 }, [value, isEditing]);

 const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
 setIsEditing(false);
 const newValue = e.target.innerText;
 if (newValue !== value) {
 const currentProps = findNodeProps();
 updateNode(nodeId, { props: { ...currentProps, [propKey]: newValue } });
 }
 };

 const handleDoubleClick = (e: React.MouseEvent) => {
 if (isPreview) return;
 e.stopPropagation();
 setIsEditing(true);
 setTimeout(() => {
 if (elementRef.current) {
 elementRef.current.focus();
 const range = document.createRange();
 range.selectNodeContents(elementRef.current);
 const sel = window.getSelection();
 sel?.removeAllRanges();
 sel?.addRange(range);
 }
 }, 10);
 };

 if (isPreview) {
 return <Component className={className}>{value}</Component>;
 }

 return (
 <Component
 ref={elementRef}
 contentEditable={isEditing}
 suppressContentEditableWarning={true}
 onBlur={handleBlur}
 onDoubleClick={handleDoubleClick}
 className={`${className} ${!value ? 'opacity-50' : ''} ${!isEditing && isSelected ? 'hover:ring-1 hover:ring-vj-green/50 cursor-text' : ''} ${isEditing ? 'outline-none ring-2 ring-vj-green bg-white/5 cursor-text' : 'outline-none'}`}
 title="Clique duplo para editar"
 >
 {content}
 </Component>
 );
}
