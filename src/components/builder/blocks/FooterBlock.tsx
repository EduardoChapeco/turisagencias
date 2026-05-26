import React from 'react';
import { PanelBottom } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';

export const FooterBlock: BlockDef = {
  type: 'FooterBlock',
  label: 'Footer',
  category: 'layout',
  icon: PanelBottom,
  defaultProps: {
    brandName: 'Brand.',
    description: 'Building the future of web design, one block at a time. Minimalist, beautiful, and functional.',
    copyright: '© 2024 Brand Inc. All rights reserved.',
    columns: [
      { id: '1', title: 'Product', links: 'Features\nIntegrations\nPricing\nChangelog' },
      { id: '2', title: 'Company', links: 'About Us\nCareers\nBlog\nContact' },
      { id: '3', title: 'Legal', links: 'Privacy Policy\nTerms of Service\nCookie Policy' },
    ]
  },
  defaultStyles: {
    padding: '4rem 2rem 2rem 2rem',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #f1f5f9',
  },
  renderComponent: ({ block, updateBlock }) => {
    const { brandName, description, copyright, columns } = block.props;

    return (
      <footer className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2 pr-8">
            <EditableText
              value={brandName}
              onChange={(val) => updateBlock(block.id, { props: { ...block.props, brandName: val } })}
              className="text-2xl font-bold text-slate-900 tracking-tight mb-4"
            />
            <EditableText
              value={description}
              onChange={(val) => updateBlock(block.id, { props: { ...block.props, description: val } })}
              className="text-sm text-slate-500 leading-relaxed max-w-sm"
            />
          </div>
          
          {columns.map((col: any, index: number) => (
            <div key={col.id}>
              <h4 className="font-semibold text-slate-900 mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.split('\n').filter((l: string) => l.trim() !== '').map((link: string, i: number) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <EditableText
            value={copyright}
            onChange={(val) => updateBlock(block.id, { props: { ...block.props, copyright: val } })}
            className="text-sm text-slate-400"
          />
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 cursor-pointer transition-colors" />
            <div className="w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 cursor-pointer transition-colors" />
            <div className="w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    const { columns } = block.props;

    const updateColumn = (index: number, key: string, value: string) => {
      const newCols = [...columns];
      newCols[index] = { ...newCols[index], [key]: value };
      updateBlock(block.id, { props: { ...block.props, columns: newCols } });
    };

    return (
      <div className="space-y-6">
        {columns.map((col: any, index: number) => (
          <div key={col.id} className="space-y-3 p-4 border rounded-lg bg-slate-50">
            <Label className="text-xs font-semibold uppercase text-slate-500">Column {index + 1}</Label>
            <div className="space-y-2">
              <Label>Title</Label>
              <input
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                value={col.title}
                onChange={(e) => updateColumn(index, 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Links (one per line)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                value={col.links}
                onChange={(e) => updateColumn(index, 'links', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  },
};
