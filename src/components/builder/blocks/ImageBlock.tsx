import { BlockDef } from '../core/types';
import { Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '../MediaPicker';

export const ImageBlock: BlockDef = {
  type: 'ImageBlock',
  label: 'Image',
  category: 'media',
  icon: ImageIcon,
  defaultProps: {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    alt: 'Placeholder image',
    objectFit: 'cover',
  },
  defaultStyles: {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem',
  },
  renderComponent: ({ node }) => (
    <div style={{...node.styles, overflow: 'hidden'}} className="flex items-center justify-center bg-slate-100 border border-slate-200">
      <img 
        src={node.props.url} 
        alt={node.props.alt} 
        style={{ width: '100%', height: '100%', objectFit: node.props.objectFit }} 
      />
    </div>
  ),
  settingsComponent: ({ node, onChange }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Imagem / Mídia</Label>
        <MediaPicker 
          value={node.props.url || ''} 
          onChange={(url) => onChange({ props: { ...node.props, url } })} 
          label="Selecionar Imagem"
        />
      </div>
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input 
          value={node.props.alt} 
          onChange={(e) => onChange({ props: { ...node.props,  alt: e.target.value } })} 
        />
      </div>
      <div className="space-y-2">
        <Label>Object Fit</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={node.props.objectFit} 
          onChange={(e) => onChange({ props: { ...node.props,  objectFit: e.target.value } })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  ),
};
