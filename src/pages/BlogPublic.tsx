import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Calendar, Tag, ChevronRight, BookOpen } from 'lucide-react';

// ---------------------------------------------------------------------------
// Public Blog Page — Turis Agências
// Rota: /[org_slug]/blog
// ---------------------------------------------------------------------------

export default function BlogPublic() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const db = supabase as any;

  // Detectar org_slug da URL (assume que pathname é /[slug]/blog)
  const orgSlug = window.location.pathname.split('/')[1];

  const { data: org } = useQuery({
    queryKey: ['blog-org', orgSlug],
    queryFn: async () => {
      const { data } = await db.from('organizations').select('id, name, logo_url').eq('slug', orgSlug).maybeSingle();
      return data;
    },
    enabled: !!orgSlug,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-public', org?.id, search, selectedCategory],
    queryFn: async () => {
      let query = db.from('blog_posts')
        .select('id, title, slug, summary, cover_image_url, category, tags, published_at, views')
        .eq('org_id', org?.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (search) query = query.ilike('title', `%${search}%`);
      if (selectedCategory) query = query.eq('category', selectedCategory);

      const { data } = await query.limit(30);
      return data || [];
    },
    enabled: !!org?.id,
  });

  // Categorias únicas dos posts
  const categories = [...new Set(posts.map((p: any) => p.category).filter(Boolean))];

  const openPost = async (post: any) => {
    const { data } = await db.from('blog_posts')
      .select('*')
      .eq('id', post.id)
      .single();
    setSelectedPost(data);
    // Incrementar views
    await db.from('blog_posts').update({ views: (data?.views ?? 0) + 1 }).eq('id', post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero com capa */}
        {selectedPost.cover_image_url && (
          <div className="h-72 md:h-96 overflow-hidden">
            <img
              src={selectedPost.cover_image_url}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-10">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-sm text-zinc-500 hover:text-zinc-900 mb-6 flex items-center gap-1 transition-colors"
          >
            ← Voltar ao Blog
          </button>

          {selectedPost.category && (
            <Badge variant="outline" className="mb-4 text-xs">{selectedPost.category}</Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 leading-tight">
            {selectedPost.title}
          </h1>
          {selectedPost.summary && (
            <p className="text-xl text-zinc-500 mb-6 leading-relaxed">{selectedPost.summary}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-zinc-400 mb-8 pb-8 border-b border-zinc-100">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {selectedPost.published_at
                ? format(new Date(selectedPost.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                : ''}
            </span>
          </div>

          {/* Conteúdo do post */}
          <div
            className="prose prose-zinc max-w-none text-zinc-700"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />

          {/* Tags */}
          {selectedPost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-100">
              {selectedPost.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* CTA */}
          {selectedPost.cta_text && selectedPost.cta_url && (
            <div className="mt-10 bg-zinc-900 rounded-2xl p-8 text-center text-white">
              <a
                href={selectedPost.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-zinc-900 font-bold rounded-xl px-6 py-3 hover:bg-zinc-100 transition-colors"
              >
                {selectedPost.cta_text}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-zinc-900 text-white py-14 px-4 text-center">
        {org?.logo_url && (
          <img src={org.logo_url} alt={org.name} className="h-10 w-auto object-contain mx-auto mb-6" />
        )}
        <h1 className="text-4xl font-bold mb-3">Blog & Inspirações</h1>
        <p className="text-zinc-400 mb-8">Dicas, destinos e novidades de viagem</p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar posts..."
            className="pl-12 h-12 rounded-xl text-zinc-900 border-0 bg-white shadow-lg"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Filtros de categoria */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                !selectedCategory ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedCategory === cat ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid de posts */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-zinc-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-zinc-200 rounded w-1/4" />
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-zinc-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum post encontrado</p>
            {search && <p className="text-sm mt-2">Tente buscar por outro termo</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Card
                key={post.id}
                className="border-zinc-200 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                onClick={() => openPost(post)}
              >
                {post.cover_image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-zinc-600" />
                  </div>
                )}
                <CardContent className="p-5">
                  {post.category && (
                    <Badge variant="secondary" className="mb-2 text-[10px]">{post.category}</Badge>
                  )}
                  <h3 className="font-bold text-zinc-900 mb-1 line-clamp-2 group-hover:text-zinc-700 transition-colors">
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{post.summary}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{post.published_at ? format(new Date(post.published_at), 'd MMM yyyy', { locale: ptBR }) : ''}</span>
                    <span className="flex items-center gap-1 group-hover:text-zinc-600 transition-colors">
                      Ler mais <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
