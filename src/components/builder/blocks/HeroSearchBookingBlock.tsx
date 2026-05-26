import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Search, Calendar, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const HeroSearchBookingBlock: BlockDef = {
  type: 'hero-search-booking',
  label: 'Hero com Busca',
  category: 'hero',
  icon: LayoutTemplate,
  
  defaultProps: {
    title: 'Para onde você quer ir?',
    subtitle: 'Pesquise entre milhares de roteiros e encontre sua viagem ideal',
    backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop',
  },
  
  defaultStyles: {
    paddingTop: 'py-0',
    paddingBottom: 'pb-0',
    backgroundColor: 'bg-black',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, backgroundImage } = node.props;
    const { paddingTop, paddingBottom, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${textColor} relative overflow-hidden min-h-[70vh] flex items-center justify-center`}>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black/50 z-0" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-12">
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h1"
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight w-full drop-shadow-md"
          />
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            as="p"
            className="text-lg md:text-xl font-medium opacity-90 mb-12 w-full drop-shadow-sm"
          />
          
          <div className="w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full flex items-center bg-zinc-100 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-zinc-400 mr-3" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Destino</span>
                <input 
                  type="text" 
                  placeholder="Qualquer lugar" 
                  className="bg-transparent border-none p-0 text-sm font-semibold text-zinc-900 focus:ring-0 outline-none w-full"
                  readOnly
                />
              </div>
            </div>
            
            <div className="flex-1 w-full flex items-center bg-zinc-100 rounded-xl px-4 py-3">
              <Calendar className="w-5 h-5 text-zinc-400 mr-3" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Data</span>
                <input 
                  type="text" 
                  placeholder="Qualquer data" 
                  className="bg-transparent border-none p-0 text-sm font-semibold text-zinc-900 focus:ring-0 outline-none w-full"
                  readOnly
                />
              </div>
            </div>

            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 flex items-center justify-center font-bold transition-colors">
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </button>
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
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
          <Input 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Imagem de Fundo</Label>
          <Input 
            value={node.props.backgroundImage || ''} 
            onChange={e => onChange({ props: { ...node.props, backgroundImage: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
      </div>
    );
  }
};
