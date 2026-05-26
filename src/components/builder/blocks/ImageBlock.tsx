import { BlockDef } from '../core/types';
import { Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  renderComponent: ({ props, styles }) => (
    <div style={{...styles, overflow: 'hidden'}} className="flex items-center justify-center bg-slate-100 border border-slate-200">
      <img 
        src={props.url} 
        alt={props.alt} 
        style={{ width: '100%', height: '100%', objectFit: props.objectFit }} 
      />
    </div>
  ),
  settingsComponent: ({ props, updateProps }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input 
          value={props.url} 
          onChange={(e) => updateProps({ url: e.target.value })} 
        />
      </div>
      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input 
          value={props.alt} 
          onChange={(e) => updateProps({ alt: e.target.value })} 
        />
      </div>
      <div className="space-y-2">
        <Label>Object Fit</Label>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={props.objectFit} 
          onChange={(e) => updateProps({ objectFit: e.target.value })}
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
