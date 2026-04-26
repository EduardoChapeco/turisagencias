import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, User, Send, Sparkles, Plus, Search, BrainCircuit, ShieldCheck, Activity,
  Cpu, Terminal, Command, Filter, Loader2, Zap, X, ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  useChatSessions, useChatSession, 
  useCreateChatSession, useAppendMessage, 
  type ChatMessage,
} from '@/hooks/useChatSessions';
import { cn } from '@/lib/utils';
import { SquadConsole, type SquadMessage } from '@/components/SquadConsole';

const QUICK_PROMPTS = [
  { icon: <Cpu className="w-5 h-5" />, label: 'Analisar Mercado', prompt: 'Turis Intel, qual a tendência atual para resorts no Nordeste para o próximo semestre?' },
  { icon: <Zap className="w-5 h-5" />, label: 'Otimizar Roteiro', prompt: 'Tenho uma proposta para Dubai. Como posso deixá-la mais competitiva?' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Auditoria V4', prompt: 'Revise os termos de cancelamento deste grupo para garantir conformidade.' },
  { icon: <BrainCircuit className="w-5 h-5" />, label: 'Estratégia Sales', prompt: 'Gere um pitch de vendas persuasivo para Maldivas focado em luxo.' },
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      {!isUser && (
        <div className="w-11 h-11 rounded-[20px] bg-vj-bg-dark border border-white/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-5 w-5 text-vj-green" />
        </div>
      )}
      <div className={cn(
        'relative rounded-[2rem] px-8 py-5 text-sm leading-relaxed max-w-[80%] border',
        isUser
          ? 'bg-vj-green text-white border-transparent font-medium'
          : 'bg-white border-vj-border text-vj-txt '
      )}>
        <p className="whitespace-pre-wrap">{msg.content}</p>
        <div className={cn('flex items-center gap-2 mt-4 opacity-40 text-[8px] font-black uppercase tracking-[0.2em]', isUser ? 'text-white' : 'text-vj-txt3')}>
          <span>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && <span>· NEXUS CORE v4.1</span>}
        </div>
      </div>
      {isUser && (
        <div className="w-11 h-11 rounded-[20px] bg-white border border-vj-border flex items-center justify-center shrink-0 mt-1">
          <User className="h-5 w-5 text-vj-txt3" />
        </div>
      )}
    </div>
  );
}

