import { useState } from 'react';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="premium-button bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-900/20">
          <Sparkles className="w-4 h-4 mr-2 text-violet-200" /> Lead Rápida IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 border-violet-100/50 bg-white shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-800 font-heading">
            <Bot className="w-5 h-5 text-violet-500" /> Assistente de Leads (Agente 0)
          </DialogTitle>
          <DialogDescription>
            Cole o texto do cliente, WhatsApp ou e-mail abaixo. A Inteligência vai estruturá-lo e adicionar ao Kanban.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <Textarea 
            placeholder="Ex: Oi, queria ver opções para Disney no natal, somos 2 adultos e 2 crianças (3 e 5 anos). Queria gastar pouco..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] resize-none bg-zinc-50 border-violet-100 focus-visible:ring-violet-500 text-sm"
          />
          <Button 
            className="w-full premium-button bg-gradient-to-r from-violet-600 to-indigo-600 border-none shadow-xl shadow-indigo-900/20"
            disabled={!text.trim() || isExtracting || !boardId || !defaultColumnId}
            onClick={handleExtract}
          >
            {isExtracting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Intenção...</> : 'Criar Card Automaticamente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
