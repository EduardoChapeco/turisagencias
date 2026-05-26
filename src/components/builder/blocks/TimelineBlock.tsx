import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Milestone } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const TimelineBlock: BlockDef = {
  type: 'TimelineBlock',
  label: 'Timeline',
  category: 'advanced',
  icon: Milestone,
  defaultProps: {
    items: [
      { id: '1', year: '2020', title: 'Company Founded', description: 'Started our journey in a small garage.' },
      { id: '2', year: '2021', title: 'First Funding', description: 'Secured seed funding to expand the team.' },
      { id: '3', year: '2023', title: 'Global Launch', description: 'Opened offices in 3 new countries.' },
    ],
  },
  defaultStyles: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  renderComponent: ({ props, styles }) => {
    return (
      <div style={styles} className="w-full">
        <div className="max-w-3xl mx-auto relative border-l-2 border-primary/20 pl-6 ml-4 md:ml-auto space-y-12">
          {props.items.map((item: any, index: number) => (
            <div key={item.id} className="relative">
              <div className="absolute -left-[35px] top-1 w-5 h-5 bg-white border-4 border-primary rounded-full shadow-sm z-10" />
              <div className="mb-1 text-sm font-bold text-primary tracking-wider">
                <EditableText 
                  propKey={`items.${index}.year`} 
                  value={item.year} 
                />
              </div>
              <div className="text-xl font-semibold text-slate-900 mb-2">
                <EditableText 
                  propKey={`items.${index}.title`} 
                  value={item.title} 
                />
              </div>
              <div className="text-slate-600 leading-relaxed text-sm">
                <EditableText 
                  propKey={`items.${index}.description`} 
                  value={item.description} 
                  multiline
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
        <Label>Timeline Settings</Label>
        <p className="text-xs text-muted-foreground">Edit year, title, and description directly on the canvas.</p>
      </div>
    </div>
  ),
};
