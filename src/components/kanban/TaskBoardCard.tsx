import { GripVertical, Hash, Calendar, Phone, Mail, Link2, Briefcase, FileText } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

export type TaskCardData = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  quotation_id: string | null;
  group_trip_id: string | null;
  ticket_id: string | null;
  task_type: string | null;
  linked_card_ids: string[] | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: string | null;
  whatsapp: string | null;
  email: string | null;
  tags: string[] | null;
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  group_trips?: { title: string | null } | null;
};

const TASK_ICONS: Record<string, React.ReactNode> = {
  cotar: <FileText size={12} />,
  ligar: <Phone size={12} />,
  reuniao: <Briefcase size={12} />,
  cancelamento: <Hash size={12} />,
  reembolso: <Hash size={12} />,
  realocacao: <Hash size={12} />,
  documentacao: <FileText size={12} />,
  checkin: <Calendar size={12} />,
  follow_up: <Phone size={12} />,
  outro: <Hash size={12} />
};

export function TaskBoardCard({ card, onClick }: { card: TaskCardData; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'Card', card },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const hasLinks = (card.linked_card_ids?.length ?? 0) > 0 || card.ticket_id || card.quotation_id || card.group_trip_id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'kanban-card group relative',
        isDragging && 'kanban-card-dragging'
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-black/5 p-1 rounded-md touch-none cursor-grab active:cursor-grabbing transition-all"
        aria-label="Arrastar tarefa"
      >
        <GripVertical size={16} className="text-zinc-400" />
      </button>

      <div className="pl-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {card.task_type ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wide">
              {TASK_ICONS[card.task_type] || <Hash size={12} />}
              {card.task_type}
            </span>
          ) : (
             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wide">
               Task Geral
             </span>
          )}
          
          {card.priority === 'High' && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Prioridade Alta" />
          )}
        </div>

        <div>
          <p className="font-semibold text-sm text-vj-txt leading-tight">{card.title}</p>
          {card.clients?.name && <p className="text-xs text-vj-txt3 mt-0.5 truncate">{card.clients.name}</p>}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-vj-border/50">
           <div className="flex items-center gap-2 text-xs text-vj-txt3 font-medium">
             {card.due_date && (
                <span className={cn('flex items-center gap-1', isOverdue ? 'text-red-500 font-bold' : '')}>
                  <Calendar size={12} />
                  {new Date(card.due_date).toLocaleDateString('pt-BR')}
                </span>
             )}
             {hasLinks && (
                <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-1.5 rounded-md" title="Tem vínculos CRM/Tickets">
                  <Link2 size={12} /> Link
                </span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

export function TaskCardOverlay({ card }: { card: TaskCardData }) {
  return (
    <div className="kanban-card rotate-1 opacity-95 w-[260px] border-vj-green/40 shadow-xl">
      <div className="pl-6">
        <p className="font-bold text-[15px] text-zinc-800">{card.title}</p>
        <p className="text-xs font-medium text-zinc-500 mt-0.5">{card.clients?.name}</p>
      </div>
    </div>
  );
}
