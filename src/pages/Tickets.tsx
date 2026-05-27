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
 open: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: AlertCircle, label: 'Aberto' },
 in_progress: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock, label: 'Em Andamento' },
 resolved: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle2, label: 'Resolvido' },
 closed: { color: 'text-zinc-500', bg: 'bg-zinc-100 border-zinc-200', icon: CheckCircle2, label: 'Fechado' },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
 low: { color: 'text-zinc-400', label: 'Baixa' },
 medium: { color: 'text-amber-500', label: 'Média' },
 high: { color: 'text-orange-500', label: 'Alta' },
 urgent: { color: 'text-red-500', label: 'Urgente' },
};

const CHANNEL_CONFIG: Record<string, { icon: React.ElementType; label: string }> = {
 manual: { icon: Monitor, label: 'Manual' },
 email: { icon: Mail, label: 'E-mail' },
 whatsapp: { icon: MessageSquare, label: 'WhatsApp' },
 phone: { icon: Phone, label: 'Telefone' },
 portal: { icon: Monitor, label: 'Portal' },
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
 trip_id: '',
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
 trip_id: form.trip_id || null,
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
 className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90 font-bold"
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
 <Label className="text-zinc-700 font-bold">Vincular Excursão / Pacote em Grupo</Label>
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

 <div className="space-y-1.5">
 <Label className="text-zinc-700 font-bold">Código da Viagem Individual (trip_id)</Label>
 <p className="text-xs text-zinc-400">Cole o ID de uma viagem individual (pacote sob medida) para vincular este protocolo.</p>
 <Input
 value={form.trip_id}
 onChange={e => update('trip_id', e.target.value)}
 placeholder="UUID da viagem (ex: 6d9f2...)"
 className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-mono text-sm"
 />
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
 className="kanban-card flex flex-col gap-3 group"
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
 {/* A5-FIX: only show group_trips (trips join is absent from query) */}
 {ticket.group_trips?.title && (
 <div className="flex items-center gap-1.5">
 <Tag size={11} className="text-zinc-400" />
 <span className="font-medium truncate max-w-[140px]">{ticket.group_trips.title}</span>
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
 const [search, setSearch] = useState('');
 const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

 // Load ALL tickets — filtering happens client-side for Kanban grouping
 const { data: allTickets, isLoading } = useTickets();

 // A4-FIX: filter client-side by search term, distributed into Kanban columns
 const tickets = useMemo(() => {
 if (!allTickets) return [];
 if (!search.trim()) return allTickets;
 const q = search.toLowerCase();
 return allTickets.filter(
 (t) =>
 t.title.toLowerCase().includes(q) ||
 t.description?.toLowerCase().includes(q) ||
 t.clients?.name?.toLowerCase().includes(q) ||
 t.group_trips?.title?.toLowerCase().includes(q)
 );
 }, [allTickets, search]);

 // A6-FIX: labels reflect support ticket workflow, not CRM sales
 const columns = [
 { key: 'open', label: 'Novo Protocolo' },
 { key: 'in_progress', label: 'Em Andamento' },
 { key: 'resolved', label: 'Resolvidos' },
 { key: 'closed', label: 'Encerrados' },
 ];

 return (
 <AppLayout>
 <div className="space-y-4 max-w-[1400px] mx-auto pb-10 px-3 sm:px-4">

 <PageHeader
 title="Central de Atendimento"
 description="Protocolos, solicitações e suporte aos viajantes com linha do tempo completa."
 icon={LifeBuoy}
 actions={
 <div className="flex items-center gap-2 w-full flex-wrap">
 <div className="flex-1" />
 {/* Search */}
 <div className="relative flex-1 min-w-[180px]">
 <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
 <Input
 value={search}
 onChange={e => setSearch(e.target.value)}
 placeholder="Buscar atendimento..."
 className="pl-9 h-10 rounded-xl border-vj-border"
 />
 {search && (
 <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
 <X size={14} />
 </button>
 )}
 </div>

 <Button onClick={() => setCreateOpen(true)} className="premium-button shrink-0">
 <Plus size={15} className="mr-2" /> Novo Atendimento
 </Button>
 </div>
 }
 />

 {/* Kanban Board */}
 {isLoading ? (
 <div className="kanban-board">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="kanban-column opacity-50">
 <div className="kanban-column-header">
 <Skeleton className="h-4 w-24" />
 </div>
 <div className="kanban-cards">
 <Skeleton className="h-32 rounded-xl mb-2" />
 <Skeleton className="h-24 rounded-xl mb-2" />
 </div>
 </div>
 ))}
 </div>
 ) : !tickets?.length && search ? (
 <div className="flex-1 flex flex-col items-center justify-center bg-white/50 rounded-xl border border-dashed border-zinc-300 p-16 text-center">
 <div className="p-4 bg-zinc-100 rounded-full mb-4">
 <LifeBuoy className="h-8 w-8 text-zinc-400" />
 </div>
 <h2 className="text-xl font-bold mb-2">Nenhum protocolo encontrado</h2>
 <p className="text-muted-foreground max-w-sm mb-6">Tente outros termos de busca.</p>
 </div>
 ) : (
 <div className="kanban-board">
 {columns.map((col) => {
 const colTickets = tickets?.filter((t) => t.status === col.key) || [];
 const Conf = STATUS_CONFIG[col.key] || STATUS_CONFIG.closed;
 const Icon = Conf.icon;
 return (
 <div key={col.key} className="kanban-column">
 <div className="kanban-column-header">
 <div className="flex items-center gap-2">
 <Icon size={14} className={Conf.color} />
 <span className="kanban-column-title">{col.label}</span>
 </div>
 <span className="kanban-column-count">{colTickets.length}</span>
 </div>
 <div className="kanban-cards">
 {colTickets.map((ticket) => (
 <TicketCard
 key={ticket.id}
 ticket={ticket}
 onClick={() => setSelectedTicketId(ticket.id)}
 />
 ))}
 {colTickets.length === 0 && (
 <div className="text-center py-6 text-xs font-semibold text-vj-txt3 uppercase tracking-widest border-2 border-dashed border-zinc-200 rounded-xl">
 Vazio
 </div>
 )}
 </div>
 </div>
 );
 })}
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
