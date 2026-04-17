import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot, User, Send, Sparkles, Plus, MessageSquare,
  Archive, ChevronRight, Loader2, Brain, Zap, Clock,
  MessageCircle, Trash2, Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import {
  useChatSessions, useChatSession,
  useCreateChatSession, useAppendMessage, useArchiveChatSession,
  type ChatMessage,
} from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  { icon: '✈️', label: 'Roteiro 7 dias', prompt: 'Monte um roteiro de 7 dias para Maldivas para um casal em lua de mel com budget alto.' },
  { icon: '💰', label: 'Calcular markup', prompt: 'Como calcular o markup correto para uma cotação de hotel com tarifa net de R$5.000?' },
  { icon: '📋', label: 'Política de cancel.', prompt: 'Quais são as políticas de cancelamento mais comuns das operadoras para Caribe?' },
  { icon: '🧳', label: 'Documentos viagem', prompt: 'Quais documentos um brasileiro precisa para viajar à Europa sem visto?' },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function MessageBubble({ msg, isLast }: { msg: ChatMessage; isLast: boolean }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} ${isLast ? 'animate-in slide-in-from-bottom-2 duration-300' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-vj-green/10 border border-vj-green/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-vj-green" />
        </div>
      )}
      <div className={cn(
        'rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[82%] shadow-sm',
        isUser
          ? 'bg-vj-green text-white rounded-tr-sm'
          : 'bg-white border border-zinc-100 rounded-tl-sm text-zinc-800'
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <p className={cn('text-[9px] mt-1.5 text-right', isUser ? 'text-white/50' : 'text-zinc-400')}>
          {formatTime(msg.created_at)}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-zinc-500" />
        </div>
      )}
    </div>
  );
}

