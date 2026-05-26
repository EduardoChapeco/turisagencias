import React from 'react';
import { Mail } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const NewsletterBlock: BlockDef = {
  type: 'NewsletterBlock',
  label: 'Newsletter',
  category: 'advanced',
  icon: Mail,
  defaultProps: {
    title: 'Subscribe to our newsletter',
    description: 'Get the latest news, articles, and resources, sent to your inbox weekly.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
    disclaimer: 'We care about your data. Read our Privacy Policy.',
  },
  defaultStyles: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  renderComponent: ({ block, updateBlock }) => {
    const { title, description, placeholder, buttonText, disclaimer } = block.props;

    return (
      <div className="max-w-4xl mx-auto text-center px-4 py-12 bg-slate-50 rounded-3xl border border-slate-100">
        <Mail className="w-10 h-10 text-blue-500 mx-auto mb-6" />
        <EditableText
          value={title}
          onChange={(val) => updateBlock(block.id, { props: { ...block.props, title: val } })}
          className="text-3xl font-bold text-slate-900 mb-4"
        />
        <EditableText
          value={description}
          onChange={(val) => updateBlock(block.id, { props: { ...block.props, description: val } })}
          className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
        />
        
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 mb-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            readOnly
          />
          <button className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
            {buttonText}
          </button>
        </form>
        
        <EditableText
          value={disclaimer}
          onChange={(val) => updateBlock(block.id, { props: { ...block.props, disclaimer: val } })}
          className="text-xs text-slate-500"
        />
      </div>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const { placeholder, buttonText } = block.props;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Input Placeholder</Label>
          <Input
            value={placeholder}
            onChange={(e) => updateBlock(block.id, { props: { ...block.props, placeholder: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={buttonText}
            onChange={(e) => updateBlock(block.id, { props: { ...block.props, buttonText: e.target.value } })}
          />
        </div>
      </div>
    );
  },
};
