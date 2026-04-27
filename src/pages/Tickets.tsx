import { useState, useMemo } from 'react';
import {
  LifeBuoy, Plus, Clock, AlertCircle, CheckCircle2,
  Search, Mail, Phone, MessageSquare,
  Monitor, X, ChevronRight, User, Tag
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTickets, useCreateTicket, type Ticket } from '@/hooks/useTickets';
import { useTeamMembers } from '@/hooks/useTeam';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetPage } from '@/components/ui/SheetPage';
import { PageHeader } from '@/components/ui/PageHeader';
import { TicketDetailSheet } from '@/components/TicketDetailSheet';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';

/* ── Constants ── */
const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  open:        { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   icon: AlertCircle,  label: 'Aberto' },
  in_progress: { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200', icon: Clock,        label: 'Em Andamento' },
  resolved:    { color: 'text-green-700',  bg: 'bg-green-50 border-green-200', icon: CheckCircle2, label: 'Resolvido' },
  closed:      { color: 'text-zinc-500',   bg: 'bg-zinc-100 border-zinc-200',  icon: CheckCircle2, label: 'Fechado' },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  low:    { color: 'text-zinc-400', label: 'Baixa' },
  medium: { color: 'text-amber-500', label: 'Média' },
  high:   { color: 'text-orange-500', label: 'Alta' },
  urgent: { color: 'text-red-500', label: 'Urgente' },
};

const CHANNEL_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
  manual:   { icon: Monitor,       label: 'Manual' },
  email:    { icon: Mail,          label: 'E-mail' },
  whatsapp: { icon: MessageSquare, label: 'WhatsApp' },
  phone:    { icon: Phone,         label: 'Telefone' },
  portal:   { icon: Monitor,       label: 'Portal' },
};

/* ── SLA Badge Component ── */
function SlaBadge({ ticket }: { ticket: Ticket }) {
  if (!ticket.sla_deadline || ticket.status === 'closed' || ticket.status === 'resolved') return null;

  const deadline = new Date(ticket.sla_deadline);
  const now = new Date();
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isBreached = hoursLeft < 0;
  const isCritical = hoursLeft >= 0 && hoursLeft < 4;

  if (isBreached) {
    return (
      <span className="bg-red-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
        SLA VENCIDO
      </span>
    );
  }
  if (isCritical) {
    return (
      <span className="bg-orange-500/20 text-orange-600 border border-orange-300 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
        {Math.floor(hoursLeft)}h restantes
      </span>
    );
  }
  return null;
}

/* ── Create Ticket Sheet ── */
const CREATE_SECTIONS = [
  { id: 'dados', label: 'Dados Principais', icon: LifeBuoy },
  { id: 'vinculo', label: 'Vínculo', icon: User },
];

function TicketCreateSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const createTicket = useCreateTicket();
  const { data: groupTrips } = useGroupTrips();
  const { organization, user } = useAuthStore();
  const { data: team } = useTeamMembers(organization?.id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    channel: 'manual',
    sla_hours: '24',
    client_id: '',
    group_trip_id: '',
    assigned_to: '',
  });

  const update = (field: string, value: string) =>
    setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const result = await createTicket.mutateAsync({
      title: form.title,
      description: form.description,
      type: form.type,
      priority: form.priority,
      channel: form.channel,
      sla_hours: parseInt(form.sla_hours) || 24,
      client_id: form.client_id || null,
      group_trip_id: form.group_trip_id || null,
      assigned_to: form.assigned_to || user?.id || null,
    });
    onClose();
    if (result?.id) onCreated(result.id);
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title="Novo Protocolo de Atendimento"
      subtitle="Registre uma nova ocorrência ou solicitação"
      icon={LifeBuoy}
      sections={CREATE_SECTIONS}
      defaultSection="dados"
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.title.trim() || createTicket.isPending}
            className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90  font-bold"
          >
            {createTicket.isPending ? 'Abrindo...' : 'Abrir Protocolo'}
          </Button>
        </div>
      }
    >
      {(activeSection) => (
        <>
          {activeSection === 'dados' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Assunto / Título *</Label>
                <Input
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="Ex: Cancelamento de voo GOL — Família Silva"
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus:border-vj-green"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-semibold">Descrição Completa</Label>
                <Textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  rows={4}
                  placeholder="Descreva a situação em detalhes..."
                  className="rounded-xl resize-none bg-zinc-50 border-zinc-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-zinc-600 font-semibold text-sm">Categoria</Label>
                  <Select value={form.type} onValueChange={v => update('type', v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="general">Geral</SelectItem>
                      <SelectItem value="complaint">Reclamação</SelectItem>
                      <SelectItem value="change_request">Alteração de Serviço</SelectItem>
                      <SelectItem value="cancellation">Cancelamento</SelectItem>
                      <SelectItem value="financial">Financeiro / Reembolso</SelectItem>
                      <SelectItem value="supplier">Problema com Fornecedor</SelectItem>
                      <SelectItem value="document">Documentação</SelectItem>
                      <SelectItem value="information">Solicitação de Informação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-600 font-semibold text-sm">Prioridade</Label>
                  <Select value={form.priority} onValueChange={v => update('priority', v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high"><span className="text-orange-600 font-bold">Alta</span></SelectItem>
                      <SelectItem value="urgent"><span className="text-red-600 font-bold">🔴 Urgente</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-600 font-semibold text-sm">Canal de Entrada</Label>
                  <Select value={form.channel} onValueChange={v => update('channel', v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="manual">Manual (Sistema)</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="portal">Portal do Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-600 font-semibold text-sm">SLA (horas)</Label>
                  <Select value={form.sla_hours} onValueChange={v => update('sla_hours', v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="4">4 horas (Urgente)</SelectItem>
                      <SelectItem value="8">8 horas</SelectItem>
                      <SelectItem value="24">24 horas (Padrão)</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                      <SelectItem value="72">72 horas (3 dias)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-600 font-semibold text-sm">Responsável</Label>
                <Select value={form.assigned_to || '_me'} onValueChange={v => update('assigned_to', v === '_me' ? '' : v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                    <SelectValue placeholder="Atribuir a um agente..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="_me">Eu mesmo</SelectItem>
                    {team?.map(m => (
                      <SelectItem key={m.id} value={m.user_id ?? m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeSection === 'vinculo' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-bold">Vincular Cliente</Label>
                <ClientSearchSelect
                  value={form.client_id}
                  onChange={v => update('client_id', v)}
                  placeholder="Buscar cliente por nome ou email..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-700 font-bold">Vincular Excursão / Pacote</Label>
                <Select value={form.group_trip_id || '_none'} onValueChange={v => update('group_trip_id', v === '_none' ? '' : v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 border-zinc-200">
                    <SelectValue placeholder="Selecionar excursão..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="_none" className="text-zinc-400 italic">Nenhuma excursão</SelectItem>
                    {groupTrips?.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title || t.destination || `Excursão ${t.id.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </>
      )}
    </SheetPage>
  );
}

/* ── Ticket Card ── */
function TicketCard({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) {
  const statusConf = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.closed;
  const priorityConf = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.low;
  const StatusIcon = statusConf.icon;
  const channelConf = CHANNEL_CONFIG[ticket.channel ?? 'manual'];
  const ChannelIcon = channelConf?.icon ?? Monitor;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-zinc-200/80 rounded-xl p-4 hover:border-vj-green/40 hover:bg-vj-green/[0.015] transition-all cursor-pointer flex flex-col gap-3 "
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusConf.bg} ${statusConf.color}`}>
              <StatusIcon size={11} /> {statusConf.label}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider ${priorityConf.color}`}>
              {priorityConf.label}
            </span>
            <SlaBadge ticket={ticket} />
          </div>
          <h3 className="font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-vj-green transition-colors">
            {ticket.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
            {new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
          <div className="flex items-center gap-1 text-zinc-400">
            <ChannelIcon size={11} />
            <span className="text-[9px]">{channelConf?.label}</span>
          </div>
        </div>
      </div>

      {ticket.description && (
        <p className="text-sm text-zinc-500 line-clamp-2">{ticket.description}</p>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-100 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-600 items-center">
        {ticket.clients?.name && (
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-zinc-400" />
            <span className="font-medium truncate max-w-[140px]">{ticket.clients.name}</span>
          </div>
        )}
        {(ticket.trips?.destination || ticket.group_trips?.title) && (
          <div className="flex items-center gap-1.5">
            <Tag size={11} className="text-zinc-400" />
            <span className="font-medium truncate max-w-[140px]">
              {ticket.trips?.destination ?? ticket.group_trips?.title}
            </span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 text-zinc-400">
          <span className="font-mono text-[10px]">#{ticket.id.split('-')[0].toUpperCase()}</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Tickets() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: tickets, isLoading } = useTickets({
    status: activeStatus === 'all' ? undefined : activeStatus,
    search: search || undefined,
  });

  const statusCounts = useMemo(() => {
    if (!tickets) return { all: 0, open: 0, in_progress: 0, resolved: 0 };
    return {
      all: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    };
  }, [tickets]);

  const TABS = [
    { key: 'all', label: 'Todos', count: statusCounts.all },
    { key: 'open', label: 'Abertos', count: statusCounts.open },
    { key: 'in_progress', label: 'Em Andamento', count: statusCounts.in_progress },
    { key: 'resolved', label: 'Resolvidos', count: statusCounts.resolved },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 max-w-[1400px] mx-auto pb-10 px-3 sm:px-4">

        <PageHeader
          title="Central de Atendimento"
          description="Protocolos, solicitações e suporte aos viajantes com linha do tempo completa."
          icon={LifeBuoy}
          actions={
            <Button
              onClick={() => setCreateOpen(true)}
              className="px-6 font-bold transition-all"
            >
              <Plus size={16} className="mr-2" /> Novo Protocolo
            </Button>
          }
        />

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Tabs */}
          <div className="flex h-10 gap-1 bg-zinc-100 p-1 rounded-xl">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                className={`px-3 h-8 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeStatus === tab.key
                    ? 'bg-white text-zinc-900 border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    activeStatus === tab.key ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm ml-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por assunto..."
              className="pl-9 h-11"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : !tickets?.length ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/50 rounded-xl border border-dashed border-zinc-300 p-16 text-center">
            <div className="p-4 bg-zinc-100 rounded-full mb-4">
              <LifeBuoy className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {search ? 'Nenhum protocolo encontrado' : activeStatus === 'all' ? 'Nenhum protocolo ativo' : `Nenhum protocolo ${TABS.find(t => t.key === activeStatus)?.label.toLowerCase()}`}
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              {search ? 'Tente outros termos de busca.' : 'Clique em "Novo Protocolo" para registrar uma ocorrência.'}
            </p>
            {!search && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-vj-green hover:bg-vj-green/90 "
              >
                Abrir Primeiro Protocolo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => setSelectedTicketId(ticket.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Sheet — NO DIALOG, SheetPage 70% */}
      <TicketCreateSheet 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        onCreated={(id) => { setCreateOpen(false); setSelectedTicketId(id); }}
      />

      {/* Detail Sheet */}
      <TicketDetailSheet
        id={selectedTicketId}
        open={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </AppLayout>
  );
}
