import React from 'react';
import { MediaPicker } from '../MediaPicker';
import { BlockDef } from '../core/types';
import { BookOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const BlogFeaturedPostBlock: BlockDef = {
 type: 'blog-featured-post',
 label: 'Featured Blog Post',
 category: 'blog',
 icon: BookOpen,
 
 defaultProps: {
 title: 'As 10 Melhores Praias do Nordeste para Visitar em 2026',
 excerpt: 'Descubra paraísos escondidos e destinos imperdíveis para suas próximas férias. Areia branca, água cristalina e muita cultura local.',
 imageUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=800',
 category: 'Destinos',
 readTime: '5 min',
 },
 
 defaultStyles: {
 paddingTop: 'py-12',
 paddingBottom: 'pb-12',
 },

 renderComponent: ({ node }) => {
 const { title, excerpt, imageUrl, category, readTime } = node.props;
 const { paddingTop, paddingBottom } = node.styles;
 
 return (
 <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex justify-center`}>
 <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 bg-white rounded-2xl overflow-hidden border border-zinc-100 group hover: transition-shadow">
 <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden">
 <img 
 src={imageUrl} 
 alt={title} 
 className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
 />
 </div>
 <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
 <div className="flex items-center gap-3 mb-4">
 <span className="px-3 py-1 bg-zinc-100 text-zinc-800 text-xs font-bold rounded-full">{category}</span>
 <span className="text-zinc-500 text-xs font-medium">{readTime} de leitura</span>
 </div>
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 leading-tight"
 />
 <EditableText
 nodeId={node.id}
 propKey="excerpt"
 value={excerpt}
 as="p"
 className="text-zinc-600 mb-6 line-clamp-3"
 />
 <button className="self-start text-sm font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1 hover:text-zinc-600 hover:border-zinc-600 transition-colors">
 Ler artigo completo
 </button>
 </div>
 </div>
 </div>
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
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Resumo</Label>
 <Input 
 value={node.props.excerpt || ''} 
 onChange={e => onChange({ props: { ...node.props, excerpt: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <MediaPicker label="URL da Imagem" value={node.props.imageUrl || ''} onChange={url => onChange({ props: { ...node.props, imageUrl: url } })} />
 </div>
 </div>
 );
 }
};
