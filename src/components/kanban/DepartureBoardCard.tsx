import { GripVertical, Plane, ExternalLink, Calendar, Clock, Package, Hash } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

/* ── Types ── */
export type DepartureMeta = {
  check_in_date?: string;       // ISO date YYYY-MM-DD
  check_in_time?: string;       // HH:mm (hora de abertura do check-in online)
  flight_locator?: string;      // PNR/localizador aéreo principal
  airline_name?: string;        // Ex: LATAM, GOL, Azul
  airline_checkin_url?: string; // URL direta do site de checkin
  package_name?: string;        // Ex: "Cancún All Inclusive 7n"
  hotel_name?: string;
  destination?: string;
};

export type DepartureCardData = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  estimated_value: number | null;
  whatsapp: string | null;
  email: string | null;
  tags: string[] | null;
  client_id: string | null;
  quotation_id: string | null;
  group_trip_id: string | null;
  meta?: DepartureMeta | null;       // coluna original no banco
  metadata?: DepartureMeta | null;   // alias adicionado pelo Lovable
  assigned_to?: string | null;
  due_date?: string | null;
  priority?: string | null;
  clients?: { name: string; phone: string | null } | null;
  quotations?: { destination: string | null } | null;
  group_trips?: { title: string | null } | null;
};

/* ── Helpers ── */
function getDaysUntilCheckin(checkInDate?: string): number | null {
  if (!checkInDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ci = new Date(checkInDate + 'T00:00:00');
  return Math.ceil((ci.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function CheckinBadge({ days }: { days: number | null }) {
  if (days === null) return null;

  const isToday = days === 0;
  const isPast = days < 0;
  const isUrgent = days <= 2 && days >= 0;
  const isSoon = days <= 7 && days > 2;

  const label = isPast
    ? `Embarcou há ${Math.abs(days)}d`
    : isToday
    ? '✈️ Hoje!'
    : `${days}d para embarque`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
        isPast && 'bg-gray-50 text-gray-400 border-gray-200',
        isToday && 'bg-blue-500 text-white border-blue-500 animate-pulse',
        isUrgent && !isToday && 'bg-orange-50 text-orange-600 border-orange-200',
        isSoon && 'bg-amber-50 text-amber-600 border-amber-200',
        !isPast && !isToday && !isUrgent && !isSoon && 'bg-emerald-50 text-emerald-600 border-emerald-200',
      )}
    >
      <Clock size={9} />
      {label}
    </span>
  );
}

/* ── DepartureBoardCard ── */
export function DepartureBoardCard({
  card,
  onClick,
}: {
  card: DepartureCardData;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'Card', card } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;
  const daysUntil = getDaysUntilCheckin(meta.check_in_date);
  const destination = meta.destination ?? card.quotations?.destination ?? card.group_trips?.title;
  const clientName = card.clients?.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        'group relative bg-white border border-vj-border rounded-xl p-3  hover: hover:border-vj-green/40 transition-all cursor-pointer select-none',
        isDragging && 'opacity-40',
      )}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-70 touch-none cursor-grab active:cursor-grabbing transition-opacity"
        aria-label="Arrastar card"
      >
        <GripVertical size={14} className="text-vj-txt3" />
      </button>

      <div className="pl-4 space-y-2.5">
        {/* Header: Countdown badge + Airline checkin quick-access */}
        <div className="flex items-center justify-between gap-2">
          <CheckinBadge days={daysUntil} />
          {meta.airline_checkin_url && (
            <a
              href={meta.airline_checkin_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Check-in online ${meta.airline_name ?? ''}`}
              className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full transition-colors"
            >
              <ExternalLink size={9} />
              Check-in
            </a>
          )}
        </div>

        {/* Client name + destination */}
        <div>
          <p className="font-semibold text-sm text-vj-txt leading-tight">{card.title}</p>
          {clientName && (
            <p className="text-xs text-vj-txt3 mt-0.5 truncate">{clientName}</p>
          )}
          {destination && (
            <p className="text-xs text-vj-green font-medium mt-0.5 flex items-center gap-1">
              <Plane size={10} />
              {destination}
            </p>
          )}
        </div>

        {/* Package + Locator row */}
        {(meta.package_name || meta.flight_locator) && (
          <div className="flex flex-wrap gap-1.5">
            {meta.package_name && (
              <span className="inline-flex items-center gap-1 text-[10px] text-vj-txt2 bg-vj-bg border border-vj-border px-1.5 py-0.5 rounded-md">
                <Package size={9} />
                {meta.package_name}
              </span>
            )}
            {meta.flight_locator && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-md">
                <Hash size={9} />
                {meta.flight_locator}
              </span>
            )}
          </div>
        )}

        {/* Check-in date row */}
        {meta.check_in_date && (
          <div className="flex items-center gap-1.5 text-[10px] text-vj-txt3">
            <Calendar size={9} />
            <span>
              {new Date(meta.check_in_date + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
              })}
              {meta.check_in_time && ` · ${meta.check_in_time}`}
            </span>
            {meta.airline_name && (
              <span className="ml-auto font-medium text-vj-txt2">{meta.airline_name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Overlay (DragOverlay) ── */
export function DepartureCardOverlay({ card }: { card: DepartureCardData }) {
  return (
    <div className="bg-white border border-vj-green/40 rounded-xl p-3  rotate-1 opacity-95 w-[260px]">
      <p className="font-semibold text-sm text-vj-txt">{card.title}</p>
      {card.clients?.name && (
        <p className="text-xs text-vj-txt3 mt-0.5">{card.clients.name}</p>
      )}
    </div>
  );
}
