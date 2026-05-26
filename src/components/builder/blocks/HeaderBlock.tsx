import React from 'react';
import { PanelTop, Menu } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';

export const HeaderBlock: BlockDef = {
  type: 'HeaderBlock',
  label: 'Header',
  category: 'layout',
  icon: PanelTop,
  defaultProps: {
    logoText: 'Brand.',
    links: 'Home\nFeatures\nAbout\nContact',
    buttonText: 'Get Started',
  },
  defaultStyles: {
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
  },
  renderComponent: ({ block, updateBlock }) => {
    const { logoText, links, buttonText } = block.props;
    const navLinks = links.split('\n').filter((l: string) => l.trim() !== '');

    return (
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none -mt-0.5">B</span>
          </div>
          <EditableText
            value={logoText}
            onChange={(val) => updateBlock(block.id, { props: { ...block.props, logoText: val } })}
            className="text-xl font-bold text-slate-900 tracking-tight"
          />
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link: string, i: number) => (
            <a key={i} href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              {link}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Log in
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors">
            {buttonText}
          </button>
        </div>

        <button className="md:hidden text-slate-900 p-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>
    );
  },
  settingsComponent: ({ block, updateBlock }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Navigation Links (one per line)</Label>
          <textarea
            className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={block.props.links}
            onChange={(e) => updateBlock(block.id, { props: { ...block.props, links: e.target.value } })}
          />
        </div>
      </div>
    );
  },
};
