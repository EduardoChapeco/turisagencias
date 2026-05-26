import React from 'react';
import { Type } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ParagraphBlock: BlockDef = {
  type: 'paragraph',
  label: 'Paragraph',
  category: 'content',
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
  renderComponent: ({ block, updateBlock }) => {
    return (
      <p style={block.styles}>
        <EditableText
          text={block.props.text}
          onChange={(newText) => updateBlock(block.id, { props: { ...block.props, text: newText } })}
          placeholder="Enter paragraph text..."
        />
      </p>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const handleStyleChange = (key: string, value: any) => {
      updateBlock(block.id, { styles: { ...block.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Alignment</Label>
          <select 
            className="w-full p-2 border rounded-md text-sm"
            value={block.styles.textAlign}
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
            value={block.styles.fontSize}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            placeholder="e.g. 16px"
          />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input 
            type="color"
            value={block.styles.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
          />
        </div>
      </div>
    );
  }
};
