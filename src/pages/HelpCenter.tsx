import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight, FileText, HelpCircle, Ticket, Phone, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Public Help Center — Turis Agências
// Rota sugerida: /[org_slug]/ajuda
// ---------------------------------------------------------------------------

const SUPPORT_CATEGORIES = [
  { key: 'pagamentos', label: 'Pagamentos', icon: '💳' },
  { key: 'embarque', label: 'Embarque', icon: '✈️' },
  { key: 'contratos', label: 'Contratos', icon: '📋' },
  { key: 'politicas', label: 'Políticas', icon: '📜' },
  { key: 'pre-embarque', label: 'Pré-Embarque', icon: '🧳' },
  { key: 'documentos', label: 'Documentos', icon: '🪪' },
];

export default function HelpCenter() {
  const { org_slug } = useParams<{ org_slug: string }>();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [view, setView] = useState<'home' | 'article' | 'ticket'>('home');
  const [ticketForm, setTicketForm] = useState({
    name: '', email: '', phone: '', subject: '', description: '', category: 'geral'
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');
  const db = supabase as any;

  // Buscar org_id pelo slug
  const { data: org } = useQuery({
    queryKey: ['help-center-org', org_slug],
    queryFn: async () => {
      if (!org_slug) return null;
      const { data } = await db.from('organizations').select('id, name, logo_url').eq('slug', org_slug).maybeSingle();
      return data;
    },
    enabled: !!org_slug,
  });

  // Artigos publicados
  const { data: articles = [] } = useQuery({
    queryKey: ['help-articles', org?.id, selectedCategory, search],
    queryFn: async () => {
      let query = db.from('support_articles')
        .select('id, title, slug, summary, category, views, helpful_votes')
        .eq('org_id', org?.id)
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('views', { ascending: false });

      if (selectedCategory) query = query.eq('category', selectedCategory);
      if (search) query = query.ilike('title', `%${search}%`);
      
      const { data } = await query.limit(20);
      return data || [];
    },
    enabled: !!org?.id,
  });

  // FAQs publicadas
  const { data: faqs = [] } = useQuery({
    queryKey: ['help-faqs', org?.id],
    queryFn: async () => {
      const { data } = await db.from('faq_items')
        .select('*')
        .eq('org_id', org?.id)
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('display_order');
      return data || [];
    },
    enabled: !!org?.id,
  });

  // Artigo individual
  const handleOpenArticle = async (article: any) => {
    const { data } = await db.from('support_articles')
      .select('*')
      .eq('id', article.id)
      .single();
    setSelectedArticle(data);
    setView('article');
    // Incrementar views
    await db.from('support_articles').update({ views: (data?.views ?? 0) + 1 }).eq('id', article.id);
  };

  // Votar em artigo
  const handleVote = async (articleId: string, helpful: boolean) => {
    const field = helpful ? 'helpful_votes' : 'not_helpful_votes';
    const current = selectedArticle?.[field] ?? 0;
    await db.from('support_articles').update({ [field]: current + 1 }).eq('id', articleId);
  };

  // Submeter ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org?.id) return;
    setTicketSubmitting(true);
    try {
      const { data, error } = await db.from('support_tickets').insert({
        org_id: org.id,
        requester_name: ticketForm.name,
        requester_email: ticketForm.email,
        requester_phone: ticketForm.phone || null,
        subject: ticketForm.subject,
        description: ticketForm.description,
        category: ticketForm.category,
        shadow_token: localStorage.getItem('turis_b2c_shadow_token'),
      }).select('ticket_number').single();
      if (error) throw error;
      setTicketSuccess(data.ticket_number);
    } catch (err: any) {
      alert('Erro ao abrir ticket: ' + err.message);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const agencyName = org?.name ?? 'Central de Ajuda';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="bg-zinc-900 text-white py-16 px-4 text-center">
        {org?.logo_url && (
          <img src={org.logo_url} alt={agencyName} className="h-10 w-auto object-contain mx-auto mb-6" />
        )}
        <h1 className="text-4xl font-bold mb-3">Central de Ajuda</h1>
        <p className="text-zinc-400 mb-8">Como podemos ajudar você?</p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setView('home'); setSelectedCategory(null); }}
            placeholder="Buscar artigos, perguntas, políticas..."
            className="pl-12 h-12 rounded-xl text-zinc-900 border-0 bg-white shadow-lg text-base"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Artigo individual */}
        {view === 'article' && selectedArticle && (
          <div>
            <button onClick={() => { setView('home'); setSelectedArticle(null); }} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
              ← Voltar para Central de Ajuda
            </button>
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-8">
                <Badge variant="outline" className="mb-4 text-xs">{selectedArticle.category}</Badge>
                <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>
                <div
                  className="prose prose-zinc max-w-none text-zinc-700"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
                <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center gap-4">
                  <p className="text-sm text-zinc-500">Este artigo foi útil?</p>
                  <button onClick={() => handleVote(selectedArticle.id, true)}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-vj-green transition-colors">
                    <ThumbsUp className="w-4 h-4" /> Sim ({selectedArticle.helpful_votes})
                  </button>
                  <button onClick={() => handleVote(selectedArticle.id, false)}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-500 transition-colors">
                    <ThumbsDown className="w-4 h-4" /> Não
                  </button>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <p className="text-blue-800 font-medium mb-3">Não encontrou o que precisava?</p>
              <Button onClick={() => setView('ticket')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                <Ticket className="w-4 h-4 mr-2" /> Abrir um Ticket de Suporte
              </Button>
            </div>
          </div>
        )}

        {/* Ticket Form */}
        {view === 'ticket' && (
          <div className="max-w-xl mx-auto">
            <button onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold mb-2">Abrir Ticket de Suporte</h2>
            <p className="text-zinc-500 mb-8">Nossa equipe responderá em até 24 horas.</p>

            {ticketSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-800">Ticket criado!</h3>
                <p className="text-green-700 mt-2">Número: <strong>{ticketSuccess}</strong></p>
                <p className="text-sm text-green-600 mt-2">Você receberá atualizações por e-mail.</p>
                <Button onClick={() => { setView('home'); setTicketSuccess(''); }} className="mt-6 rounded-xl">
                  Voltar ao Início
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Nome *</label>
                    <Input required value={ticketForm.name} onChange={e => setTicketForm(s => ({ ...s, name: e.target.value }))} className="border-zinc-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">E-mail *</label>
                    <Input required type="email" value={ticketForm.email} onChange={e => setTicketForm(s => ({ ...s, email: e.target.value }))} className="border-zinc-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Assunto *</label>
                  <Input required value={ticketForm.subject} onChange={e => setTicketForm(s => ({ ...s, subject: e.target.value }))} className="border-zinc-200 rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">Descrição *</label>
                  <textarea required value={ticketForm.description} onChange={e => setTicketForm(s => ({ ...s, description: e.target.value }))}
                    rows={5} className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-none" />
                </div>
                <Button type="submit" disabled={ticketSubmitting} className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-black text-white">
                  {ticketSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</> : 'Enviar Ticket'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Home */}
        {view === 'home' && (
          <div className="space-y-12">
            {/* Categorias */}
            {!search && (
              <section>
                <h2 className="text-lg font-bold mb-4">Navegar por categoria</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUPPORT_CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(prev => prev === cat.key ? null : cat.key)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                        selectedCategory === cat.key
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Artigos */}
            {articles.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {search ? `Resultados para "${search}"` : selectedCategory ? `Artigos: ${selectedCategory}` : 'Artigos em Destaque'}
                </h2>
                <div className="space-y-2">
                  {articles.map((article: any) => (
                    <button
                      key={article.id}
                      onClick={() => handleOpenArticle(article)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all text-left group"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 group-hover:text-zinc-700">{article.title}</p>
                        {article.summary && <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">{article.summary}</p>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 shrink-0 ml-4" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {faqs.length > 0 && !search && !selectedCategory && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" /> Perguntas Frequentes
                </h2>
                <div className="space-y-2">
                  {faqs.map((faq: any) => (
                    <details key={faq.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-medium text-zinc-900 hover:bg-zinc-50 transition-colors">
                        {faq.question}
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform shrink-0" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-zinc-600 border-t border-zinc-100 pt-3">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* CTA Ticket */}
            {!search && (
              <div className="bg-zinc-900 rounded-3xl p-8 text-white text-center">
                <Phone className="w-8 h-8 mx-auto mb-4 opacity-60" />
                <h3 className="text-xl font-bold mb-2">Ainda precisa de ajuda?</h3>
                <p className="text-zinc-400 mb-6">Nossa equipe está pronta para atender você.</p>
                <Button
                  onClick={() => setView('ticket')}
                  className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl h-11 px-6 font-bold"
                >
                  <Ticket className="w-4 h-4 mr-2" /> Abrir Ticket de Suporte
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
