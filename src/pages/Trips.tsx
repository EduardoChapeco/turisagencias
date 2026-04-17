import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { TripNewSheet } from '@/components/TripNewSheet';
import {
  Plane, Plus, MapPin, CalendarDays, Users2, Search,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'neutral' | 'danger' }> = {
  quoting:   { label: 'Em Cotação',  variant: 'warning' },
  booked:    { label: 'Reservado',   variant: 'info' },
  confirmed: { label: 'Confirmado',  variant: 'success' },
  traveling: { label: 'Em Viagem',   variant: 'info' },
  completed: { label: 'Concluído',   variant: 'neutral' },
  cancelled: { label: 'Cancelado',   variant: 'danger' },
};

const fmt = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Trips() {
  const navigate = useNavigate();
  const { data: trips, isLoading } = useTrips();
  const [search, setSearch] = useState('');
  const [newSheetOpen, setNewSheetOpen] = useState(false);

  const filtered = (trips ?? []).filter((t) =>
    !search.trim() ||
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination_city?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination_country?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Viagens"
            description="Workspace central de todas as viagens da agência."
            icon={Plane}
            badge={
              !isLoading && trips?.length ? (
                <StatusBadge variant="neutral" size="sm">{trips.length} viagens</StatusBadge>
              ) : undefined
            }
          />
          <Button onClick={() => setNewSheetOpen(true)} className="shrink-0 self-start sm:self-center premium-button">
            <Plus className="mr-2 h-4 w-4" /> Nova Viagem
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vj-txt3" />
          <Input
            placeholder="Buscar por destino ou título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-vj-border h-10"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bento-grid-premium">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-[32px]" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="rounded-[40px] border border-vj-border bg-white p-16 flex flex-col items-center text-center  ">
            <Plane className="h-12 w-12 text-vj-green/40 mb-4" />
            <p className="text-xl font-heading font-black text-vj-txt mb-2">
              {search ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem cadastrada'}
            </p>
            <p className="text-sm text-vj-txt3 mb-6 max-w-sm mx-auto">
              {search
                ? `Sua busca por "${search}" não retornou resultados.`
                : 'Crie a primeira viagem para organizar voos, documentos e interações com os viajantes do seu portal.'}
            </p>
            {!search && (
              <Button onClick={() => setNewSheetOpen(true)} className="premium-button">Criar Primeira Viagem</Button>
            )}
          </div>
        ) : (
          <div className="bento-grid-premium">
            {filtered.map((trip) => {
              const s = STATUS_MAP[trip.status] ?? { label: trip.status, variant: 'neutral' as const };
              const dest = [trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino Indefinido';

              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="premium-card group relative hover:border-vj-green/30 transition-all text-start flex flex-col p-5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                    <div className="h-12 w-12 rounded-[16px] bg-gradient-to-br from-vj-green/20 to-vj-green/5 flex items-center justify-center shrink-0 border border-vj-green/20  group-hover:scale-110 transition-transform duration-500">
                      <Plane className="h-6 w-6 text-vj-green" />
                    </div>
                    <StatusBadge variant={s.variant} size="sm">{s.label}</StatusBadge>
                  </div>

                  {/* Title */}
                  <p className="font-heading font-black text-xl text-vj-txt leading-snug mb-1 line-clamp-2 relative z-10">{trip.title}</p>

                  {/* Destination */}
                  <p className="text-sm text-vj-txt3 flex items-center gap-1.5 mb-6 relative z-10">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {dest}
                  </p>

                  <div className="flex-1" />

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-vj-txt3 border-t border-zinc-100 pt-4 relative z-10 w-full">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                      <CalendarDays className="h-4 w-4 text-zinc-400" />
                      {fmt(trip.departure_date)}
                    </span>
                    {(trip as Record<string, unknown>).pax_count ? (
                      <span className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
                        <Users2 className="h-4 w-4 text-zinc-400" />
                        {(trip as Record<string, unknown>).pax_count as number} pax
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <TripNewSheet 
        open={newSheetOpen} 
        onClose={() => setNewSheetOpen(false)} 
      />
    </AppLayout>
  );
}
