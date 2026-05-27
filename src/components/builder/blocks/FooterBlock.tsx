import React from 'react';
import { PanelBottom } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';

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
  renderComponent: ({ node }) => {
    const { brandName, description, copyright, columns } = node.props;

    return (
      <footer className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2 pr-8">
            <EditableText
              value={brandName}
              onChange={(val) => onChange({ props: { ...node.props, brandName: val } })}
              className="text-2xl font-bold text-slate-900 tracking-tight mb-4"
            />
            <EditableText
              value={description}
              onChange={(val) => onChange({ props: { ...node.props, description: val } })}
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
            onChange={(val) => onChange({ props: { ...node.props, copyright: val } })}
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
  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-6">
        <ArrayField
          title="Colunas do Rodapé (Menus)"
          items={node.props.columns || []}
          onChange={(columns) => onChange({ props: { ...node.props, columns } })}
          defaultItem={{ title: 'Nova Coluna', links: 'Link 1\nLink 2\nLink 3' }}
          schema={[
            { key: 'title', label: 'Título da Coluna (ex: Produto, Empresa)', type: 'text' },
            { key: 'links', label: 'Links (1 por linha)', type: 'textarea' }
          ]}
        />
      </div>
    );
  },
};
