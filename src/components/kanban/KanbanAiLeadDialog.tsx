import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useCreateKanbanCard } from '@/hooks/useKanbanBoards';

export function KanbanAiLeadDialog({ boardId, defaultColumnId }: { boardId?: string; defaultColumnId?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const { organization, user } = useAuthStore();
  const { toast } = useToast();
  const createCard = useCreateKanbanCard();

  const handleExtract = async () => {
    if (!text.trim() || !boardId || !defaultColumnId) return;
    
    setIsExtracting(true);
    try {
      const payload = {
        text,
        org_id: organization?.id,
        user_id: user?.id,
      };

      const { data, error } = await supabase.functions.invoke('interpret-request', {
        body: payload
      });

      if (error) throw new Error(error.message);
      
      const parsedData = data?.analysis || data;

      // Ensure creation of Card in default column
      createCard.mutate({
        board_id: boardId,
        column_id: defaultColumnId,
        title: parsedData.suggested_title || `Lead IA: ${parsedData.destination || 'Indefinido'}`,
        description: parsedData.raw_intent_summary || 'Extraído via WhatsApp/Texto.',
        estimated_value: parsedData.budget_hint === 'luxury' ? 15000 : parsedData.budget_hint === 'high' ? 10000 : null,
      }, {
        onSuccess: () => {
          toast({
            title: 'Lead Mágica Criada',
            description: 'Agent 0 processou o texto e criou o cartão de prospecção!',
          });
          setOpen(false);
          setText('');
        }
      });

    } catch (e: any) {
      toast({
        title: 'Erro no Agent 0',
        description: e.message || 'Falha ao interpretar lead.',
        variant: 'destructive'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <>
      <Button 
        size="sm" 
        onClick={() => setOpen(true)}
        className="premium-button bg-violet-600 hover:bg-violet-700 text-white shadow-none font-bold rounded-full px-6"
      >
        <Sparkles className="w-4 h-4 mr-2 text-violet-200" /> Lead Rápida IA
      </Button>

      <SheetPage
        open={open}
        onClose={() => setOpen(false)}
        title="Assistente de Leads (Agente 0)"
        subtitle="Cole o texto do cliente, WhatsApp ou e-mail abaixo. A Inteligência vai estruturá-lo."
        icon={Bot}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button 
              className="premium-button bg-gradient-to-r from-violet-600 to-indigo-600 border-none rounded-full px-8 font-bold"
              disabled={!text.trim() || isExtracting || !boardId || !defaultColumnId}
              onClick={handleExtract}
            >
              {isExtracting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando...</> : 'Criar Card Agora'}
            </Button>
          </div>
        }
      >
        {() => (
          <div className="space-y-4">
             <Textarea 
              placeholder="Ex: Oi, queria ver opções para Disney no natal, somos 2 adultos e 2 crianças (3 e 5 anos). Queria gastar pouco..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[300px] resize-none bg-zinc-50 border-violet-100 focus-visible:ring-violet-500 text-sm rounded-2xl p-4"
              autoFocus
            />
            <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50 flex items-start gap-3">
              <Bot className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-violet-700 leading-relaxed">
                O Agente 0 analisa o contexto da conversa, extrai destinos, orçamentos, passageiros e datas, criando automaticamente um card estruturado no seu funil de vendas.
              </p>
            </div>
          </div>
        )}
      </SheetPage>
    </>
  );
}
