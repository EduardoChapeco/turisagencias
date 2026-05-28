import React from 'react';
import { Map } from 'lucide-react';

export const CardDestinationBlock = {
 type: 'cardDestination',
 category: 'commerce',
 label: 'Destination Card',
 icon: Map,
 renderComponent: ({ data }: any) => (
 <div className="relative h-64 rounded-xl overflow-hidden group">
 <div className="absolute inset-0 bg-gray-300"></div>
 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
 <div className="absolute bottom-0 left-0 p-4 text-white">
 <h3 className="font-bold text-xl mb-1">{node.props.destination || 'Paris, France'}</h3>
 <p className="text-sm opacity-90">{node.props.description || 'Explore the city of lights'}</p>
 </div>
 </div>
 ),
 settingsComponent: ({ node, onChange }) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Destination</label>
 <input 
 className="border rounded p-2 text-sm"
 value={node.props.destination || ''} 
 onChange={(e) => onChange({ props: { ...node.props,  destination: e.target.value } })} 
 />
 <label className="text-sm font-medium">Description</label>
 <textarea 
 className="border rounded p-2 text-sm"
 value={node.props.description || ''} 
 onChange={(e) => onChange({ props: { ...node.props,  description: e.target.value } })} 
 />
 </div>
 )
};
