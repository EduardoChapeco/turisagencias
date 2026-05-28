import React from 'react';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

// The new Node Tree structure for nested blocks
export interface BuilderNode<P = Record<string, any>> {
 id: string;
 type: string; // references BlockDef.type
 props: P; // specific props like title, items, email
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
 color?: string;
 height?: string;
 width?: string;
 padding?: string;
}

export type BlockCategory = 'layout' | 'typography' | 'media' | 'interactive' | 'cms' | 'premium' | 'advanced' | 'forms' | 'travel' | 'hero';

// The definition of a specific block type
export interface BlockDef<P = Record<string, any>> {
 type: string;
 label: string;
 category: BlockCategory;
 icon?: React.ElementType; // Lucide icon
 
 // Default values when the block is dropped
 defaultProps?: P;
 defaultStyles?: BlockStyles;
 
 // Renders the actual block on the canvas
 // Using `any` or flexible types to allow legacy blocks that use {data} or {props} alongside modern {node} blocks.
 renderComponent: React.ComponentType<any>;
 
 // Renders the specific configuration form in the sidebar
 settingsComponent: React.ComponentType<any>;
 
 // Whether this block can accept children (like a grid or section)
 acceptsChildren?: boolean;

 // Whether this block takes care of rendering its own children
 rendersChildrenNatively?: boolean;
}
