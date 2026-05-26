import React from 'react';
import { BlockDef } from '../core/types';
import { FileText, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const TravelDocumentRequirementsBlock: BlockDef = {
  type: 'travel-document-requirements',
  label: 'Document Requirements',
  category: 'travel',
  icon: FileText,
  
  defaultProps: {
    title: 'Required Documents',
    description: 'Please ensure you have all the necessary documents before your trip.',
    requirements: [
      'Passport valid for at least 6 months beyond date of return',
      'Tourist Visa (can be obtained on arrival)',
      'Yellow Fever Vaccination Certificate',
      'Travel Insurance Policy'
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-amber-50/50',
    textColor: 'text-zinc-900',
  },

  renderComponent: ({ node }) => {
    const { title, description, requirements } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-100/50 border border-amber-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <EditableText
                nodeId={node.id}
                propKey="title"
                value={title}
                as="h2"
                className="text-2xl font-black text-amber-900"
              />
            </div>
            <EditableText
              nodeId={node.id}
              propKey="description"
              value={description}
              as="p"
              className="text-amber-800 mb-6"
            />
            <ul className="space-y-3">
              {requirements?.map((req: string, i: number) => (
                <li key={i} className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-amber-100">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-medium text-amber-950">{req}</span>
                </li>
              ))}
            </ul>
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
