import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
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
          <Button onClick={() => navigate('/trips/new')} className="shrink-0 self-start sm:self-center">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="rounded-xl border border-vj-border bg-white p-16 flex flex-col items-center text-center">
            <Plane className="h-12 w-12 text-vj-txt3/30 mb-4" />
            <p className="text-lg font-semibold text-vj-txt mb-1">
              {search ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem cadastrada'}
            </p>
            <p className="text-sm text-vj-txt3 mb-6">
              {search
                ? `Sua busca por "${search}" não retornou resultados.`
                : 'Crie a primeira viagem para organizar voos, documentos e viajantes.'}
            </p>
            {!search && (
              <Button onClick={() => navigate('/trips/new')}>Criar primeira viagem</Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((trip) => {
              const s = STATUS_MAP[trip.status] ?? { label: trip.status, variant: 'neutral' as const };
              const dest = [trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino Indefinido';

              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="rounded-xl border border-vj-border bg-white p-5 text-left hover:border-vj-green/30 transition-all group text-start"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-vj-green/10 flex items-center justify-center shrink-0 group-hover:bg-vj-green/15 transition-colors">
                      <Plane className="h-5 w-5 text-vj-green" />
                    </div>
                    <StatusBadge variant={s.variant} size="sm">{s.label}</StatusBadge>
                  </div>

                  {/* Title */}
                  <p className="font-semibold text-vj-txt text-base leading-snug mb-1 line-clamp-1">{trip.title}</p>

                  {/* Destination */}
                  <p className="text-sm text-vj-txt3 flex items-center gap-1.5 mb-4">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {dest}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-vj-txt3 border-t border-vj-border pt-3">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmt(trip.departure_date)}
                    </span>
                    {(trip as Record<string, unknown>).pax_count ? (
                      <span className="flex items-center gap-1 ml-auto">
                        <Users2 className="h-3.5 w-3.5" />
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
    </AppLayout>
  );
}
