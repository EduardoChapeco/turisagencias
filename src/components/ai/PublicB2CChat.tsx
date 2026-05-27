import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { SHADOW_TOKEN_KEY } from '@/hooks/useB2CTracker';

interface PublicB2CChatProps {
  orgId: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function PublicB2CChat({ orgId }: PublicB2CChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    // Let the tracking queue know the chat was opened
    const token = localStorage.getItem(SHADOW_TOKEN_KEY);
    if (token) {
      supabase.from('b2c_tracking_events').insert({
        shadow_id: token,
        org_id: orgId,
        event_type: 'chat_open',
        page_url: window.location.href,
        page_title: document.title
      }).then();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const shadowToken = localStorage.getItem(SHADOW_TOKEN_KEY);
      
      const res = await supabase.functions.invoke('ai-chat-agent', {
        body: {
          orgId,
          shadowToken,
          message: userMessage,
          history: messages
        }
      });

      if (res.error) throw res.error;

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, estou com problemas técnicos no momento.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-zinc-950 hover:bg-zinc-800 text-white transition-all duration-300 z-50 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-zinc-950 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistente Inteligente</h3>
                <p className="text-[10px] text-zinc-400">Respondemos em instantes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
            {messages.length === 0 && (
              <div className="text-center text-xs text-zinc-500 my-8">
                Olá! Como posso ajudar você a planejar sua próxima viagem?
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-zinc-950 text-white rounded-tr-sm' 
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                  <span className="text-xs text-zinc-500">Digitando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 text-sm bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 transition-all"
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
