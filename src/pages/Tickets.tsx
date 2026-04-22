import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Plus, Clock, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTickets, useCreateTicket } from '@/hooks/useTickets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  open: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle, label: 'Aberto' },
  in_progress: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Em Andamento' },
  resolved: { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2, label: 'Resolvido' },
  closed: { color: 'bg-zinc-100 text-zinc-500 border-zinc-200', icon: Ticket, label: 'Fechado' },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-zinc-500',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  urgent: 'text-red-500 font-bold',
};

export default function Tickets() {
  const navigate = useNavigate();
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
  });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    const t = await createTicket.mutateAsync(form);
    setOpen(false);
    setForm({ title: '', description: '', type: 'general', priority: 'medium' });
    if (t?.id) navigate(`/tickets/${t.id}`);
  };

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200/60">
          <div>
            <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
              <LifeBuoy className="text-blue-500" /> Central de Atendimento
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhamento de protocolos, emails e suporte aos viajantes.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl px-6 h-11 bg-blue-600 hover:bg-blue-700 shadow-none transition-colors"
          >
            <Plus size={18} className="mr-2" /> Nova Solicitação
          </Button>
        </div>

        {/* Kanban/Grid Layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : !tickets?.length ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 rounded-xl border border-dashed border-zinc-300 p-12 text-center">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Caixa de Entrada Limpa</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Nenhum chamado de suporte ativo. Clique em "Novo Chamado" quando precisar registrar uma ocorrência.
            </p>
            <Button variant="outline" className="rounded-xl shadow-none" onClick={() => setOpen(true)}>
              Abrir Primeiro Chamado
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
            {tickets.map((ticket) => {
              const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.closed;
              const StatusIcon = statusConf.icon;

              return (
                <div
                  key={ticket.id}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  className="group bg-white border border-zinc-200/80 rounded-xl p-5 hover:border-blue-400/50 hover:bg-blue-50/10 transition-all cursor-pointer flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${statusConf.color}`}>
                          <StatusIcon size={12} /> {statusConf.label}
                        </span>
                        <span className={`text-[11px] font-medium tracking-wide ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority === 'urgent' ? 'URGENTE' : ticket.priority === 'high' ? 'ALTA' : ticket.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                        </span>
                        {ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date() && ticket.status !== 'closed' && (
                           <span className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black animate-pulse shadow-sm">SLA VENCIDO</span>
                        )}
                      </div>
                      <h3 className="font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                        {ticket.title}
                      </h3>
                    </div>
                    <div className="text-[10px] text-zinc-400 whitespace-nowrap pt-1">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  {ticket.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
                    {ticket.clients?.name && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Cliente</span>
                        <span className="font-medium truncate max-w-[120px]">{ticket.clients.name}</span>
                      </div>
                    )}
                    {(ticket.trips?.destination || ticket.group_trips?.title) && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Viagem</span>
                        <span className="font-medium truncate max-w-[120px]">
                          {ticket.trips?.destination ?? ticket.group_trips?.title}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col ml-auto text-right">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Protocolo</span>
                      <span className="font-mono font-medium text-zinc-500">#{ticket.id.split('-')[0]}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden border-0">
          <div className="bg-zinc-50/50 p-6 border-b border-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-xl">Nova Solicitação</DialogTitle>
              <DialogDescription>Crie um novo protocolo para rastrear um problema ou suporte.</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5 bg-white">
            <div className="space-y-1.5">
              <Label className="text-zinc-600 font-semibold">Assunto do Atendimento</Label>
              <Input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Cancelamento de voo GOL"
                className="h-11 rounded-xl bg-zinc-50 border-zinc-200"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-zinc-600 font-semibold">Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Detalhes adicionais importantes..."
                className="rounded-xl resize-none bg-zinc-50 border-zinc-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-zinc-600 font-semibold">Categoria</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="complaint">Reclamação</SelectItem>
                    <SelectItem value="change_request">Alteração</SelectItem>
                    <SelectItem value="cancellation">Cancelamento</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="supplier">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-600 font-semibold">Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 bg-white">
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-11">Cancelar</Button>
              <Button
                onClick={handleCreate}
                disabled={!form.title.trim() || createTicket.isPending}
                className="rounded-xl h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-none"
              >
                {createTicket.isPending ? 'Criando...' : 'Abrir Protocolo'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
