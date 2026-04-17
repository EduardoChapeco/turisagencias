import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Plus, X } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTickets, useCreateTicket } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-zinc-100 text-zinc-500',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-zinc-50 text-zinc-500',
  medium: 'bg-amber-50 text-amber-600',
  high: 'bg-orange-50 text-orange-600',
  urgent: 'bg-red-50 text-red-600',
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
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Tickets de Suporte</h1>
            <p className="text-sm text-muted-foreground">
              Central de atendimento integrada com clientes e viagens.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full gap-2 px-6"
          >
            <Plus size={16} /> Novo Ticket
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : !tickets?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <LifeBuoy className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-semibold">Nenhum ticket aberto</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Clique em "Novo Ticket" para registrar um atendimento ou problema.
              </p>
              <Button variant="outline" onClick={() => setOpen(true)}>Criar primeiro ticket</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-vj-green/20 premium-card"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-base truncate">{ticket.title}</p>
                      {ticket.description && (
                        <p className="mt-0.5 text-xs font-normal text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${STATUS_COLORS[ticket.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Andamento' : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${PRIORITY_COLORS[ticket.priority] ?? 'bg-zinc-100 text-zinc-500'}`}>
                        {ticket.priority === 'urgent' ? '🔴 Urgente' : ticket.priority === 'high' ? '🟠 Alta' : ticket.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-0">
                  <span className="uppercase font-bold tracking-wider">Tipo: {ticket.type}</span>
                  <span>Cliente: <strong>{ticket.clients?.name || 'Não informado'}</strong></span>
                  <span>Viagem: <strong>{ticket.trips?.title || 'Não vinculada'}</strong></span>
                  <span className="ml-auto text-[10px]">
                    {new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy size={18} className="text-vj-green" /> Novo Ticket de Suporte
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ex: Hotel não confirmou reserva"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                placeholder="Descreva o problema ou solicitação..."
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="complaint">Reclamação</SelectItem>
                    <SelectItem value="change_request">Alteração</SelectItem>
                    <SelectItem value="cancellation">Cancelamento</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="supplier">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baixa</SelectItem>
                    <SelectItem value="medium">🟡 Média</SelectItem>
                    <SelectItem value="high">🟠 Alta</SelectItem>
                    <SelectItem value="urgent">🔴 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.title.trim() || createTicket.isPending}
              className="rounded-xl"
            >
              {createTicket.isPending ? 'Criando...' : 'Criar Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
