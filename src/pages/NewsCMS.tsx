import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { 
  useNewsFeeds, useCreateUserFeed, useUpdateUserFeed, useDeleteUserFeed,
  useAllNewsCMS, useUpdateNewsArticle, useSyncRuns, useTriggerRadarSync 
} from '@/hooks/useAiRadar';
import { 
  Newspaper, Settings, RefreshCw, Rss, History, Plus, 
  Trash2, ToggleLeft, ToggleRight, Check, Eye, Edit, Save,
  X, AlertCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewsCMS() {
  const { toast } = useToast();
  const { roles } = useAuthStore();
  const isSuperAdmin = roles.includes('super_admin');

  const [activeTab, setActiveTab] = useState<'articles' | 'feeds' | 'syncs'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any | null>(null);

  // States do formulário de feed
  const [feedName, setFeedName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedRssUrl, setFeedRssUrl] = useState('');
  const [feedCategory, setFeedCategory] = useState('geral');
  const [feedActive, setFeedActive] = useState(true);

  // Queries e Mutações
  const { data: articles, isLoading: isArticlesLoading, refetch: refetchArticles } = useAllNewsCMS();
  const { data: feeds, isLoading: isFeedsLoading, refetch: refetchFeeds } = useNewsFeeds();
  const { data: syncRuns, isLoading: isSyncRunsLoading, refetch: refetchSyncs } = useSyncRuns();

  const updateArticleMut = useUpdateNewsArticle();
  const createFeedMut = useCreateUserFeed();
  const updateFeedMut = useUpdateUserFeed();
  const deleteFeedMut = useDeleteUserFeed();
  const triggerSyncMut = useTriggerRadarSync();

  // Filtragem de Artigos
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredArticles = articles?.filter(a => {
    const matchCat = catFilter === 'all' || a.ai_category === catFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchCat && matchStatus;
  });

  const handleSync = () => {
    triggerSyncMut.mutate(undefined, {
      onSuccess: (data: any) => {
        toast({
          title: data?.fallback ? 'Sync Simulado (Fallback)' : 'Sucesso!',
          description: `Sincronização processada. ${data?.processed || 0} novos artigos salvos.`,
        });
        refetchArticles();
        refetchFeeds();
        refetchSyncs();
      },
      onError: (err: any) => {
        toast({
          title: 'Falha na sincronização',
          description: err.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleSaveFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName || !feedRssUrl) {
      toast({ title: 'Campos obrigatórios', description: 'Nome e URL do feed RSS são necessários.', variant: 'destructive' });
      return;
    }

    const payload = {
      name: feedName,
      url: feedUrl || null,
      feed_url: feedRssUrl,
      category: feedCategory,
      is_active: feedActive
    };

    if (editingFeed) {
      updateFeedMut.mutate({
        id: editingFeed.id,
        updates: payload,
        scope: editingFeed.scope
      }, {
        onSuccess: () => {
          toast({ title: 'Feed atualizado!' });
          setIsFeedModalOpen(false);
          setEditingFeed(null);
          refetchFeeds();
        }
      });
    } else {
      createFeedMut.mutate(payload, {
        onSuccess: () => {
          toast({ title: 'Novo feed cadastrado!' });
          setIsFeedModalOpen(false);
          refetchFeeds();
        }
      });
    }
  };

  const handleEditFeedClick = (feed: any) => {
    setEditingFeed(feed);
    setFeedName(feed.name);
    setFeedUrl(feed.url || '');
    setFeedRssUrl(feed.feed_url);
    setFeedCategory(feed.category);
    setFeedActive(feed.is_active);
    setIsFeedModalOpen(true);
  };

  const handleDeleteFeedClick = (id: string, scope: 'master' | 'user') => {
    if (confirm('Tem certeza que deseja excluir esta fonte de feed?')) {
      deleteFeedMut.mutate({ id, scope }, {
        onSuccess: () => {
          toast({ title: 'Feed excluído com sucesso.' });
          refetchFeeds();
        }
      });
    }
  };

  const handleToggleFeedActive = (feed: any) => {
    updateFeedMut.mutate({
      id: feed.id,
      scope: feed.scope,
      updates: { is_active: !feed.is_active }
    }, {
      onSuccess: () => {
        toast({ title: `Feed ${!feed.is_active ? 'ativado' : 'desativado'}.` });
        refetchFeeds();
      }
    });
  };

  const handleSaveArticleEdits = (articleId: string, updates: any) => {
    updateArticleMut.mutate({
      id: articleId,
      updates
    }, {
      onSuccess: (data: any) => {
        toast({ title: 'Artigo atualizado!' });
        setSelectedArticle(data);
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-zinc-100 pb-4">
          <div>
            <p className="text-xs font-bold text-vj-txt3 uppercase tracking-[0.25em] mb-1">Conteúdo & Marketing</p>
            <h1 className="text-2xl font-black text-vj-txt tracking-tight leading-none flex items-center gap-2">
              <Settings className="w-6 h-6 text-vj-green" /> CMS de Notícias
            </h1>
            <p className="text-sm text-vj-txt3 font-medium mt-1">
              Curadoria de artigos enriquecidos por inteligência artificial e gerenciamento de canais RSS.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingFeed(null);
                setFeedName('');
                setFeedUrl('');
                setFeedRssUrl('');
                setFeedCategory('geral');
                setFeedActive(true);
                setIsFeedModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Feed
            </Button>
            <Button 
              className="bg-vj-green text-white hover:bg-vj-green/90" 
              onClick={handleSync}
              disabled={triggerSyncMut.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${triggerSyncMut.isPending ? 'animate-spin' : ''}`} />
              Sincronizar Fontes
            </Button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 border-b border-zinc-100 pb-2">
          <Button
            variant={activeTab === 'articles' ? 'default' : 'ghost'}
            className="rounded-xl h-9"
            onClick={() => setActiveTab('articles')}
          >
            <Newspaper className="w-4 h-4 mr-2" /> Artigos Coletados
          </Button>
          <Button
            variant={activeTab === 'feeds' ? 'default' : 'ghost'}
            className="rounded-xl h-9"
            onClick={() => setActiveTab('feeds')}
          >
            <Rss className="w-4 h-4 mr-2" /> Canais RSS
          </Button>
          <Button
            variant={activeTab === 'syncs' ? 'default' : 'ghost'}
            className="rounded-xl h-9"
            onClick={() => setActiveTab('syncs')}
          >
            <History className="w-4 h-4 mr-2" /> Histórico de Sync
          </Button>
        </div>

        {/* 1. ARTIGOS COLETADOS TAB */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex items-center gap-4 flex-wrap bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">Filtrar Categoria:</span>
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="w-[180px] bg-white h-9 rounded-lg">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="turismo">Turismo</SelectItem>
                    <SelectItem value="aviacao">Aviação</SelectItem>
                    <SelectItem value="hotelaria">Hotelaria</SelectItem>
                    <SelectItem value="cruzeiros">Cruzeiros</SelectItem>
                    <SelectItem value="vistos">Vistos</SelectItem>
                    <SelectItem value="economia">Economia</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-white h-9 rounded-lg">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Listagem */}
            <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
              {isArticlesLoading ? (
                <div className="p-8 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !filteredArticles || filteredArticles.length === 0 ? (
                <div className="py-20 text-center text-zinc-500">
                  <Newspaper className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum artigo localizado com os filtros selecionados.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="p-4">Título / Fonte</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4 text-center">Relevância</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Coletado em</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors text-sm">
                        <td className="p-4">
                          <p className="font-bold text-zinc-950 line-clamp-1">{art.title}</p>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">{art.source_name} · Scope: {art.source_scope}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize text-xs font-semibold">{art.ai_category || 'geral'}</Badge>
                        </td>
                        <td className="p-4 text-center font-black">
                          {art.ai_relevance_score || 50}%
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={`font-semibold capitalize text-[10px] ${
                            art.status === 'published' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' :
                            art.status === 'archived' ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-100' :
                            'bg-amber-50 text-amber-700 hover:bg-amber-50'
                          }`}>
                            {art.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-zinc-500">
                          {new Date(art.fetched_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-zinc-600 hover:text-vj-green"
                              onClick={() => setSelectedArticle(art)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 2. CANAIS RSS TAB */}
        {activeTab === 'feeds' && (
          <div className="space-y-4">
            <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
              {isFeedsLoading ? (
                <div className="p-8 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !feeds || feeds.length === 0 ? (
                <div className="py-20 text-center text-zinc-500">
                  <Rss className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum canal de feed cadastrado ainda.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="p-4">Nome da Fonte</th>
                      <th className="p-4">URL Feed</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Última leitura</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeds.map((feed) => (
                      <tr key={feed.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors text-sm">
                        <td className="p-4">
                          <p className="font-bold text-zinc-950">{feed.name}</p>
                          <span className="text-[10px] text-zinc-400 font-mono">{feed.url || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-mono text-xs text-zinc-600 line-clamp-1 max-w-[300px]">
                          {feed.feed_url}
                        </td>
                        <td className="p-4 capitalize font-semibold">
                          {feed.category}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={`font-bold capitalize text-[10px] ${
                            feed.scope === 'master' ? 'border-indigo-200 text-indigo-700 bg-indigo-50/30' : 'border-zinc-200 text-zinc-700'
                          }`}>
                            {feed.scope}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleToggleFeedActive(feed)} className="focus:outline-none">
                            {feed.is_active ? (
                              <ToggleRight className="w-6 h-6 text-vj-green" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-zinc-300" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-xs text-zinc-500">
                          {feed.last_fetched_at ? new Date(feed.last_fetched_at).toLocaleDateString('pt-BR') : 'Nunca'}
                          {feed.last_error && (
                            <span className="block text-[10px] text-rose-500 font-medium truncate max-w-[150px]" title={feed.last_error}>
                              ⚠️ {feed.last_error}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-zinc-600"
                              onClick={() => handleEditFeedClick(feed)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Só permite deletar feeds locais da agência, exceto super_admins que deletam todos */}
                            {(feed.scope === 'user' || isSuperAdmin) && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => handleDeleteFeedClick(feed.id, feed.scope)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 3. HISTÓRICO DE SYNCS TAB */}
        {activeTab === 'syncs' && (
          <div className="space-y-4">
            <div className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
              {isSyncRunsLoading ? (
                <div className="p-8 space-y-3">
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !syncRuns || syncRuns.length === 0 ? (
                <div className="py-20 text-center text-zinc-500">
                  <History className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum histórico de execução de sincronização encontrado.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="p-4">ID / Início</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Fontes</th>
                      <th className="p-4 text-center">Coletados</th>
                      <th className="p-4 text-center">Novos</th>
                      <th className="p-4 text-center">Duplicados</th>
                      <th className="p-4 text-center">Falhas</th>
                      <th className="p-4">Duração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncRuns.map((run) => {
                      const start = new Date(run.started_at);
                      const end = run.finished_at ? new Date(run.finished_at) : null;
                      const duration = end ? `${((end.getTime() - start.getTime()) / 1000).toFixed(1)}s` : '—';

                      return (
                        <tr key={run.id} className="border-b border-zinc-100 text-sm">
                          <td className="p-4">
                            <p className="font-bold text-zinc-950">{start.toLocaleString('pt-BR')}</p>
                            <span className="text-[10px] font-mono text-zinc-400">Trigger: {run.triggered_by}</span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={`font-semibold capitalize text-[10px] ${
                              run.status === 'success' ? 'bg-emerald-50 text-emerald-700' :
                              run.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                              run.status === 'running' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {run.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-center font-semibold">{run.total_feeds}</td>
                          <td className="p-4 text-center font-semibold text-indigo-600">{run.total_fetched}</td>
                          <td className="p-4 text-center font-semibold text-emerald-600">{run.total_new}</td>
                          <td className="p-4 text-center font-semibold text-zinc-500">{run.total_duplicates}</td>
                          <td className="p-4 text-center font-semibold text-rose-600">{run.total_failed}</td>
                          <td className="p-4 text-xs font-mono text-zinc-500">{duration}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── SIDEPANEL DE DETALHES DO ARTIGO ── */}
        {selectedArticle && (
          <Sheet open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-black text-zinc-950">Curadoria de Artigo</SheetTitle>
                <SheetDescription>
                  Ajuste o insight da agência e configure a publicação da notícia no radar.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Informações originais */}
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-2">
                  <h4 className="font-bold text-sm text-zinc-950">{selectedArticle.title}</h4>
                  <p className="text-xs text-zinc-500">Fonte original: <span className="font-semibold text-zinc-800">{selectedArticle.source_name}</span></p>
                  <a 
                    href={selectedArticle.original_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-vj-green font-bold flex items-center gap-1 hover:underline"
                  >
                    Abrir link da matéria original <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Form de edição */}
                <div className="space-y-4">
                  {/* Status do Artigo */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Status de Publicação</span>
                    <Select 
                      value={selectedArticle.status} 
                      onValueChange={(val) => handleSaveArticleEdits(selectedArticle.id, { status: val })}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Publicado (Visível no Radar)</SelectItem>
                        <SelectItem value="draft">Rascunho (Privado)</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Categoria Reclassificada</span>
                    <Select 
                      value={selectedArticle.ai_category || 'geral'} 
                      onValueChange={(val) => handleSaveArticleEdits(selectedArticle.id, { ai_category: val })}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="turismo">Turismo</SelectItem>
                        <SelectItem value="aviacao">Aviação</SelectItem>
                        <SelectItem value="hotelaria">Hotelaria</SelectItem>
                        <SelectItem value="cruzeiros">Cruzeiros</SelectItem>
                        <SelectItem value="vistos">Vistos</SelectItem>
                        <SelectItem value="economia">Economia</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resumo curto da IA */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Resumo Curto (IA)</span>
                    <Textarea
                      defaultValue={selectedArticle.ai_short_summary || ''}
                      rows={2}
                      className="resize-none"
                      onBlur={(e) => handleSaveArticleEdits(selectedArticle.id, { ai_short_summary: e.target.value })}
                    />
                  </div>

                  {/* Resumo completo da IA */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Resumo Completo (IA)</span>
                    <Textarea
                      defaultValue={selectedArticle.ai_summary || ''}
                      rows={4}
                      className="resize-none text-sm"
                      onBlur={(e) => handleSaveArticleEdits(selectedArticle.id, { ai_summary: e.target.value })}
                    />
                  </div>

                  {/* Insight da Agência */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Insight Comercial Sugerido
                    </span>
                    <Textarea
                      defaultValue={selectedArticle.ai_travel_agency_insight || ''}
                      rows={3}
                      className="border-emerald-200 focus-visible:ring-emerald-500 text-sm"
                      onBlur={(e) => handleSaveArticleEdits(selectedArticle.id, { ai_travel_agency_insight: e.target.value })}
                    />
                  </div>

                  {/* Ação Recomendada */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-600 uppercase">Ação Comercial Recomendada</span>
                    <Textarea
                      defaultValue={selectedArticle.ai_recommended_action || ''}
                      rows={2}
                      className="border-blue-200 focus-visible:ring-blue-500 text-sm"
                      onBlur={(e) => handleSaveArticleEdits(selectedArticle.id, { ai_recommended_action: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setSelectedArticle(null)} className="w-full bg-zinc-950 text-white">
                    Fechar Curadoria
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* ── MODAL CADASTRO / EDIÇÃO DE FEED ── */}
        {isFeedModalOpen && (
          <Sheet open={isFeedModalOpen} onOpenChange={(o) => { if(!o) setIsFeedModalOpen(false); }}>
            <SheetContent className="bg-white p-6 w-full sm:max-w-md">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-lg font-black text-zinc-950">
                  {editingFeed ? 'Editar Canal RSS' : 'Cadastrar Canal RSS'}
                </SheetTitle>
                <SheetDescription>
                  Insira os dados do feed RSS para sincronização e inteligência de curadoria do Radar.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSaveFeed} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Nome do Canal *</span>
                  <Input 
                    value={feedName} 
                    onChange={e => setFeedName(e.target.value)} 
                    placeholder="Ex: Panrotas Aviação" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase">URL Principal</span>
                  <Input 
                    value={feedUrl} 
                    onChange={e => setFeedUrl(e.target.value)} 
                    placeholder="Ex: https://www.panrotas.com.br" 
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase">URL do Feed RSS *</span>
                  <Input 
                    value={feedRssUrl} 
                    onChange={e => setFeedRssUrl(e.target.value)} 
                    placeholder="Ex: https://www.panrotas.com.br/rss.xml" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Categoria Padrão</span>
                  <Select value={feedCategory} onValueChange={setFeedCategory}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turismo">Turismo</SelectItem>
                      <SelectItem value="aviacao">Aviação</SelectItem>
                      <SelectItem value="hotelaria">Hotelaria</SelectItem>
                      <SelectItem value="cruzeiros">Cruzeiros</SelectItem>
                      <SelectItem value="vistos">Vistos</SelectItem>
                      <SelectItem value="economia">Economia</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="geral">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-zinc-100">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Canal Ativo</span>
                  <button type="button" onClick={() => setFeedActive(!feedActive)} className="focus:outline-none">
                    {feedActive ? (
                      <ToggleRight className="w-6 h-6 text-vj-green" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-zinc-300" />
                    )}
                  </button>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFeedModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-vj-green text-white hover:bg-vj-green/90">
                    Salvar
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </AppLayout>
  );
}
