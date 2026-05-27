import React from 'react';
import { Type } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ParagraphBlock: BlockDef = {
  type: 'paragraph',
  label: 'Paragraph',
  category: 'typography',
  icon: Type,
  defaultProps: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  defaultStyles: {
    textAlign: 'left',
    color: '#4B5563',
    marginTop: '0px',
    marginBottom: '16px',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  renderComponent: ({ node }) => {
    return (
      <p style={node.styles}>
        <EditableText
          nodeId={node.id}
          propKey="text"
          value={node.props.text}
          placeholder="Enter paragraph text..."
        />
      </p>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const handleStyleChange = (key: string, value: any) => {
      onChange({ styles: { ...node.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Alignment</Label>
          <select 
            className="w-full p-2 border rounded-md text-sm"
            value={node.styles.textAlign}
            onChange={(e) => handleStyleChange('textAlign', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Font Size</Label>
          <Input 
            type="text"
            value={node.styles.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            placeholder="e.g. 16px"
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input 
            type="color"
            value={node.styles.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
          />
        </div>
      </div>
    );
  }
};
