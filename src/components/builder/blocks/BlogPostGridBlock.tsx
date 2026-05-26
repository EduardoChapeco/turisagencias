import React from 'react';
import { BlockDef } from '../core/types';
import { Grid } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const BlogPostGridBlock: BlockDef = {
  type: 'blog-post-grid',
  label: 'Blog Post Grid',
  category: 'blog',
  icon: Grid,
  
  defaultProps: {
    sectionTitle: 'Últimas Publicações',
    posts: [
      {
        id: '1',
        title: 'Como arrumar sua mala',
        category: 'Dicas',
        imageUrl: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=400',
      },
      {
        id: '2',
        title: 'Roteiro de 3 dias em Paris',
        category: 'Roteiros',
        imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=400',
      },
      {
        id: '3',
        title: 'Seguro viagem é necessário?',
        category: 'Informativo',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400',
      }
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-12',
    paddingBottom: 'pb-12',
  },

  renderComponent: ({ node }) => {
    const { sectionTitle, posts } = node.props;
    const { paddingTop, paddingBottom } = node.styles;
    
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(posts || []).map((post: any) => (
              <div key={post.id} className="flex flex-col group cursor-pointer">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-zinc-100">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <span className="text-xs font-bold text-vj-green uppercase mb-2">{post.category}</span>
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors leading-tight">
                  {post.title}
                </h3>
              </div>
            ))}
          </div>
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
        <p className="text-xs text-zinc-400 mt-4">Para editar os posts, você deve alterar no código da plataforma por enquanto.</p>
      </div>
    );
  }
};
