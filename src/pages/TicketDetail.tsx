import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Clock, MessageSquare, Mail, AlertCircle, CheckCircle2,
  Send, Lock, User, MapPin, Paperclip, X, Calendar, ChevronDown, Star
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTicket, useUpdateTicket, useCreateTicketMessage, useSendTicketEmail, useDeleteTicket } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { useTeamMembers } from '@/hooks/useTeam';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; bg: string }> = {
  open:        { color: 'text-blue-700',  bg: 'bg-blue-100',  icon: AlertCircle,  label: 'Aberto' },
  in_progress: { color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock,        label: 'Em Andamento' },
  resolved:    { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle2, label: 'Resolvido' },
  closed:      { color: 'text-zinc-500',  bg: 'bg-zinc-100',  icon: CheckCircle2, label: 'Fechado' },
};

function SlaTimer({ deadline, status }: { deadline: string | null; status: string }) {
  if (!deadline || status === 'closed' || status === 'resolved') return null;
  const ms = new Date(deadline).getTime() - Date.now();
  const isBreached = ms < 0;
  const hours = Math.abs(Math.floor(ms / 3600000));
  const minutes = Math.abs(Math.floor((ms % 3600000) / 60000));
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold',
      isBreached ? 'bg-red-100 text-red-700 animate-pulse' : hours < 4 ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-600'
    )}>
      <Clock size={12} />
      {isBreached ? `SLA venceu há ${hours}h${minutes}m` : `SLA: ${hours}h${minutes}m restantes`}
    </div>
  );
}

type MsgMode = 'public' | 'internal' | 'email';