export default function AIChat() {
  const { toast } = useToast();
  const { data: sessions } = useChatSessions();
  const createSession = useCreateChatSession();
  const appendMessage = useAppendMessage();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { data: activeSession } = useChatSession(activeSessionId);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [squadMessages, setSquadMessages] = useState<SquadMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSearch, setSessionSearch] = useState('');
  const [showConsole, setShowConsole] = useState(true);

  const filteredSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions ?? [];
    const q = sessionSearch.toLowerCase();
    return (sessions ?? []).filter(s => (s.title ?? '').toLowerCase().includes(q));
  }, [sessions, sessionSearch]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSession) setLocalMessages(activeSession.messages ?? []);
  }, [activeSession?.id, activeSession?.messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [localMessages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput('');
    setIsLoading(true);

    // Inicia debate visual
    setSquadMessages([]);
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content, created_at: new Date().toISOString() };
    const updatedMessages = [...localMessages, userMsg];
    setLocalMessages(updatedMessages);

    try {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const newSession = await createSession.mutateAsync({ title: content.slice(0, 50), initialMessage: userMsg });
        sessionId = newSession.id;
        setActiveSessionId(sessionId);
      }

      const user = useAuthStore.getState().user;
      const pythonEngineUrl = import.meta.env.VITE_PYTHON_ENGINE_URL || 'http://localhost:8000';
      const res = await fetch(`${pythonEngineUrl}/api/v1/quotation/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: content,
          org_id: user?.organization_id || 'default_org'
        }),
      });

      if (!res.ok) {
         throw new Error('Falha de conexão com o Motor OMEGA v5. Certifique-se que o motor Python está rodando.');
      }

      const data = await res.json();
      
      if (data.debate_log && data.debate_log.length > 0) {
        setSquadMessages(data.debate_log.map((log: any) => ({
           agent: log.agent || log.agent_name || 'Agent',
           text: log.text || log.message || log.content || '',
           sentiment: log.sentiment || 'neutral'
        })));
      }

      const assistantContent = typeof data.decision === 'string' && data.decision.trim() !== ''
        ? data.decision 
        : (data.decision?.executive_summary || data.decision?.recommendation || 'Análise OMEGA concluída. Nenhum sumário retornado pelo motor.');

      const assistantMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: assistantContent, 
        created_at: new Date().toISOString() 
      };
      const fullMessages = [...updatedMessages, assistantMsg];
      setLocalMessages(fullMessages);
      await appendMessage.mutateAsync({ sessionId: sessionId!, messages: fullMessages, title: updatedMessages.length === 1 ? content.slice(0, 60) : undefined });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Falha na Matriz', description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, localMessages, activeSessionId, createSession, appendMessage, toast]);

  return (
    <AppLayout fullHeight>
      <div className="flex h-full gap-8 overflow-hidden no-scrollbar">
        
        {/* 🧠 PREMIUM SIDEBAR - SHADOWLESS */}
        <div className="w-80 flex flex-col gap-6 shrink-0 h-full">
          <div className="flex-1 bento-card p-6 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-vj-txt">Memória Neural</span>
               <Button onClick={() => {setActiveSessionId(null); setLocalMessages([]); setSquadMessages([]);}} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-zinc-50">
                 <Plus className="w-5 h-5" />
               </Button>
            </div>

            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-vj-txt3" />
              <Input 
                placeholder="Escanear logs..." 
                className="h-12 bg-zinc-50 border-vj-border rounded-2xl pl-12 text-xs font-bold"
                value={sessionSearch}
                onChange={e => setSessionSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 no-scrollbar">
               <div className="space-y-2 py-2">
                 {filteredSessions.map(s => (
                   <button
                     key={s.id}
                     onClick={() => setActiveSessionId(s.id!)}
                     className={cn(
                       'w-full text-left p-4 rounded-2xl transition-all duration-300 group',
                       activeSessionId === s.id ? 'bg-vj-bg-dark text-white' : 'hover:bg-zinc-50 text-vj-txt'
                     )}
                   >
                     <p className="text-xs font-black truncate">{s.title || 'Fluxo de Pensamento'}</p>
                     <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                       {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : 'Agora'}
                     </p>
                   </button>
                 ))}
               </div>
            </ScrollArea>
          </div>

          <div className="bento-card bg-vj-bg-dark p-6 border-zinc-800 hidden lg:block">
             <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6">Squads Ativos</h4>
             <div className="space-y-4">
                {['TURIS CORE', 'ATLAS (Flights)', 'KRONOS (LTM)'].map(name => (
                  <div key={name} className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-zinc-400">{name}</span>
                     <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-vj-green animate-pulse" />
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 🚀 MAIN CONTENT AREA */}
        <div className="flex-1 flex gap-8 h-full min-w-0">
          
          {/* 💬 CHAT INTERFACE */}
          <div className="flex-1 flex flex-col h-full bento-card overflow-hidden min-w-0">
            <div className="flex items-center justify-between px-10 py-6 border-b border-vj-border bg-white/50 backdrop-blur-md shrink-0">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-vj-bg-dark flex items-center justify-center border border-white/10">
                     <BrainCircuit className="w-6 h-6 text-vj-green" />
                  </div>
                  <div>
                     <h2 className="text-base font-black text-vj-txt tracking-tighter uppercase leading-none">Turis Intel Lab</h2>
                     <p className="text-[9px] font-black text-vj-txt3 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-vj-green" /> Quantum Encryption Active
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    className={cn("h-11 px-4 rounded-xl hover:bg-zinc-100 text-[9px] font-black uppercase tracking-widest", showConsole ? "text-vj-green bg-vj-green/5" : "text-vj-txt3")}
                    onClick={() => setShowConsole(!showConsole)}
                  >
                    <Terminal className="w-4 h-4 mr-2" /> {showConsole ? 'Ocultar War Room' : 'Mostrar War Room'}
                  </Button>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar">
              {localMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-12">
                   <div className="space-y-4">
                      <div className="h-20 w-20 rounded-[28px] bg-vj-bg-dark flex items-center justify-center mx-auto border border-white/10">
                         <Sparkles className="w-8 h-8 text-vj-green animate-pulse" />
                      </div>
                      <h3 className="text-4xl font-black text-vj-txt tracking-tighter uppercase">Inicie o Processamento</h3>
                      <p className="text-xs text-vj-txt3 font-bold max-w-sm mx-auto">O Turis Squad está em standby. Selecione um protocolo ou envie suas diretrizes.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 w-full">
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(qp.prompt)}
                          className="p-6 rounded-[2rem] bg-zinc-50 border border-vj-border hover:border-vj-green hover:bg-white transition-all text-left group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-white border border-vj-border flex items-center justify-center mb-4 group-hover:bg-vj-green group-hover:text-white transition-all">
                             {qp.icon}
                          </div>
                          <p className="text-[10px] font-black text-vj-txt uppercase tracking-widest mb-1">{qp.label}</p>
                        </button>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-10">
                  {localMessages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-vj-border bg-zinc-50/50">
               <div className="max-w-3xl mx-auto relative group">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Enviar diretrizes para o Turis Intel Lab..."
                    disabled={isLoading}
                    className="h-16 rounded-2xl border-vj-border bg-white pl-8 pr-20 text-sm font-bold  focus-visible:ring-vj-green/20 transition-all"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-vj-green hover:bg-vj-green/90  p-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
                  </Button>
               </div>
            </div>
          </div>

          {/* ⚔️ SQUAD WAR ROOM (CONSOLE) */}
          {showConsole && (
            <div className="hidden xl:block w-[38vw] max-w-[420px] shrink-0 h-full animate-in slide-in-from-right-8 duration-700">
               <SquadConsole 
                  messages={squadMessages} 
                  isThinking={isLoading} 
               />
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
