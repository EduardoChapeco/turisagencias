import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ type: string; id: string }>;
}

interface PublicAiChatProps {
  orgSlug: string;
  orgId: string;
  agencyName?: string;
  agencyColor?: string;
}

export function PublicAiChat({ orgSlug, orgId, agencyName = 'Assistente', agencyColor = '#16a34a' }: PublicAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Olá! Sou o assistente virtual da ${agencyName}. Como posso ajudar?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const key = `turis_chat_session_${orgSlug}`;
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const newId = uuidv4();
    sessionStorage.setItem(key, newId);
    return newId;
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('public-ai-chat', {
        body: {
          message: text,
          org_id: orgId,
          session_id: sessionId,
          shadow_token: localStorage.getItem('turis_b2c_shadow_token'),
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data?.response ?? 'Ocorreu um erro. Tente novamente.',
        sources: data?.sources ?? []
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, não consegui processar sua mensagem. Tente novamente ou entre em contato pelo WhatsApp.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="w-[370px] max-h-[580px] flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white shrink-0"
            style={{ background: agencyColor }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">{agencyName}</p>
                <p className="text-[10px] text-white/70 mt-0.5">Assistente Virtual • Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-zinc-900 text-white rounded-br-sm'
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                  {msg.sources && msg.sources.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-1.5 border-t border-zinc-100 pt-1.5">
                      Baseado em {msg.sources.length} fonte(s) interna(s)
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-100 bg-white shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1 border-zinc-200 rounded-xl text-sm h-10"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 rounded-xl text-white shrink-0"
                style={{ background: agencyColor }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[9px] text-zinc-400 text-center mt-2">
              IA contextual • Responde com base em conteúdo aprovado
            </p>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: agencyColor, boxShadow: `0 4px 20px ${agencyColor}60` }}
        aria-label="Chat com assistente"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
