import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useHotels } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Building2, Plus, Search, Star, MapPin, Phone, Globe, Tag, Pencil } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HotelEdit } from './HotelEdit';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Star rating display ── */
function StarRating({ count }: { count: number | null }) {
  if (!count) return <span className="text-xs text-vj-txt3">Sem categoria</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-100'}
        />
      ))}
    </div>
  );
}

/* ── Hotel Card ── */
function HotelCard({
  hotel,
  onClick,
}: {
  hotel: {
    id: string;
    name: string;
    category: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    tags: string[] | null;
    phone: string | null;
    website: string | null;
    cover_image_url: string | null;
    description: string | null;
  };
  onClick: () => void;
}) {
  const location = [hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ');

  return (
    <div
      onClick={onClick}
      className="bento-card cursor-pointer group overflow-hidden flex flex-col"
    >
      {/* Cover image / placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-zinc-100 to-zinc-50 overflow-hidden rounded-t-[calc(var(--r-xl)-1px)]">
        {hotel.cover_image_url ? (
          <img
            src={hotel.cover_image_url}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={40} className="text-zinc-300" />
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-sm border border-white/40 text-zinc-700">
            <StarRating count={hotel.category} />
          </span>
        </div>
        {/* Edit overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-xl p-2 shadow-lg">
            <Pencil size={14} className="text-vj-txt" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-vj-txt text-sm leading-tight line-clamp-1 group-hover:text-vj-green transition-colors">
          {hotel.name}
        </h3>

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-vj-txt3">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {hotel.description && (
          <p className="text-xs text-vj-txt2 line-clamp-2 leading-relaxed">{hotel.description}</p>
        )}

        {/* Tags */}
        {(hotel.tags?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <Tag size={10} className="text-vj-txt3 mt-0.5" />
            {hotel.tags!.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-vj-bg text-vj-txt2 border border-vj-border"
              >
                {tag}
              </span>
            ))}
            {(hotel.tags?.length ?? 0) > 3 && (
              <span className="text-[10px] text-vj-txt3 mt-0.5">+{hotel.tags!.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer contacts */}
        {(hotel.phone || hotel.website) && (
          <div className="flex items-center gap-3 pt-2 mt-auto border-t border-vj-border">
            {hotel.phone && (
              <span className="flex items-center gap-1 text-[11px] text-vj-txt3">
                <Phone size={10} /> {hotel.phone}
              </span>
            )}
            {hotel.website && (
              <a
                href={hotel.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-vj-blue hover:underline ml-auto"
              >
                <Globe size={10} /> Site
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Loading Skeleton Grid ── */
function HotelSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bento-card overflow-hidden">
          <Skeleton className="h-36 rounded-t-[calc(var(--r-xl)-1px)] rounded-b-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ── */
export default function Hotels() {
  const [search, setSearch] = useState('');
  const [editSheet, setEditSheet] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { data: hotels, isLoading } = useHotels(search || undefined);

  return (
    <AppLayout>
      <PageHeader
        title="Banco de Hotéis"
        description="Catálogo curado de hotéis para agilizar cotações e reservas."
        icon={Building2}
        actions={
          <div className="flex items-center gap-2 w-full">
            {/* Search inline */}
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-vj-txt3" />
              <Input
                placeholder="Buscar hotel ou cidade..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl border-vj-border bg-white"
              />
            </div>
            <StatusBadge variant="neutral" size="sm" className="shrink-0">
              {hotels?.length ?? 0}
            </StatusBadge>
            <Button onClick={() => setEditSheet({ open: true, id: null })} className="premium-button shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Novo Hotel
            </Button>
          </div>
        }
      />

      {/* Content */}
      {isLoading ? (
        <HotelSkeletonGrid />
      ) : !hotels?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-5 bg-zinc-100 rounded-3xl mb-5">
            <Building2 size={40} className="text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-vj-txt mb-2">Nenhum hotel cadastrado</h2>
          <p className="text-sm text-vj-txt3 max-w-xs mb-6">
            {search
              ? `Nenhum hotel encontrado para "${search}". Tente outro termo.`
              : 'Adicione hotéis ao catálogo para agilizar futuras cotações e reservas.'}
          </p>
          {!search && (
            <Button onClick={() => setEditSheet({ open: true, id: null })} className="premium-button">
              <Plus className="mr-2 h-4 w-4" /> Cadastrar primeiro hotel
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onClick={() => setEditSheet({ open: true, id: hotel.id })}
            />
          ))}
        </div>
      )}

      <HotelEdit
        open={editSheet.open}
        id={editSheet.id}
        onClose={() => setEditSheet({ open: false, id: null })}
      />
    </AppLayout>
  );
}
