import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { ListOrdered } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const StepsBlock: BlockDef = {
  type: 'StepsBlock',
  label: 'Steps / How It Works',
  category: 'advanced',
  icon: ListOrdered,
  defaultProps: {
    steps: [
      { id: '1', title: 'Step 1', description: 'Describe the first step of your process here.' },
      { id: '2', title: 'Step 2', description: 'Describe the second step of your process here.' },
      { id: '3', title: 'Step 3', description: 'Describe the final step of your process here.' },
    ],
  },
  defaultStyles: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  renderComponent: ({ props, styles }) => {
    return (
      <div style={styles} className="w-full">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.steps.map((step: any, index: number) => (
            <div key={step.id} className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full z-0 pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6 relative z-10">
                {index + 1}
              </div>
              <div className="relative z-10 w-full font-semibold text-lg mb-3">
                <EditableText 
                  propKey={`steps.${index}.title`} 
                  value={step.title} 
                />
              </div>
              <div className="relative z-10 w-full text-muted-foreground text-sm leading-relaxed">
                <EditableText 
                  propKey={`steps.${index}.description`} 
                  value={step.description} 
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
        <Label>Settings</Label>
        <p className="text-xs text-muted-foreground">Edit titles and descriptions directly on the canvas.</p>
      </div>
    </div>
  ),
};
