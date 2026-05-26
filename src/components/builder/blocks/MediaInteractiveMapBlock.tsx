import React from 'react';
import { BlockDef } from '../core/types';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const MediaInteractiveMapBlock: BlockDef = {
  type: 'media-interactive-map',
  label: 'Mapa Interativo',
  category: 'media',
  icon: MapPin,
  
  defaultProps: {
    title: 'Nossa Localização',
    subtitle: 'Venha nos visitar ou explore os destinos no mapa abaixo.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.19736166547!2d-46.66164938440661!3d-23.56134888468249!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1689100000000!5m2!1spt-BR!2sbr',
    height: '400px'
  },
  
  defaultStyles: {
    paddingTop: 'py-16',
    paddingBottom: 'pb-16',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, mapUrl, height } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h2"
            className="text-3xl md:text-5xl font-black tracking-tight mb-4"
          />
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            as="p"
            className="text-lg opacity-80 max-w-2xl mb-12"
          />
          
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/20" style={{ height: height || '400px' }}>
            {mapUrl ? (
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Interactive Map"
              ></iframe>
            ) : (
              <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                URL do mapa não configurada
              </div>
            )}
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
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Google Maps Embed URL</Label>
          <Input 
            value={node.props.mapUrl || ''} 
            onChange={e => onChange({ props: { ...node.props, mapUrl: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-[10px] text-zinc-500">Copie o link de incorporação (iframe src) do Google Maps.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Altura do Mapa</Label>
          <Input 
            value={node.props.height || ''} 
            onChange={e => onChange({ props: { ...node.props, height: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
            placeholder="Ex: 400px ou 50vh"
          />
        </div>
      </div>
    );
  }
};
