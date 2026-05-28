import React from 'react';
import { User, Link, Globe } from 'lucide-react';

export const CardTeamMemberBlock = {
 type: 'cardTeamMember',
 category: 'commerce',
 label: 'Team Member Card',
 icon: User,
 renderComponent: ({ data }: any) => (
 <div className="p-6 border rounded-xl flex flex-col items-center text-center ">
 <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400">
 <User size={32} />
 </div>
 <h3 className="font-semibold text-lg">{node.props.name || 'Jane Doe'}</h3>
 <p className="text-blue-600 text-sm mb-4">{node.props.role || 'Travel Expert'}</p>
 <div className="flex gap-3 text-gray-500">
 <Link size={18} className="cursor-pointer hover:text-blue-700" />
 <Globe size={18} className="cursor-pointer hover:text-blue-400" />
 </div>
 </div>
 ),
 settingsComponent: ({ node, onChange }) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Name</label>
 <input 
 className="border rounded p-2 text-sm"
 value={node.props.name || ''} 
 onChange={(e) => onChange({ props: { ...node.props,  name: e.target.value } })} 
 />
 <label className="text-sm font-medium">Role</label>
 <input 
 className="border rounded p-2 text-sm"
 value={node.props.role || ''} 
 onChange={(e) => onChange({ props: { ...node.props,  role: e.target.value } })} 
 />
 </div>
 )
};
