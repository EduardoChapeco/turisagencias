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
  renderComponent: ({ node }) => {
    return (
      <div 
        style={node.styles} 
        className="empty:bg-transparent transition-colors hover:bg-blue-50/50 rounded-sm"
        title="Spacer Block"
      />
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const handleStyleChange = (key: string, value: any) => {
      onChange({ styles: { ...node.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Height</Label>
          <Input 
            type="text"
            value={node.styles.height}
            onChange={(e) => handleStyleChange('height', e.target.value)}
            placeholder="e.g. 32px"
          />
        </div>
      </div>
    );
  }
};
