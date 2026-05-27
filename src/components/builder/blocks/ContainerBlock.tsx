import React from 'react';
import { Box } from 'lucide-react';
import { BlockDef } from '../core/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ContainerBlock: BlockDef = {
  type: 'container',
  label: 'Container',
  category: 'layout',
  icon: Box,
  defaultProps: {},
  defaultStyles: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    width: '100%',
  },
  renderComponent: ({ node }) => {
    return (
      <div style={node.styles}>
        <div className="min-h-[100px] border-2 border-dashed border-blue-200 bg-blue-50/30 rounded flex items-center justify-center text-blue-400 text-sm">
          Container (Drop blocks here)
        </div>
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const handleStyleChange = (key: string, value: any) => {
      onChange({ styles: { ...node.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Background Color</Label>
          <Input 
            type="color"
            value={node.styles.backgroundColor}
            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Padding</Label>
          <Input 
            type="text"
            value={node.styles.padding}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            placeholder="e.g. 24px"
          />
        </div>
        <div className="space-y-2">
          <Label>Border Width</Label>
          <Input 
            type="text"
            value={node.styles.borderWidth}
            onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
            placeholder="e.g. 1px"
          />
        </div>
        <div className="space-y-2">
          <Label>Border Color</Label>
          <Input 
            type="color"
            value={node.styles.borderColor}
            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Border Radius</Label>
          <Input 
            type="text"
            value={node.styles.borderRadius}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            placeholder="e.g. 8px"
          />
        </div>
      </div>
    );
  }
};
