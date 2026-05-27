import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingMessages, useSendBookingMessage, useMarkMessagesRead } from '@/hooks/useBookingMessages';
import { cn } from '@/lib/utils';

function formatTime(dt: string) {
 return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function BookingMessagesPanel({ bookingId, leadName }: { bookingId: string; leadName: string }) {
 const { data: messages, isLoading } = useBookingMessages(bookingId);
 const send = useSendBookingMessage();
 const markRead = useMarkMessagesRead();
 const [draft, setDraft] = useState('');
 const bottomRef = useRef<HTMLDivElement>(null);

 // mark as read whenever we open/messages update
 useEffect(() => {
 if (messages && messages.length > 0) {
 markRead.mutate(bookingId);
 }
 }, [bookingId, messages?.length]);

 // scroll to bottom on new messages
 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages?.length]);

 const handleSend = async () => {
 if (!draft.trim()) return;
 await send.mutateAsync({ bookingId, body: draft.trim() });
 setDraft('');
 };

 return (
 <div className="flex flex-col h-[380px]">
 {/* Header */}
 <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 bg-zinc-50/60 rounded-t-2xl">
 <MessageSquare size={16} className="text-blue-500" />
 <p className="font-bold text-sm text-zinc-700">Chat com {leadName}</p>
 <span className="ml-auto text-[10px] text-zinc-400">
 {messages?.length ?? 0} mensagens
 </span>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white">
 {isLoading ? (
 <div className="space-y-2">
 <Skeleton className="h-10 w-3/4" />
 <Skeleton className="h-10 w-2/3 ml-auto" />
 </div>
 ) : messages?.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
 <MessageSquare size={28} className="opacity-25" />
 <p className="text-xs">Nenhuma mensagem ainda. Inicie a conversa!</p>
 </div>
 ) : (
 messages!.map(msg => {
 const isAgent = msg.sender_type === 'agent';
 const isSystem = msg.sender_type === 'system';
 return (
 <div key={msg.id} className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}>
 {isSystem ? (
 <div className="mx-auto text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 rounded-full px-3 py-0.5">
 {msg.body}
 </div>
 ) : (
 <div className={cn(
 'max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
 isAgent
 ? 'bg-blue-600 text-white rounded-br-sm'
 : 'bg-zinc-100 text-zinc-800 rounded-bl-sm'
 )}>
 <p>{msg.body}</p>
 <p className={cn('text-[9px] mt-0.5', isAgent ? 'text-blue-200 text-right' : 'text-zinc-400')}>
 {formatTime(msg.created_at)}
 </p>
 </div>
 )}
 </div>
 );
 })
 )}
 <div ref={bottomRef} />
 </div>

 {/* Input */}
 <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-100 bg-zinc-50/60 rounded-b-2xl">
 <Input
 placeholder="Escreva uma mensagem..."
 value={draft}
 onChange={e => setDraft(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
 className="flex-1 rounded-xl text-sm h-9"
 />
 <Button
 size="icon"
 className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex-none"
 onClick={handleSend}
 disabled={send.isPending || !draft.trim()}
 >
 {send.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
 </Button>
 </div>
 </div>
 );
}
