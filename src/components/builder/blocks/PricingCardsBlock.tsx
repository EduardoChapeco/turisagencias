import React from 'react';
import { CreditCard, Check } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const PricingCardsBlock: BlockDef = {
  type: 'PricingCardsBlock',
  label: 'Pricing Cards',
  category: 'advanced',
  icon: CreditCard,
  defaultProps: {
    cards: [
      {
        id: '1',
        title: 'Basic',
        price: '$9',
        period: '/month',
        description: 'Perfect for getting started',
        features: '1 User\nBasic Features\nCommunity Support',
        buttonText: 'Get Started',
        recommended: false,
      },
      {
        id: '2',
        title: 'Pro',
        price: '$29',
        period: '/month',
        description: 'Best for professionals',
        features: '5 Users\nAdvanced Features\nPriority Support\nAnalytics',
        buttonText: 'Get Pro',
        recommended: true,
      },
      {
        id: '3',
        title: 'Enterprise',
        price: '$99',
        period: '/month',
        description: 'For large teams',
        features: 'Unlimited Users\nCustom Features\n24/7 Phone Support\nDedicated Account Manager',
        buttonText: 'Contact Us',
        recommended: false,
      }
    ],
  },
  defaultStyles: {
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
  },
  renderComponent: ({ block, updateBlock }) => {
    const { cards } = block.props;

    const updateCard = (index: number, key: string, value: any) => {
      const newCards = [...cards];
      newCards[index] = { ...newCards[index], [key]: value };
      updateBlock(block.id, { props: { ...block.props, cards: newCards } });
    };

    return (
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
        {cards.map((card: any, index: number) => (
          <div
            key={card.id}
            className={`relative flex flex-col p-8 rounded-2xl border ${
              card.recommended
                ? 'border-blue-500 shadow-xl scale-105 z-10'
                : 'border-slate-200 shadow-sm'
            } bg-white w-full max-w-sm`}
          >
            {card.recommended && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Recommended
              </span>
            )}
            <div className="mb-6">
              <EditableText
                value={card.title}
                onChange={(val) => updateCard(index, 'title', val)}
                className="text-xl font-bold text-slate-900 mb-2"
              />
              <EditableText
                value={card.description}
                onChange={(val) => updateCard(index, 'description', val)}
                className="text-sm text-slate-500 min-h-[40px]"
              />
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <EditableText
                value={card.price}
                onChange={(val) => updateCard(index, 'price', val)}
                className="text-4xl font-extrabold text-slate-900"
              />
              <EditableText
                value={card.period}
                onChange={(val) => updateCard(index, 'period', val)}
                className="text-slate-500 font-medium"
              />
            </div>
            <ul className="flex-1 space-y-4 mb-8">
              {card.features.split('\n').map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                card.recommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const { cards } = block.props;

    const updateCard = (index: number, key: string, value: any) => {
      const newCards = [...cards];
      newCards[index] = { ...newCards[index], [key]: value };
      updateBlock(block.id, { props: { ...block.props, cards: newCards } });
    };

    return (
      <div className="space-y-6">
        {cards.map((card: any, index: number) => (
          <div key={card.id} className="p-4 border rounded-lg bg-slate-50 space-y-4">
            <h4 className="font-medium text-sm">Card {index + 1}</h4>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={card.buttonText}
                onChange={(e) => updateCard(index, 'buttonText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={card.features}
                onChange={(e) => updateCard(index, 'features', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`recommended-${card.id}`}
                checked={card.recommended}
                onChange={(e) => updateCard(index, 'recommended', e.target.checked)}
                className="rounded border-slate-300"
              />
              <Label htmlFor={`recommended-${card.id}`}>Recommended Badge</Label>
            </div>
          </div>
        ))}
      </div>
    );
  },
};