export default function TicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const createMessage = useCreateTicketMessage();
  const sendEmail = useSendTicketEmail();
  const deleteTicket = useDeleteTicket();
  const { data: groupTrips } = useGroupTrips();
  const { organization, user } = useAuthStore();
  const { data: team } = useTeamMembers(organization?.id);

  const [message, setMessage] = useState('');
  const [msgMode, setMsgMode] = useState<MsgMode>('public');
  const [emailSubject, setEmailSubject] = useState('');
  const [showClose, setShowClose] = useState(false);
  const [satisfactionScore, setSatisfactionScore] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleUpdate = (field: string, value: any) =>
    updateTicket.mutateAsync({ id: ticket!.id, [field]: value });

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content) return;

    if (msgMode === 'email') {
      const clientEmail = ticket?.clients?.email;
      if (!clientEmail) {
        alert('Cliente não possui e-mail cadastrado.');
        return;
      }
      await sendEmail.mutateAsync({
        ticket_id: ticket!.id,
        to_email: clientEmail,
        to_name: ticket?.clients?.name ?? 'Cliente',
        subject: emailSubject || ticket!.title,
        body: content,
      });
    } else {
      await createMessage.mutateAsync({
        ticket_id: ticket!.id,
        content,
        message_type: msgMode === 'internal' ? 'internal' : 'public',
        is_internal: msgMode === 'internal',
      });
    }
    setMessage('');
    setEmailSubject('');
  };

  const handleClose = async () => {
    await handleUpdate('status', 'closed');
    if (satisfactionScore) await handleUpdate('satisfaction_score', parseInt(satisfactionScore));
    if (resolutionNotes) await handleUpdate('resolution_notes', resolutionNotes);
    setShowClose(false);
  };

  // Build unified timeline: messages + events
  const timeline = useMemo(() => {
    if (!ticket) return [];
    const msgs = ((ticket as any).ticket_messages || []).map((m: any) => ({
      _type: 'message' as const,
      id: m.id,
      date: new Date(m.created_at),
      data: m,
    }));
    const events = ((ticket as any).ticket_events || []).map((e: any) => ({
      _type: 'event' as const,
      id: e.id,
      date: new Date(e.created_at),
      data: e,
    }));
    return [...msgs, ...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [ticket]);

  if (isLoading) {
    return (
      <AppLayout fullHeight>
        <div className="flex gap-6 h-full">
          <Skeleton className="flex-1 rounded-[2rem]" />
          <Skeleton className="w-80 rounded-[2rem] hidden lg:block" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout fullHeight>
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <p>Protocolo não encontrado.</p>
          <Button variant="link" onClick={() => navigate('/tickets')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  const statusConf = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.closed;
  const StatusIcon = statusConf.icon;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto w-full">

        {/* ── Main Column: Timeline ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden shadow-none">

          {/* Header */}
          <div className="flex items-start gap-4 p-6 border-b border-zinc-100 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')} className="rounded-full bg-zinc-100 hover:bg-zinc-200 shrink-0 h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-zinc-400">#{ticket.id.split('-')[0].toUpperCase()}</span>
                <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg', statusConf.bg, statusConf.color)}>
                  <StatusIcon size={11} /> {statusConf.label}
                </span>
                <SlaTimer deadline={ticket.sla_deadline} status={ticket.status} />
              </div>
              <h1 className="font-bold text-lg text-zinc-900 leading-tight">{ticket.title}</h1>
              {ticket.description && (
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{ticket.description}</p>
              )}
            </div>
            {ticket.status !== 'closed' && (
              <Button
                size="sm"
                onClick={() => setShowClose(true)}
                className="rounded-xl bg-vj-green hover:bg-vj-green/90 shadow-none shrink-0 text-xs"
              >
                Fechar Protocolo
              </Button>
            )}
          </div>

          {/* Close Panel */}
          {showClose && (
            <div className="p-4 bg-green-50 border-b border-green-200 shrink-0 space-y-3">
              <p className="text-sm font-bold text-green-800">Fechando protocolo — registre a resolução</p>
              <Textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="O que foi feito para resolver? (visível ao cliente)"
                rows={2}
                className="rounded-xl bg-white border-green-200 resize-none text-sm"
              />
              <div className="flex items-center gap-3">
                <Label className="text-xs text-green-700 font-semibold shrink-0">Satisfação (1–10):</Label>
                <Select value={satisfactionScore} onValueChange={setSatisfactionScore}>
                  <SelectTrigger className="h-9 w-24 rounded-xl bg-white border-green-200"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleClose} disabled={updateTicket.isPending} className="rounded-xl bg-green-600 hover:bg-green-700 shadow-none">
                  Confirmar Fechamento
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowClose(false)} className="rounded-xl">Cancelar</Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-10 w-10 text-zinc-200 mb-3" />
                <p className="text-zinc-400 font-medium">Nenhuma interação registrada ainda.</p>
              </div>
            ) : (
              timeline.map(item => {
                if (item._type === 'event') {
                  const ev = item.data;
                  let label = '';
                  if (ev.event_type === 'status_changed') {
                    const sFrom = STATUS_CONFIG[ev.payload.from]?.label ?? ev.payload.from;
                    const sTo   = STATUS_CONFIG[ev.payload.to]?.label ?? ev.payload.to;
                    label = `Status alterado: ${sFrom} → ${sTo}`;
                  } else {
                    label = ev.event_type.replace(/_/g, ' ');
                  }
                  return (
                    <div key={item.id} className="flex items-center gap-3 text-xs text-zinc-400 py-1">
                      <div className="h-px flex-1 bg-zinc-200" />
                      <span className="shrink-0 font-medium">{label}</span>
                      <span className="shrink-0 text-[10px]">
                        {item.date.toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </span>
                      <div className="h-px flex-1 bg-zinc-200" />
                    </div>
                  );
                }

                const m = item.data;
                const isAgent = m.sender_type === 'agent';
                const isInternal = m.is_internal || m.message_type === 'internal';
                const isEmail = m.message_type === 'email_sent' || m.message_type === 'email_received';
                const text = m.body || m.content || '';

                return (
                  <div key={item.id} className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[80%] rounded-2xl p-4',
                      isEmail    ? 'bg-zinc-900 text-white w-full max-w-full' :
                      isInternal ? 'bg-amber-50 border border-amber-200 text-amber-900' :
                      isAgent    ? 'bg-vj-green/10 border border-vj-green/20 text-zinc-900' :
                                   'bg-white border border-zinc-200 text-zinc-700'
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold">
                          {isEmail ? <><Mail size={11} className="inline mr-1" />E-mail {m.message_type === 'email_sent' ? 'enviado' : 'recebido'}</> :
                           isInternal ? <><Lock size={11} className="inline mr-1" />Nota Interna</> :
                           isAgent ? `${m.sender_name || 'Agente'}` : 'Cliente'}
                        </span>
                        <span className="text-[10px] opacity-50 ml-auto">
                          {item.date.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Compose */}
          <div className="p-4 bg-white border-t border-zinc-100 shrink-0 space-y-3">
            {/* Mode selector */}
            <div className="flex gap-1">
              {([
                { key: 'public',   label: 'Resposta',    Icon: MessageSquare },
                { key: 'internal', label: 'Nota Interna', Icon: Lock },
                { key: 'email',    label: 'Enviar Email', Icon: Mail },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setMsgMode(key)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors',
                    msgMode === key
                      ? key === 'email' ? 'bg-zinc-900 text-white' : key === 'internal' ? 'bg-amber-100 text-amber-700' : 'bg-vj-green/10 text-vj-green'
                      : 'text-zinc-400 hover:bg-zinc-100'
                  )}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Email subject */}
            {msgMode === 'email' && (
              <Input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder={`Assunto: Re: ${ticket.title}`}
                className="h-9 rounded-xl text-sm bg-zinc-50 border-zinc-300"
              />
            )}

            <div className={cn(
              'flex gap-2 items-end border rounded-2xl p-2 transition-all',
              msgMode === 'internal' ? 'bg-amber-50/50 border-amber-200' :
              msgMode === 'email'    ? 'bg-zinc-50 border-zinc-300' :
                                      'bg-white border-zinc-200'
            )}>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  msgMode === 'internal' ? 'Nota confidencial (não visível ao cliente)...' :
                  msgMode === 'email'    ? 'Escreva o email para o cliente...' :
                  'Escreva a resposta no protocolo...'
                }
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-[52px] resize-none text-sm"
              />
              <Button
                size="icon"
                disabled={!message.trim() || createMessage.isPending || sendEmail.isPending}
                onClick={handleSendMessage}
                className={cn(
                  'rounded-xl h-10 w-10 shrink-0 shadow-none',
                  msgMode === 'internal' ? 'bg-amber-500 hover:bg-amber-600' :
                  msgMode === 'email'    ? 'bg-zinc-900 hover:bg-zinc-800' :
                                          'bg-vj-green hover:bg-vj-green/90'
                )}
              >
                <Send size={15} />
              </Button>
            </div>
            {msgMode === 'email' && !ticket.clients?.email && (
              <p className="text-xs text-red-500 font-medium">⚠️ Cliente sem e-mail cadastrado. Adicione o e-mail na aba Vínculo.</p>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 gap-4">

          {/* Status & Priority */}
          <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-5 shadow-none space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm">Detalhes do Protocolo</h3>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</Label>
              <Select value={ticket.status} onValueChange={v => handleUpdate('status', v)}>
                <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-bold text-sm shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prioridade</Label>
              <Select value={ticket.priority} onValueChange={v => handleUpdate('priority', v)}>
                <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 shadow-none">
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
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Responsável</Label>
              <Select
                value={ticket.assigned_to || '_none'}
                onValueChange={v => handleUpdate('assigned_to', v === '_none' ? null : v)}
              >
                <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 shadow-none">
                  <SelectValue placeholder="Sem atribuição" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="_none" className="text-zinc-400 italic">Sem atribuição</SelectItem>
                  {team?.map(m => (
                    <SelectItem key={m.id} value={m.user_id ?? m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-zinc-100" />

            <div className="space-y-0.5 text-xs text-zinc-500">
              <p><span className="font-semibold text-zinc-700">Aberto:</span> {new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
              {ticket.last_interaction_at && (
                <p><span className="font-semibold text-zinc-700">Última interação:</span> {new Date(ticket.last_interaction_at).toLocaleString('pt-BR')}</p>
              )}
              {ticket.closed_at && (
                <p><span className="font-semibold text-zinc-700">Fechado:</span> {new Date(ticket.closed_at).toLocaleString('pt-BR')}</p>
              )}
              {ticket.satisfaction_score && (
                <p className="flex items-center gap-1">
                  <span className="font-semibold text-zinc-700">Satisfação:</span>
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  {ticket.satisfaction_score}/10
                </p>
              )}
            </div>
          </div>

          {/* Vínculo */}
          <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-5 shadow-none space-y-4">
            <h3 className="font-bold text-zinc-900 text-sm">Vínculo</h3>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><User size={11} /> Cliente</Label>
              <ClientSearchSelect
                value={ticket.client_id ?? ''}
                onChange={v => handleUpdate('client_id', v || null)}
                placeholder="Buscar cliente..."
              />
              {ticket.clients && (
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-sm">
                  <p className="font-bold text-zinc-900">{ticket.clients.name}</p>
                  {ticket.clients.email && <p className="text-zinc-500 text-xs mt-0.5">{ticket.clients.email}</p>}
                  {ticket.clients.phone && <p className="text-zinc-500 text-xs">{ticket.clients.phone}</p>}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={11} /> Excursão</Label>
              <Select
                value={ticket.group_trip_id ?? '_none'}
                onValueChange={v => handleUpdate('group_trip_id', v === '_none' ? null : v)}
              >
                <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-9 shadow-none text-sm">
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="_none" className="text-zinc-400 italic">Nenhuma excursão</SelectItem>
                  {groupTrips?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title || t.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rastreio email */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 shadow-none space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><Mail size={14} className="text-vj-green" /> Rastreio por Email</h3>
            <p className="text-xs text-zinc-500">Adicione este código no assunto de qualquer email para rastrear automaticamente:</p>
            <div className="bg-zinc-800 rounded-xl px-3 py-2 select-all cursor-pointer hover:bg-zinc-700 transition-colors">
              <span className="font-mono text-xs font-bold text-vj-green tracking-widest">[TK-{ticket.id.split('-')[0].toUpperCase()}]</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
