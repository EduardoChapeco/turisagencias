import React from 'react';
import { Expand } from 'lucide-react';
import { BlockDef } from '../core/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const SpacerBlock: BlockDef = {
  type: 'spacer',
  label: 'Spacer',
  category: 'layout',
  icon: Expand,
  defaultProps: {},
  defaultStyles: {
    height: '32px',
    width: '100%',
  },
  renderComponent: ({ block }) => {
    return (
      <div 
        style={block.styles} 
        className="empty:bg-transparent transition-colors hover:bg-blue-50/50 rounded-sm"
        title="Spacer Block"
      />
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const handleStyleChange = (key: string, value: any) => {
      updateBlock(block.id, { styles: { ...block.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Height</Label>
          <Input 
            type="text"
            value={block.styles.height}
            onChange={(e) => handleStyleChange('height', e.target.value)}
            placeholder="e.g. 32px"
          />
        </div>
      </div>
    );
  }
};
