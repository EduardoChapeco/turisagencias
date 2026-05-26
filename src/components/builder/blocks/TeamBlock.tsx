import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
  renderComponent: ({ props, styles }) => {
    return (
      <div style={styles} className="w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {props.members.map((member: any, index: number) => (
            <div key={member.id} className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
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
  settingsComponent: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Settings</Label>
        <p className="text-xs text-muted-foreground">Edit names and roles directly on the canvas. Avatars can be changed in code.</p>
      </div>
    </div>
  ),
};
