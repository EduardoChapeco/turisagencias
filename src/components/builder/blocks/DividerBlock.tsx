import React from 'react';
import { Minus } from 'lucide-react';
import { BlockDef } from '../core/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const DividerBlock: BlockDef = {
  type: 'divider',
  label: 'Divider',
  category: 'layout',
  icon: Minus,
  defaultProps: {},
  defaultStyles: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: '#E5E7EB',
    marginTop: '24px',
    marginBottom: '24px',
    width: '100%',
  },
  renderComponent: ({ block }) => {
    return (
      <div style={{ padding: '4px 0' }}>
        <hr style={block.styles} />
      </div>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const handleStyleChange = (key: string, value: any) => {
      updateBlock(block.id, { styles: { ...block.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Thickness</Label>
          <Input 
            type="text"
            value={block.styles.borderTopWidth}
            onChange={(e) => handleStyleChange('borderTopWidth', e.target.value)}
            placeholder="e.g. 1px"
          />
        </div>
        <div className="space-y-2">
          <Label>Style</Label>
          <select 
            className="w-full p-2 border rounded-md text-sm"
            value={block.styles.borderTopStyle}
            onChange={(e) => handleStyleChange('borderTopStyle', e.target.value)}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input 
            type="color"
            value={block.styles.borderTopColor}
            onChange={(e) => handleStyleChange('borderTopColor', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Margin Top</Label>
          <Input 
            type="text"
            value={block.styles.marginTop}
            onChange={(e) => handleStyleChange('marginTop', e.target.value)}
            placeholder="e.g. 24px"
          />
        </div>
        <div className="space-y-2">
          <Label>Margin Bottom</Label>
          <Input 
            type="text"
            value={block.styles.marginBottom}
            onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
            placeholder="e.g. 24px"
          />
        </div>
      </div>
    );
  }
};
