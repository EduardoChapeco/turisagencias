import React from 'react';
import { Heading } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const HeadingBlock: BlockDef = {
  type: 'heading',
  label: 'Heading',
  category: 'typography',
  icon: Heading,
  defaultProps: {
    level: 'h2',
    text: 'Heading Text',
  },
  defaultStyles: {
    textAlign: 'left',
    color: '#111827',
    marginTop: '0px',
    marginBottom: '16px',
    fontSize: '24px',
    fontWeight: '700',
  },
  renderComponent: ({ node }) => {
    const { level, text } = node.props;
    const Tag = level as keyof JSX.IntrinsicElements;
    return (
      <Tag style={node.styles}>
        <EditableText
          nodeId={node.id}
          propKey="text"
          value={text}
          placeholder="Enter heading..."
        />
      </Tag>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const handlePropChange = (key: string, value: any) => {
      onChange({ props: { ...node.props, [key]: value } });
    };
    const handleStyleChange = (key: string, value: any) => {
      onChange({ styles: { ...node.styles, [key]: value } });
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tag Level</Label>
          <select 
            className="w-full p-2 border rounded-md text-sm"
            value={node.props.level}
            onChange={(e) => handlePropChange('level', e.target.value)}
          >
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>
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
