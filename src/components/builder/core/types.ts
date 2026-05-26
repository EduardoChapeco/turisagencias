import React from 'react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

// The new Node Tree structure for nested blocks
export interface BuilderNode {
  id: string;
  type: string; // references BlockDef.type
  props: Record<string, any>; // specific props like title, items, email
  styles: Record<string, any>; // global style rules (margins, padding, colors)
  children?: BuilderNode[]; // for nested layouts (grids, containers)
}

// Global Style Settings for a block
export interface BlockStyles {
  paddingTop?: string;
  paddingBottom?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  customClasses?: string;
}

export type BlockCategory = 'layout' | 'typography' | 'media' | 'interactive' | 'cms' | 'premium';

// The definition of a specific block type
export interface BlockDef {
  type: string;
  label: string;
  category: BlockCategory;
  icon?: React.ElementType; // Lucide icon
  
  // Default values when the block is dropped
  defaultProps: Record<string, any>;
  defaultStyles: BlockStyles;
  
  // Renders the actual block on the canvas
  renderComponent: React.FC<{ node: BuilderNode }>;
  
  // Renders the specific configuration form in the sidebar
  settingsComponent: React.FC<{ 
    node: BuilderNode; 
    onChange: (updates: Partial<BuilderNode>) => void 
  }>;
  
  // Whether this block can accept children (like a grid or section)
  acceptsChildren?: boolean;
}
