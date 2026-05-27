import { z } from 'zod';
import React from 'react';

// Common Zod schemas that blocks might use
export const baseBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.any()),
  styles: z.record(z.string(), z.any()).optional(),
  bindings: z.record(z.string(), z.string()).optional(), // DB column bindings
});

export type BlockData = z.infer<typeof baseBlockSchema>;

// Contract for the Renderer Component
export interface RendererProps {
  data: BlockData;
  isSelected?: boolean;
  isHovered?: boolean;
  isPreview?: boolean;
  onPropChange?: (path: string, value: any) => void;
  children?: React.ReactNode;
}

// Contract for the Inspector Component
export interface InspectorProps {
  data: BlockData;
  onChange: (data: Partial<BlockData>) => void;
  onPropChange: (path: string, value: any) => void;
}

// Full Block Definition v7.0
export type BuilderBlockDefinition = {
  type: string;
  category: string;
  label: string;
  description: string;
  icon: string;
  tags: string[];
  defaultProps: Record<string, unknown>;
  schema: z.ZodSchema;
  Renderer: React.ComponentType<RendererProps>;
  Inspector: React.ComponentType<InspectorProps>;
  supportsChildren: boolean;
  supportsResponsive: boolean;
  supportsBindings: boolean;
  supportsAnimations: boolean;
  requiredDataSources?: string[];
  requiredPlan?: string;
};
