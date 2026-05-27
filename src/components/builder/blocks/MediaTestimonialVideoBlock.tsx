import React from 'react';
import { Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const MediaTestimonialVideoBlock = {
 type: 'media_testimonial_video',
 category: 'media',
 label: 'Testimonial Video',
 icon: Video,
 defaultProps: {
 videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
 title: 'Client Testimonial'
 },
 defaultStyles: {
 padding: '24px 0',
 backgroundColor: 'transparent'
 },
 renderComponent: ({ node }) => {
 const { videoUrl = '', title = '' } = node.props || {};

 return (
 <div style={node.styles} className="w-full flex justify-center">
 {!videoUrl ? (
 <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full max-w-3xl min-h-[300px]">
 <div className="text-center text-gray-500">
 <Video className="mx-auto h-12 w-12 mb-2 opacity-50" />
 <p>Cole a URL do Vídeo no painel de configurações</p>
 </div>
 </div>
 ) : (
 <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-gray-100 bg-black relative">
 <iframe 
 src={videoUrl.includes('youtube.com/watch?v=') ? videoUrl.replace('watch?v=', 'embed/') : videoUrl} 
 title={title || "Video player"} 
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
 allowFullScreen
 className="w-full h-full absolute inset-0"
 />
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="p-4 space-y-4">
 <div className="space-y-2">
 <Label>URL do Vídeo (YouTube Embed, Vimeo, etc)</Label>
 <Input 
 value={node.props?.videoUrl || ''}
 onChange={(e) => onChange({ props: { ...node.props, videoUrl: e.target.value } })}
 placeholder="https://www.youtube.com/embed/..."
 />
 </div>
 <div className="space-y-2">
 <Label>Título / Descrição</Label>
 <Input 
 value={node.props?.title || ''}
 onChange={(e) => onChange({ props: { ...node.props, title: e.target.value } })}
 placeholder="Ex: Depoimento da Família Silva"
 />
 </div>
 </div>
 );
 }
};
