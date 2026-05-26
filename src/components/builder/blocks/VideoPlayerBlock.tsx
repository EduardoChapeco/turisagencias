import { BlockDef } from '../core/types';
import { Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const VideoPlayerBlock: BlockDef = {
  type: 'VideoPlayerBlock',
  label: 'Video Player',
  category: 'media',
  icon: Play,
  defaultProps: {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    autoplay: false,
  },
  defaultStyles: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  },
  renderComponent: ({ props, styles }) => {
    const isMp4 = props.url?.endsWith('.mp4');
    
    return (
      <div style={styles} className="relative w-full h-full bg-slate-100 flex items-center justify-center border border-slate-200">
        {isMp4 ? (
          <video 
            src={props.url} 
            autoPlay={props.autoplay} 
            controls 
            className="w-full h-full object-cover"
          />
        ) : (
          <iframe 
            src={`${props.url}${props.autoplay ? '?autoplay=1' : ''}`} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
      </div>
    );
  },
  settingsComponent: ({ props, updateProps }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Video URL (YouTube/Vimeo embed or .mp4)</Label>
        <Input 
          value={props.url} 
          onChange={(e) => updateProps({ url: e.target.value })} 
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input 
          type="checkbox" 
          id="autoplay"
          checked={props.autoplay} 
          onChange={(e) => updateProps({ autoplay: e.target.checked })} 
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="autoplay" className="cursor-pointer">Autoplay</Label>
      </div>
    </div>
  ),
};
