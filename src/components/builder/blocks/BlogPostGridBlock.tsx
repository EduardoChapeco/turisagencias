import React from 'react';
import { BlockDef } from '../core/types';
import { Grid, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const BlogPostGridBlock: BlockDef = {
 type: 'blog-post-grid',
 label: 'Blog Post Grid',
 category: 'blog',
 icon: Grid,
 
 defaultProps: {
 sectionTitle: 'Últimas Publicações',
 postCount: 3
 },
 
 defaultStyles: {
 paddingTop: 'py-12',
 paddingBottom: 'pb-12',
 },

 renderComponent: ({ node }) => {
 const { sectionTitle, postCount } = node.props;
 const { paddingTop, paddingBottom } = node.styles;
 
 const { data: posts, isLoading } = useQuery({
 queryKey: ['blog-posts', postCount],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('news_article_versions')
 .select('id, title, image_url, ai_category, created_at')
 .eq('status', 'published')
 .order('created_at', { ascending: false })
 .limit(postCount || 3);
 
 if (error) throw error;
 return data || [];
 }
 });
 
 return (
 <div className={`${paddingTop} ${paddingBottom} px-6 w-full flex flex-col items-center`}>
 <div className="w-full max-w-5xl">
 <EditableText
 nodeId={node.id}
 propKey="sectionTitle"
 value={sectionTitle}
 as="h2"
 className="text-2xl font-bold text-zinc-900 mb-8"
 />
 
 {isLoading ? (
 <div className="flex justify-center py-12">
 <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {(posts || []).map((post: any) => (
 <div key={post.id} className="flex flex-col group cursor-pointer">
 <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-zinc-100 relative">
 {post.image_url ? (
 <img 
 src={post.image_url} 
 alt={post.title} 
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
 />
 ) : (
 <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
 <Grid className="w-8 h-8 text-zinc-400" />
 </div>
 )}
 </div>
 <span className="text-xs font-bold text-vj-green uppercase mb-2">{post.ai_category || 'Artigo'}</span>
 <h3 className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-tight">
 {post.title}
 </h3>
 </div>
 ))}
 {posts?.length === 0 && (
 <div className="col-span-3 text-center py-8 text-zinc-500 text-sm">
 Nenhum artigo publicado encontrado no momento.
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título da Seção</Label>
 <Input 
 value={node.props.sectionTitle || ''} 
 onChange={e => onChange({ props: { ...node.props, sectionTitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Quantidade de Posts</Label>
 <Input 
 type="number"
 min="1"
 max="12"
 value={node.props.postCount || 3} 
 onChange={e => onChange({ props: { ...node.props, postCount: parseInt(e.target.value) || 3 } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <p className="text-xs text-zinc-400 mt-4">Os posts são carregados dinamicamente da tabela de artigos de notícias.</p>
 </div>
 );
 }
};
