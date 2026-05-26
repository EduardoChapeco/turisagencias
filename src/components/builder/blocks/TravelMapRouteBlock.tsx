import React from 'react';
import { BlockDef } from '../core/types';
import { Map } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelMapRouteBlock: BlockDef = {
  type: 'travel-map-route',
  label: 'Map & Route',
  category: 'travel',
  icon: Map,
  
  defaultProps: {
    title: 'Your Route',
    mapImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80',
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { title, mapImageUrl } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-5xl mx-auto">
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h2"
            className="text-2xl font-black mb-6"
          />
          <div className="w-full h-[400px] bg-slate-200 rounded-3xl overflow-hidden border border-slate-300 relative shadow-inner">
            <div className="absolute inset-0 bg-black/10 z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                <Map className="w-5 h-5 text-vj-green" />
                Interactive Map Placeholder
              </div>
            </div>
            <img src={mapImageUrl} alt="Map" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
          <Input 
            value={node.props.title || ''} 
            onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
