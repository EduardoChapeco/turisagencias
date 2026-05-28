import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Users } from 'lucide-react';
import { ArrayField } from '../core/ArrayField';

export const TeamBlock: BlockDef = {
 type: 'TeamBlock',
 label: 'Team Members',
 category: 'advanced',
 icon: Users,
 defaultProps: {
 members: [
 { id: '1', name: 'Alice Smith', role: 'CEO & Founder', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
 { id: '2', name: 'Bob Johnson', role: 'Head of Design', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
 { id: '3', name: 'Carol Williams', role: 'Lead Developer', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
 ],
 },
 defaultStyles: {
 padding: '4rem 2rem',
 backgroundColor: '#f8fafc',
 },
 renderComponent: ({ node }) => {
 return (
 <div style={node.styles} className="w-full">
 <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
 {props.members.map((member: any, index: number) => (
 <div key={member.id} className="flex flex-col items-center bg-white p-6 rounded-2xl hover: transition-all duration-300">
 <img 
 src={member.avatar} 
 alt={member.name} 
 className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary/5"
 />
 <div className="font-bold text-lg text-slate-900 w-full text-center">
 <EditableText 
 propKey={`members.${index}.name`} 
 value={member.name} 
 />
 </div>
 <div className="text-sm font-medium text-primary mt-1 w-full text-center">
 <EditableText 
 propKey={`members.${index}.role`} 
 value={member.role} 
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => (
 <div className="space-y-6">
 <ArrayField
 title="Membros da Equipe"
 items={node.props.members || []}
 onChange={(members) => onChange({ props: { ...node.props, members } })}
 defaultItem={{ name: 'Novo Membro', role: 'Cargo', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }}
 schema={[
 { key: 'name', label: 'Nome', type: 'text' },
 { key: 'role', label: 'Cargo', type: 'text' },
 { key: 'avatar', label: 'URL da Foto (Avatar)', type: 'url' }
 ]}
 />
 </div>
 ),
};
