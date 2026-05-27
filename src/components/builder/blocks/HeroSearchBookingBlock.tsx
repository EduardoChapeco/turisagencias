import React, { useState } from 'react';
import { LayoutTemplate, Search, Calendar, MapPin } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const HeroSearchBookingBlock: BlockDef = {
  type: 'HeroSearchBookingBlock',
  label: 'Hero com Busca',
  category: 'hero',
  icon: LayoutTemplate,
  
  defaultProps: {
    title: 'Para onde você quer ir?',
    subtitle: 'Pesquise entre milhares de roteiros e encontre sua viagem ideal',
    backgroundImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop',
    whatsappNumber: '',
  },
  
  defaultStyles: {
    paddingTop: 'pt-0',
    paddingBottom: 'pb-0',
    backgroundColor: 'bg-black',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, backgroundImage, whatsappNumber } = node.props;
    const { paddingTop, paddingBottom, textColor } = node.styles || {};
    
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!destination) return;
      
      const text = `Olá! Gostaria de viajar para ${destination}${date ? ` na data ${date}` : ''}. Podem me ajudar com roteiros?`;
      const url = whatsappNumber 
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;
        
      window.open(url, '_blank');
    };
    
    return (
      <section className={`${paddingTop || ''} ${paddingBottom || ''} ${textColor || ''} relative overflow-hidden min-h-[70vh] flex items-center justify-center`}>
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
            className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight w-full drop-shadow-md block"
          />
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            className="text-lg md:text-xl font-medium opacity-90 mb-12 w-full drop-shadow-sm block"
          />
          
          <form onSubmit={handleSearch} className="w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full flex items-center bg-zinc-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-vj-green transition-colors">
              <MapPin className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Destino</span>
                <input 
                  type="text" 
                  required
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Ex: Paris, Maldivas..." 
                  className="bg-transparent border-none p-0 text-sm font-semibold text-zinc-900 focus:ring-0 outline-none w-full"
                />
              </div>
            </div>
            
            <div className="flex-1 w-full flex items-center bg-zinc-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-vj-green transition-colors">
              <Calendar className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Data Prevista</span>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="bg-transparent border-none p-0 text-sm font-semibold text-zinc-900 focus:ring-0 outline-none w-full"
                />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto bg-vj-green hover:bg-emerald-600 text-white rounded-xl px-8 py-4 flex items-center justify-center font-bold transition-colors shadow-lg">
              <Search className="w-5 h-5 mr-2 shrink-0" />
              Buscar
            </button>
          </form>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase text-zinc-500 font-bold">Imagem de Fundo (URL)</Label>
          <Input 
            value={node.props.backgroundImage || ''} 
            onChange={e => onChange({ props: { ...node.props, backgroundImage: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase text-zinc-500 font-bold">WhatsApp Agência</Label>
          <Input 
            value={node.props.whatsappNumber || ''} 
            onChange={e => onChange({ props: { ...node.props, whatsappNumber: e.target.value } })}
            placeholder="Ex: 5511999999999"
            className="bg-zinc-900 border-zinc-800 text-white text-sm"
          />
        </div>
      </div>
    );
  }
};
