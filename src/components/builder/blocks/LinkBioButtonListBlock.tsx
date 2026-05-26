import React from 'react';
import { BlockDef } from '../core/types';
import { List } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const LinkBioButtonListBlock: BlockDef = {
  type: 'linkbio-button-list',
  label: 'LinkBio Button List',
  category: 'linkbio',
  icon: List,
  
  defaultProps: {
    buttons: [
      { id: '1', text: 'Nosso Site Oficial', url: '#' },
      { id: '2', text: 'Pacotes em Promoção', url: '#' },
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-4',
    paddingBottom: 'pb-4',
  },

  renderComponent: ({ node }) => {
    const { buttons } = node.props;
    const { paddingTop, paddingBottom } = node.styles;
    
    return (
      <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
        <div className="w-full max-w-md flex flex-col gap-3">
          {(buttons || []).map((btn: any) => (
            <a key={btn.id} href={btn.url} className="block w-full">
              <div className="w-full p-4 bg-white border border-zinc-200 text-zinc-900 font-medium rounded-xl hover:bg-zinc-50 transition-colors text-center shadow-sm">
                {btn.text}
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <p className="text-xs text-zinc-400">Para simplificar, edite os botões abaixo (separados por vírgula):</p>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Textos dos Botões (separado por vírgula)</Label>
          <Input 
            value={(node.props.buttons || []).map((b: any) => b.text).join(', ')} 
            onChange={e => {
              const texts = e.target.value.split(',').map((t: string) => t.trim());
              const newButtons = texts.map((t: string, i: number) => ({
                id: String(i + 1),
                text: t || `Botão ${i + 1}`,
                url: '#'
              }));
              onChange({ props: { ...node.props, buttons: newButtons } });
            }}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
