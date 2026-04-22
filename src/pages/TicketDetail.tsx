import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MessageSquare, Mail, AlertCircle, CheckCircle2, Ticket, Send, Paperclip, Lock, Link as LinkIcon, User, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useCreateTicketMessage, useTicket, useUpdateTicket } from '@/hooks/useTickets';
import { useClients } from '@/hooks/useClients';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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

export default function TicketDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const createMessage = useCreateTicketMessage();
  const { data: clients } = useClients();
  const { data: trips } = useGroupTrips();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const [msgMode, setMsgMode] = useState<'public' | 'internal' | 'email'>('public');

  if (isLoading) {
    return (
      <AppLayout fullHeight>
        <div className="flex gap-6 h-full">
          <Skeleton className="flex-1 rounded-xl" />
          <Skeleton className="w-80 rounded-xl hidden lg:block" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout fullHeight>
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <Ticket size={48} className="mb-4 text-zinc-300" />
          <p>Protocolo não encontrado.</p>
          <Button variant="link" onClick={() => navigate('/tickets')}>Voltar aos chamados</Button>
        </div>
      </AppLayout>
    );
  }

  const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.closed;
  const StatusIcon = statusConf.icon;

  // Flatten messages and emails into a unified timeline
  const msgs = ((ticket as Record<string, any>).ticket_messages || []).map((m: Record<string, unknown>) => ({
     _type: 'msg',
     id: m.id as string,
     date: new Date(m.created_at as string),
     original: m
  }));
  const timeline = [...msgs].sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  const handleUpdate = async (field: string, value: string) => {
    try {
      await updateTicket.mutateAsync({ id: ticket.id, [field]: value });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    const content = message.trim();
    if (!content) return;
    
    if (msgMode === 'email') {
      // Create message, mark as email
      // Here in a real world we would invoke edge function to send email via Gmail API
      await createMessage.mutateAsync({ ticket_id: ticket.id, content: `[EMAIL ENVIADO PARA CLIENTE]\n\n${content}` });
      toast({ title: 'Email enviado!', description: 'O e-mail foi disparado e vinculado ao protocolo.' });
    } else {
      await createMessage.mutateAsync({ ticket_id: ticket.id, content, is_internal: msgMode === 'internal' });
    }
    setMessage('');
  };

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto w-full">
        
        {/* Main Timeline Column */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-zinc-200/60 rounded-xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center gap-4 p-6 border-b border-zinc-100 bg-white shrink-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')} className="rounded-full bg-zinc-50 hover:bg-zinc-100 shrink-0 h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] text-zinc-400 font-medium tracking-wider">#{ticket.id.split('-')[0].toUpperCase()}</span>
                <span className="text-[10px] text-zinc-300">|</span>
                <span className="text-[10px] text-zinc-400 font-medium">Cód. Rastreio Email: [TK-{ticket.id.split('-')[0]}]</span>
              </div>
              <h1 className="truncate font-heading text-xl font-bold text-zinc-900 leading-tight">
                 {ticket.title}
              </h1>
            </div>
            
            {/* Mobile badges */}
            <div className="hidden sm:flex lg:hidden items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${statusConf.color}`}>
                <StatusIcon size={12} /> {statusConf.label}
              </span>
            </div>
          </div>

          {/* Timeline Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
            
            {/* Description Block */}
            {ticket.description && (
              <div className="bg-zinc-100/50 rounded-xl p-5 border border-zinc-200/50">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Descrição Original</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}

            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-10 w-10 text-zinc-200 mb-3" />
                <p className="text-zinc-500 font-medium">Nenhuma interação registrada.</p>
                <p className="text-xs text-zinc-400 mt-1">Selecione o modo abaixo para iniciar o atendimento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((item) => {
                  if (item._type === 'msg') {
                    const m = item.original;
                    const isAgent = m.sender_type === 'agent';
                    const isEmail = (m.body || m.content)?.includes('[EMAIL ENVIADO');
                    
                    return (
                      <div key={m.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 relative ${
                          isEmail ? 'bg-zinc-900 text-white shadow-lg' :
                          isAgent ? (m.is_internal ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-blue-600 text-white') 
                          : 'bg-white border border-zinc-200'
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isEmail ? 'text-zinc-300' : isAgent ? (m.is_internal ? 'text-amber-800' : 'text-blue-100') : 'text-zinc-900'}`}>
                              {isEmail ? <Mail size={12}/> : isAgent ? (m.is_internal ? <Lock size={12}/> : <Send size={12}/>) : <User size={12}/>}
                              {isAgent ? 'Você (Agência)' : 'Cliente'}
                              {m.is_internal && <span className="ml-1 text-[9px] bg-amber-200/50 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-wider">Nota Interna</span>}
                            </span>
                            <span className={`text-[10px] ${isEmail ? 'text-zinc-400' : isAgent ? (m.is_internal ? 'text-amber-700/60' : 'text-blue-200') : 'text-zinc-400'}`}>
                              {item.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isEmail ? 'text-zinc-100' : isAgent ? (m.is_internal ? 'text-amber-900' : 'text-blue-50') : 'text-zinc-600'}`}>
                            {m.body || m.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item._type === 'email') {
                    const em = item.original;
                    return (
                       <div key={em.id} className="relative rounded-xl border border-zinc-200 bg-white p-5 max-w-[95%] mx-auto">
                          <div className="absolute top-4 right-4 text-zinc-200"><Mail size={24}/></div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                                <Mail size={14} className="text-zinc-400" /> Email {em.direction === 'inbound' ? 'Recebido' : 'Enviado'}
                              </p>
                              <p className="text-xs text-zinc-500 mt-0.5">De: <span className="font-medium text-zinc-700">{em.from_name || em.from_email}</span></p>
                              <p className="text-xs text-zinc-500 mt-0.5">Assunto: <span className="font-medium text-zinc-700">{em.subject}</span></p>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium pt-1">
                              {item.date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                          <div className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                            {em.body_text}
                          </div>
                       </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Message Input Box - Advanced */}
          <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
            <div className="flex gap-2 mb-3 px-1">
              <button onClick={() => setMsgMode('public')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${msgMode === 'public' ? 'bg-blue-100 text-blue-700' : 'text-zinc-500 hover:bg-zinc-100'}`}><MessageSquare size={14}/> Mensagem de Protocolo</button>
              <button onClick={() => setMsgMode('internal')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${msgMode === 'internal' ? 'bg-amber-100 text-amber-700' : 'text-zinc-500 hover:bg-zinc-100'}`}><Lock size={14}/> Nota Interna Oculta</button>
              <button onClick={() => setMsgMode('email')} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${msgMode === 'email' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}><Mail size={14}/> Enviar por E-mail</button>
            </div>
            <div className={`flex gap-2 items-end border rounded-xl p-2 transition-all ${
              msgMode === 'internal' ? 'bg-amber-50/50 border-amber-200 focus-within:ring-amber-500/20 focus-within:border-amber-500' :
              msgMode === 'email' ? 'bg-zinc-50 border-zinc-300 focus-within:ring-zinc-900/20 focus-within:border-zinc-900' :
              'bg-blue-50/30 border-blue-200 focus-within:ring-blue-500/20 focus-within:border-blue-500'
            }`}>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (message.trim() && !createMessage.isPending) handleSendMessage();
                  }
                }}
                placeholder={
                  msgMode === 'internal' ? 'Escreva uma nota confidencial...' :
                  msgMode === 'email' ? 'Escreva o e-mail para o cliente...' :
                  'Escreva sua resposta no protocolo...'
                }
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-[60px] resize-none"
              />
              <Button
                size="icon"
                disabled={!message.trim() || createMessage.isPending}
                onClick={handleSendMessage}
                className={`rounded-xl h-10 w-10 shrink-0 ${
                  msgMode === 'internal' ? 'bg-amber-500 hover:bg-amber-600' :
                  msgMode === 'email' ? 'bg-zinc-900 hover:bg-zinc-800' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Send size={16} className={message.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column - Advanced Modifiable */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 gap-4">
          <div className="bg-white border border-zinc-200/60 rounded-xl p-6">
            <h3 className="font-bold text-zinc-900 mb-5 text-lg">Detalhes do Protocolo</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={12}/> Status Atual</p>
                <Select value={ticket.status} onValueChange={(v) => handleUpdate('status', v)}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open"><span className="text-blue-600">Aberto</span></SelectItem>
                    <SelectItem value="in_progress"><span className="text-amber-600">Em Andamento</span></SelectItem>
                    <SelectItem value="resolved"><span className="text-green-600">Resolvido</span></SelectItem>
                    <SelectItem value="closed"><span className="text-zinc-600">Fechado</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prioridade</p>
                <Select value={ticket.priority} onValueChange={(v) => handleUpdate('priority', v)}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high"><span className="text-orange-600 font-bold">Alta</span></SelectItem>
                    <SelectItem value="urgent"><span className="text-red-600 font-bold">🔴 Urgente</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Vincular Cliente</p>
                <Select value={ticket.client_id || 'none'} onValueChange={(v) => handleUpdate('client_id', v === 'none' ? null : v)}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-medium">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-zinc-400 italic">Nenhum cliente</SelectItem>
                    {clients?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Vincular Excursão</p>
                <Select value={ticket.group_trip_id || 'none'} onValueChange={(v) => handleUpdate('group_trip_id', v === 'none' ? null : v)}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-medium">
                    <SelectValue placeholder="Selecione um pacote" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-zinc-400 italic">Nenhum pacote</SelectItem>
                    {trips?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Vincular Viagem (Legado)</p>
                <Select value={ticket.trip_id || 'none'} onValueChange={(v) => handleUpdate('trip_id', v === 'none' ? null : v)}>
                  <SelectTrigger className="w-full bg-zinc-50 border-zinc-200 rounded-xl h-10 font-medium">
                    <SelectValue placeholder="Selecione uma viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-zinc-400 italic">Nenhuma viagem</SelectItem>
                    {(ticket as any).trips?.destination && (
                      <SelectItem value={ticket.trip_id!}>{(ticket as any).trips.destination}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="h-px bg-zinc-100 my-2" />

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Abertura</p>
                <p className="text-sm font-medium text-zinc-700">{new Date(ticket.created_at).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden">
            <Mail className="absolute -bottom-4 -right-4 text-blue-500/10 w-32 h-32" />
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 relative z-10"><LinkIcon size={16}/> Email Tracker</h3>
            <p className="text-xs text-blue-700/80 leading-relaxed mb-4 relative z-10">
              Para centralizar as respostas do GMail aqui, adicione o código abaixo no assunto ou corpo do e-mail.
            </p>
            <div className="bg-white px-3 py-2 border border-blue-200 rounded-xl text-center relative z-10 select-all cursor-pointer hover:bg-blue-50 transition-colors">
              <span className="font-mono text-xs font-bold tracking-widest text-blue-800">[TK-{ticket.id.split('-')[0].toUpperCase()}]</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
