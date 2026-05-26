import React from 'react';
import { FoldVertical, ChevronDown } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';

export const AccordionBlock: BlockDef = {
  type: 'AccordionBlock',
  label: 'Accordion',
  category: 'content',
  icon: FoldVertical,
  defaultProps: {
    title: 'Frequently Asked Questions',
    items: [
      {
        id: '1',
        question: 'What is the refund policy?',
        answer: 'We offer a 30-day money-back guarantee for all our products. If you are not satisfied, contact our support team.',
      },
      {
        id: '2',
        question: 'Do you offer technical support?',
        answer: 'Yes, we provide 24/7 technical support via email and chat for all premium plans.',
      },
      {
        id: '3',
        question: 'Can I upgrade my plan later?',
        answer: 'Absolutely! You can upgrade or downgrade your plan at any time from your account settings.',
      }
    ],
  },
  defaultStyles: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  renderComponent: ({ block, updateBlock }) => {
    const { title, items } = block.props;

    const updateItem = (index: number, key: string, value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [key]: value };
      updateBlock(block.id, { props: { ...block.props, items: newItems } });
    };

    return (
      <div className="max-w-3xl mx-auto">
        <EditableText
          value={title}
          onChange={(val) => updateBlock(block.id, { props: { ...block.props, title: val } })}
          className="text-3xl font-bold text-slate-900 mb-8 text-center"
        />
        
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <details key={item.id} className="group border border-slate-200 rounded-xl bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer text-slate-900 font-medium">
                <EditableText
                  value={item.question}
                  onChange={(val) => updateItem(index, 'question', val)}
                  className="w-full mr-4"
                />
                <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-4">
                <EditableText
                  value={item.answer}
                  onChange={(val) => updateItem(index, 'answer', val)}
                  className="w-full"
                />
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const { items } = block.props;

    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500 mb-4">Edit questions and answers directly in the builder by expanding the accordion items.</p>
        <button 
          onClick={() => {
            const newItems = [...items, { id: Date.now().toString(), question: 'New Question', answer: 'New Answer' }];
            updateBlock(block.id, { props: { ...block.props, items: newItems } });
          }}
          className="w-full py-2 px-4 bg-slate-100 text-slate-900 rounded-md font-medium text-sm hover:bg-slate-200 transition-colors"
        >
          + Add Accordion Item
        </button>
      </div>
    );
  },
};
