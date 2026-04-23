import { useState } from 'react';
import { useTicket, useUpdateTicket, useCreateTicketMessage } from '@/hooks/useTickets';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { 
  LifeBuoy, Clock, AlertCircle, CheckCircle2, 
  User, Calendar, Tag, Send, MessageSquare, 
  Trash2, MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  open:        { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: AlertCircle,  label: 'Aberto' },
  in_progress: { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200', icon: Clock,        label: 'Em Andamento' },
  resolved:    { color: 'text-green-700',  bg: 'bg-green-50 border-green-200', icon: CheckCircle2, label: 'Resolvido' },
  closed:      { color: 'text-zinc-500',   bg: 'bg-zinc-100 border-zinc-200',  icon: CheckCircle2, label: 'Fechado' },
};

export function TicketDetailSheet({ id, open, onClose }: { id: string | null; open: boolean; onClose: () => void }) {
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const createMessage = useCreateTicketMessage();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');

  const messages = ticket?.ticket_messages || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return;
    await createMessage.mutateAsync({ ticket_id: id, content: newMessage.trim() });
    setNewMessage('');
    // If ticket is open, move to in_progress automatically when agent replies
    if (ticket?.status === 'open') {
        await updateTicket.mutateAsync({ id, status: 'in_progress' });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    await updateTicket.mutateAsync({ id, status: newStatus });
  };

  const SECTIONS = [
    { id: 'timeline', label: 'Linha do Tempo', icon: MessageSquare },
    { id: 'info', label: 'Informações', icon: Tag },
  ];

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={ticket?.title || 'Detalhes do Protocolo'}
      subtitle={ticket ? `Ref: #${ticket.id.slice(0, 8).toUpperCase()}` : 'Carregando...'}
      icon={LifeBuoy}
      sections={SECTIONS}
      defaultSection="timeline"
      footer={
        <div className="flex items-center gap-3 w-full justify-between">
          <div className="flex gap-2">
            {ticket?.status !== 'resolved' && ticket?.status !== 'closed' && (
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-green-600 hover:bg-green-50 border-green-200"
                    onClick={() => handleStatusChange('resolved')}
                >
                    <CheckCircle2 size={14} className="mr-2" /> Resolver Protocolo
                </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      }
    >
      {(activeSection) => {
        if (isLoading) return <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>;
        if (!ticket) return <p>Protocolo não encontrado.</p>;

        const statusConf = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.closed;
        const StatusIcon = statusConf.icon;

        return (
          <>
            {activeSection === 'timeline' && (
              <div className="flex flex-col h-full space-y-6">
                {/* Internal Card Status */}
                <div className={cn("p-4 rounded-2xl border flex items-center justify-between", statusConf.bg)}>
                    <div className="flex items-center gap-3">
                        <StatusIcon className={cn("h-5 w-5", statusConf.color)} />
                        <div>
                            <p className={cn("text-sm font-bold", statusConf.color)}>{statusConf.label}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Status Atual</p>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        {['open', 'in_progress', 'resolved', 'closed'].filter(s => s !== ticket.status).map(s => (
                            <Button 
                                key={s} 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] h-7 px-2 uppercase font-bold"
                                onClick={() => handleStatusChange(s)}
                            >
                                {STATUS_CONFIG[s].label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Description Header */}
                <div className="p-5 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                            {ticket.clients?.name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-800">{ticket.clients?.name || 'Cliente Externo'}</p>
                            <p className="text-[10px] text-zinc-400">{new Date(ticket.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">{ticket.description || 'Sem descrição adicional.'}</p>
                </div>

                {/* Messages List */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <MessageSquare size={14} /> Histórico de Interações
                    </h3>
                    
                    {!messages?.length ? (
                        <div className="text-center py-10 border-2 border-dashed border-zinc-100 rounded-2xl">
                            <p className="text-xs text-zinc-400">Nenhuma interação registrada ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => {
                                const isAgent = !!msg.agent_id;
                                return (
                                    <div key={msg.id} className={cn(
                                        "flex gap-3",
                                        isAgent ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={cn(
                                            "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm border",
                                            isAgent ? "bg-vj-green text-white border-vj-green" : "bg-white text-zinc-800 border-zinc-100"
                                        )}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                                            <div className={cn(
                                                "mt-2 text-[10px] font-medium opacity-60",
                                                isAgent ? "text-white" : "text-zinc-400"
                                            )}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isAgent && " • Agente"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Reply Box */}
                <div className="sticky bottom-0 pt-4 bg-white/80 backdrop-blur-sm">
                    <div className="relative group">
                        <Textarea 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Escrever resposta interna ou nota..."
                            className="pr-12 rounded-2xl border-zinc-200 focus:border-vj-green resize-none min-h-[100px]"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendMessage();
                            }}
                        />
                        <Button 
                            size="icon" 
                            className="absolute bottom-3 right-3 rounded-xl h-8 w-8 bg-vj-green"
                            disabled={!newMessage.trim() || createMessage.isPending}
                            onClick={handleSendMessage}
                        >
                            <Send size={14} />
                        </Button>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-2 text-center">Ctrl + Enter para enviar</p>
                </div>
              </div>
            )}

            {activeSection === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Prioridade</p>
                        <p className="font-bold text-zinc-800 flex items-center gap-2">
                            <Tag size={14} className="text-vj-green" /> {ticket.priority.toUpperCase()}
                        </p>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">SLA Deadline</p>
                        <p className="font-bold text-zinc-800 flex items-center gap-2">
                            <Clock size={14} className="text-vj-green" /> {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString() : 'Não definido'}
                        </p>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Responsável</p>
                        <p className="font-bold text-zinc-800 flex items-center gap-2">
                            <User size={14} className="text-vj-green" /> {ticket.assigned_to ? 'Agente Atribuído' : 'Sem atribuição'}
                        </p>
                    </div>
                    <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Abertura</p>
                        <p className="font-bold text-zinc-800 flex items-center gap-2">
                            <Calendar size={14} className="text-vj-green" /> {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {ticket.client_id && (
                    <div className="p-6 bg-vj-green/5 border border-vj-green/10 rounded-2xl">
                        <h4 className="text-xs font-bold text-vj-green uppercase mb-3">Cliente Vinculado</h4>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-vj-green text-white flex items-center justify-center text-xl font-black">
                                {ticket.clients?.name?.[0]}
                            </div>
                            <div>
                                <p className="font-bold text-vj-txt">{ticket.clients?.name}</p>
                                <p className="text-sm text-zinc-500">{ticket.clients?.email || 'Sem email'}</p>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
