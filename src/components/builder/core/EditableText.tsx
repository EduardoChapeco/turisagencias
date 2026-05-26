import React, { useRef, useEffect, useState } from 'react';
import { useBuilderStore } from './useBuilderStore';

interface EditableTextProps {
  nodeId: string;
  propKey: string;
  value: string;
  as?: React.ElementType;
  className?: string;
  placeholder?: string;
}

export function EditableText({ 
  nodeId, 
  propKey, 
  value, 
  as: Component = 'span', 
  className,
  placeholder = 'Digite aqui...' 
}: EditableTextProps) {
  const { updateNode, selectedNodeId, isPreview } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  
  const isSelected = selectedNodeId === nodeId;
  const content = value || placeholder;

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
      updateNode(nodeId, { props: { [propKey]: newValue } });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setIsEditing(true);
    // Focus and select all
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
