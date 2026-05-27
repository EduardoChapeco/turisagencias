import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RoleGuard } from '@/components/RoleGuard';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookOpen, Plus, Search, Edit, Trash2, Eye, PenTool } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogAdmin() {
  const { organization, user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('posts');

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-blog-posts', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('org_id', organization?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id,
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Post excluído com sucesso.');
      refetch();
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message);
    }
  };

  const handlePublish = async (post: any) => {
    try {
      const { error } = await supabase.from('blog_posts').update({
        status: 'published',
        approved_by: user?.id,
        published_at: new Date().toISOString()
      }).eq('id', post.id);
      
      if (error) throw error;
      toast.success('Post publicado com sucesso!');
      refetch();
    } catch (e: any) {
      toast.error('Erro ao publicar: ' + e.message);
    }
  };

  const filteredPosts = posts.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <RoleGuard allow={['org_admin', 'super_admin', 'agent']}>
      <AppLayout>
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <PageHeader
              title="Gestão de Blog & Inspirações"
              description="Gerencie os posts, artigos e conteúdos da agência."
              icon={BookOpen}
            />
            <Button className="bg-vj-green hover:bg-vj-green/90 text-white rounded-xl h-10 font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="posts">Todos os Posts</TabsTrigger>
              <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
              <TabsTrigger value="ai_drafts">Sugeridos pela IA</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              <Card className="shadow-none border-vj-border">
                <CardHeader className="border-b border-vj-border bg-zinc-50/50 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold">Artigos Publicados e em Revisão</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar posts..."
                      className="pl-9 h-9 border-zinc-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-50">
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post: any) => (
                        <TableRow key={post.id} className="hover:bg-zinc-50/50">
                          <TableCell className="font-medium text-zinc-900 max-w-[300px] truncate">
                            {post.title}
                            {post.ai_generated && (
                              <Badge variant="outline" className="ml-2 text-[9px] border-blue-200 text-blue-600 bg-blue-50">IA</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {post.category ? <Badge variant="secondary" className="font-normal">{post.category}</Badge> : '-'}
                          </TableCell>
                          <TableCell>
                            {post.status === 'published' ? (
                              <Badge variant="outline" className="text-vj-green border-green-200 bg-green-50">Publicado</Badge>
                            ) : post.status === 'pending_review' ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Revisão</Badge>
                            ) : (
                              <Badge variant="outline" className="text-zinc-500 border-zinc-200 bg-zinc-50">Rascunho</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-zinc-500">{post.views || 0}</TableCell>
                          <TableCell className="text-zinc-500 text-sm">
                            {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {post.status !== 'published' && (
                                <Button size="sm" variant="outline" onClick={() => handlePublish(post)} className="h-8 text-xs font-bold text-vj-green border-green-200 hover:bg-green-50">
                                  Aprovar
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-red-600" onClick={() => handleDelete(post.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPosts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                            {isLoading ? 'Carregando...' : 'Nenhum post encontrado.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="drafts">
              <Card className="p-12 text-center border-dashed text-zinc-500">
                <PenTool className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Módulo de edição em construção.</p>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai_drafts">
               <Card className="p-12 text-center border-dashed text-blue-500 bg-blue-50/30 border-blue-200">
                <p className="font-bold mb-2">Monitoramento de Notícias via IA</p>
                <p className="text-sm">A IA buscará feeds de turismo e criará rascunhos para sua aprovação. (Em breve)</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
