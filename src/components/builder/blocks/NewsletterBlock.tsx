import React from 'react';
import { Mail } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const NewsletterBlock: BlockDef = {
  type: 'NewsletterBlock',
  label: 'Newsletter',
  category: 'interactive',
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
  renderComponent: ({ node }) => {
    const { title, description, placeholder, buttonText, disclaimer } = node.props;
    
    // Motor Real de Supabase
    const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
      blockId: node.id, 
      source: 'Newsletter Form' 
    });

    return (
      <div className="max-w-4xl mx-auto text-center px-4 py-12 bg-slate-50 rounded-3xl border border-slate-100">
        <Mail className="w-10 h-10 text-blue-500 mx-auto mb-6" />
        <EditableText
          nodeId={node.id}
          propKey="title"
          value={title}
          className="text-3xl font-bold text-slate-900 mb-4"
        />
        <EditableText
          nodeId={node.id}
          propKey="description"
          value={description}
          className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
        />
        
        {isSuccess ? (
          <div className="max-w-md mx-auto p-4 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 flex items-center justify-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            Inscrição confirmada com sucesso!
          </div>
        ) : (
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 mb-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              required
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
            </button>
          </form>
        )}
        
        <EditableText
          nodeId={node.id}
          propKey="disclaimer"
          value={disclaimer}
          className="text-xs text-slate-500"
        />
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const { placeholder, buttonText } = node.props;
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Input Placeholder</Label>
          <Input
            value={placeholder}
            onChange={(e) => onChange({ props: { ...node.props, placeholder: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={buttonText}
            onChange={(e) => onChange({ props: { ...node.props, buttonText: e.target.value } })}
          />
        </div>
      </div>
    );
  },
};
