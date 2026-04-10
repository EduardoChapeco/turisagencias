import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou seu Agente Voy AI. Posso consultar a base de conhecimento interna e os guias de destino. Como posso ajudar?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Connect to the PRD required Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat-agent', {
        body: { message: input, conversation_history: messages.slice(-5) }
      });

      if (error) throw error;

      if (data?.content) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content
        }]);
      } else if (data?.error) {
         throw new Error(data.error);
      }
      
    } catch (e: any) {
      console.error(e);
      toast({
         variant: 'destructive',
         title: 'Erro de Conexão com Agente',
         description: e.message || 'Verifique se você habilitou chaves no Pool de IA das Configurações.'
      });
      setMessages(prev => [...prev, {
         id: (Date.now() + 1).toString(),
         role: 'assistant',
         content: 'Desculpe, ocorreu um erro ao contactar a inteligência. Verifique suas configurações de chaves em Settings.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4 max-w-5xl mx-auto">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2 text-primary">
            <Sparkles className="h-6 w-6 text-accent" />
            V-Agent: Squad & RAG
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conectado de forma segura aos Manuais da sua Agência e ao Edge Node.
          </p>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border/30 px-6 py-4 bg-surface/40">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
               Sessão Criptografada
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col bg-surface/20">
            <ScrollArea className="flex-1 p-6 h-full">
              <div className="space-y-6 pb-4">
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot className="h-4 w-4 text-accent" />
                      </div>
                    )}
                    <div className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[85%] shadow-sm ${
                       m.role === 'user' 
                       ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                       : 'bg-card border border-border/50 rounded-tl-sm'
                    }`}>
                      {m.content}
                    </div>
                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start opacity-70">
                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-accent animate-pulse" />
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border/50 text-sm flex gap-1.5 items-center rounded-tl-sm shadow-sm h-[52px]">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/30 bg-surface/50 backdrop-blur-sm">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 max-w-4xl mx-auto">
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Pergunte sobre um manual, guia de destino ou rota..."
                  disabled={isLoading}
                  className="rounded-full shadow-sm bg-background border-border"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="rounded-full shadow-sm shrink-0">
                  <Send className="h-4 w-4 -ml-0.5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}Layout>
  );
}
