import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditableText } from '../core/EditableText';

export const HeroVideoBackgroundBlock: BlockDef = {
  type: 'hero-video-background',
  label: 'Hero com Vídeo',
  category: 'hero',
  icon: LayoutTemplate,
  
  defaultProps: {
    title: 'Sinta a Emoção',
    subtitle: 'Viva momentos que ficarão para sempre na memória.',
    buttonText: 'Ver Roteiros',
    videoUrl: 'https://cdn.pixabay.com/vimeo/328224523/natureza-22879.mp4?width=1280&hash=8cb1a2e2f693ccb3e7100b2184cf4324f4afdb13',
  },
  
  defaultStyles: {
    paddingTop: 'py-0',
    paddingBottom: 'pb-0',
    backgroundColor: 'bg-black',
    textColor: 'text-white',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle, buttonText, videoUrl } = node.props;
    const { paddingTop, paddingBottom, textColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${textColor} relative overflow-hidden min-h-[80vh] flex items-center justify-center`}>
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
            src={videoUrl}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <EditableText
            nodeId={node.id}
            propKey="title"
            value={title}
            as="h1"
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight w-full drop-shadow-lg"
          />
          <EditableText
            nodeId={node.id}
            propKey="subtitle"
            value={subtitle}
            as="p"
            className="text-lg md:text-2xl font-light opacity-90 max-w-2xl mb-10 leading-relaxed w-full drop-shadow-md"
          />
          {buttonText && (
            <EditableText
              nodeId={node.id}
              propKey="buttonText"
              value={buttonText}
              as="button"
              className="px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.3)] text-lg"
            />
          )}
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
          <Textarea 
            value={node.props.subtitle || ''} 
            onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão</Label>
          <Input 
            value={node.props.buttonText || ''} 
            onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
            className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase text-zinc-500 font-bold">URL do Vídeo (MP4)</Label>
          <div className="flex gap-2">
            <Input 
              value={node.props.videoUrl || ''} 
              onChange={e => onChange({ props: { ...node.props, videoUrl: e.target.value } })}
              className="bg-zinc-900 border-zinc-800 text-white text-sm h-9 flex-1"
            />
            <div className="w-9 h-9 bg-zinc-800 rounded flex items-center justify-center">
              <Video className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }
};