export default function AIChat() {
  const { toast } = useToast();
  const { organization } = useAuthStore();

  const { data: sessions } = useChatSessions();
  const createSession = useCreateChatSession();
  const appendMessage = useAppendMessage();
  const archiveSession = useArchiveChatSession();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { data: activeSession } = useChatSession(activeSessionId);

  // Mensagens locais sincronizadas com a sessão ativa
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionSearch, setSessionSearch] = useState('');

  // Filtra sessões pelo campo de busca (client-side)
  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions ?? [];
    const q = sessionSearch.toLowerCase();
    return (sessions ?? []).filter(s => {
      const titleMatch = (s.title ?? '').toLowerCase().includes(q);
      const msgs = s.messages ?? [];
      const lastMsg = msgs[msgs.length - 1];
      const msgMatch = lastMsg ? lastMsg.content.toLowerCase().includes(q) : false;
      return titleMatch || msgMatch;
    });
  }, [sessions, sessionSearch]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar mensagens locais quando a sessão muda
  useEffect(() => {
    if (activeSession) {
      setLocalMessages(activeSession.messages ?? []);
    }
  }, [activeSession?.id, activeSession?.messages]);

  // Auto scroll para o fim
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // Atualização otimista
    const updatedMessages = [...localMessages, userMsg];
    setLocalMessages(updatedMessages);

    try {
      // Garantir que existe uma sessão ativa
      let sessionId = activeSessionId;
      let sessionTitle: string | undefined;

      if (!sessionId) {
        // Criar nova sessão automaticamente
        const newSession = await createSession.mutateAsync({
          title: content.slice(0, 50),
          initialMessage: userMsg,
        });
        sessionId = newSession.id;
        setActiveSessionId(sessionId);
      }

      // Chamar o agente IA
      const { data, error } = await supabase.functions.invoke('ai-chat-agent', {
        body: {
          message: content,
          conversation_history: updatedMessages.slice(-8).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.content ?? 'Não consegui gerar uma resposta. Verifique as configurações de IA.',
        created_at: new Date().toISOString(),
      };

      const fullMessages = [...updatedMessages, assistantMsg];
      setLocalMessages(fullMessages);

      // Gera título automático na primeira resposta
      if (updatedMessages.length === 1) {
        sessionTitle = content.slice(0, 60);
      }

      // Persistir no banco
      await appendMessage.mutateAsync({
        sessionId: sessionId!,
        messages: fullMessages,
        title: sessionTitle,
      });

    } catch (e: any) {
      const err = e?.message ?? 'Erro ao contactar o agente.';
      toast({
        variant: 'destructive',
        title: 'Erro no Agente IA',
        description: err,
      });
      const errMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Verifique o Pool de IA nas Configurações.',
        created_at: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, localMessages, activeSessionId, createSession, appendMessage, toast]);

  const handleNewSession = () => {
    setActiveSessionId(null);
    setLocalMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmptyState = localMessages.length === 0;
  const lastSessionDate = (s: any) => s.updated_at ? formatDate(s.updated_at) : '';
  const lastMessage = (s: any) => {
    const msgs = s.messages ?? [];
    const last = msgs[msgs.length - 1];
    return last ? last.content.slice(0, 60) : 'Sem mensagens';
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-5rem)] max-w-[1400px] mx-auto gap-0 overflow-hidden rounded-[28px] border border-zinc-200 shadow-xl bg-white">

        {/* ── SIDEBAR DE SESSÕES ── */}
        <div className={cn(
          'flex flex-col border-r border-zinc-100 bg-zinc-50 transition-all duration-300 flex-shrink-0',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        )}>
          {/* Header Sidebar */}
          <div className="p-4 border-b border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-vj-green/10 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-vj-green" />
                </div>
                <span className="text-sm font-bold text-zinc-700">Turis AI</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <Button
              onClick={handleNewSession}
              className="w-full h-9 text-xs font-bold rounded-xl bg-vj-green text-white hover:bg-vj-green/90 gap-2 mb-3"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Conversa
            </Button>
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Buscar conversas..."
                className="h-8 text-xs pl-8 pr-3 rounded-lg border-zinc-200 bg-white"
                value={sessionSearch}
                onChange={e => setSessionSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de sessões */}
          <ScrollArea className="flex-1 px-2 py-2">
            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Nenhuma conversa encontrada</p>
              </div>
            )}
            <div className="space-y-1">
              {filteredSessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSession(s.id!)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-all group',
                    activeSessionId === s.id
                      ? 'bg-vj-green/10 border border-vj-green/20'
                      : 'hover:bg-white hover:shadow-sm border border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className={cn('text-xs font-semibold truncate flex-1', activeSessionId === s.id ? 'text-vj-green' : 'text-zinc-700')}>
                      {s.title ?? 'Conversa'}
                    </p>
                    <span className="text-[9px] text-zinc-400 flex-shrink-0 mt-0.5">{lastSessionDate(s)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{lastMessage(s)}</p>
                  <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-zinc-400 hover:text-red-400"
                      onClick={e => { e.stopPropagation(); archiveSession.mutate(s.id!); }}
                    >
                      <Archive className="w-3 h-3" />
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Footer com stats */}
          <div className="p-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <Zap className="w-3 h-3 text-vj-green" />
              <span>RAG ativo · {sessions?.length ?? 0} sessões</span>
            </div>
          </div>
        </div>

        {/* ── ÁREA DE CHAT ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-700"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <Sparkles className="w-4 h-4 text-vj-green" />
              <h1 className="text-sm font-bold text-zinc-700">
                {activeSession?.title ?? 'Turis AI Agent'}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Agente RAG ativo</span>
            </div>
          </div>

          {/* Mensagens */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-zinc-50/30">
            {isEmptyState ? (
              /* Empty State Premium */
              <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-[28px] bg-vj-green/10 flex items-center justify-center mb-4 border border-vj-green/20">
                  <Sparkles className="w-7 h-7 text-vj-green" />
                </div>
                <h2 className="text-xl font-bold text-zinc-800 mb-2">Turis AI Agent</h2>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                  Sou seu assistente especializado em viagens. Tenho acesso à base de conhecimento da sua agência, políticas de operadoras e guias de destino via RAG.
                </p>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.prompt)}
                      className="p-4 rounded-2xl bg-white border border-zinc-200 text-left hover:border-vj-green/30 hover:bg-vj-green/5 transition-all group"
                    >
                      <span className="text-lg">{qp.icon}</span>
                      <p className="text-xs font-bold text-zinc-700 mt-2 group-hover:text-vj-green transition-colors">{qp.label}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5 line-clamp-2">{qp.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {localMessages.map((msg, i) => (
                  <MessageBubble key={msg.id} msg={msg} isLast={i === localMessages.length - 1} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-vj-green/10 border border-vj-green/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-vj-green animate-pulse" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white border border-zinc-100 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-100 bg-white">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre roteiros, políticas, destinos..."
                disabled={isLoading}
                className="rounded-2xl border-zinc-200 bg-zinc-50 focus-visible:ring-vj-green/30 h-11"
              />
              <Button
                onClick={() => sendMessage()}
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 rounded-2xl bg-vj-green hover:bg-vj-green/90 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[9px] text-zinc-400 text-center mt-2">
              As conversas são salvas automaticamente no servidor · RAG com base de conhecimento da agência
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
