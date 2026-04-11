import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useHotel, useDeleteHotel } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid';
import { HotelEdit } from '@/pages/HotelEdit';
import { Building2, MapPin, Phone, Globe, Mail, Star, Trash2, Pencil, Coffee, Info, Tag } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function HotelDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: hotel, isLoading } = useHotel(id);
  const deleteHotel = useDeleteHotel?.();

  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  if (!hotel) {
    return (
      <AppLayout>
        <EmptyState
          icon={Building2}
          title="Hotel não encontrado"
          description="O hotel que você tentou acessar não existe ou foi removido."
          action={<Button variant="outline" onClick={() => navigate('/hotels')}>Voltar aos hotéis</Button>}
        />
      </AppLayout>
    );
  }

  const handleDelete = async () => {
    if (!id || !deleteHotel) return;
    await deleteHotel.mutateAsync(id);
    navigate('/hotels');
  };

  const stars = Number(hotel.category) || 0;
  const amenities = (hotel as any).amenities || [];

  return (
    <AppLayout>
      <PageHeader
        title={hotel.name}
        description={[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}
        icon={Building2}
        badge={stars > 0 ? (
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 text-cb-warning fill-cb-warning" />
            ))}
          </div>
        ) : undefined}
        backTo="/hotels"
        backToLabel="Hotéis"
        actions={
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-cb-danger/20 text-cb-danger hover:bg-cb-danger/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Hotel?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação é irreversível. O hotel será apagado do banco da agência.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-cb-danger text-cb-s0 hover:bg-cb-danger/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Button>
          </>
        }
      />

      <div className="max-w-6xl">
        <BentoGrid cols={3} gap="lg">
          {/* Capa e Descrição (2 columns wide, 2 rows high if there's image) */}
          <BentoCell colSpan={2} rowSpan={hotel.cover_image_url ? 2 : 1} padding="none" className="flex flex-col">
            {hotel.cover_image_url && (
              <div className="h-48 md:h-64 w-full shrink-0">
                <img src={hotel.cover_image_url} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-cb-muted" /> Sobre o Hotel
              </h3>
              {hotel.description ? (
                <p className="text-sm text-cb-muted leading-relaxed whitespace-pre-wrap">
                  {hotel.description}
                </p>
              ) : (
                <p className="text-sm text-cb-muted italic">Nenhuma descrição informada.</p>
              )}
            </div>
          </BentoCell>

          {/* Box de Contato e Endereço */}
          <BentoCell colSpan={1} rowSpan={1} padding="lg">
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cb-muted" /> Endereço e Contato
            </h3>
            <div className="space-y-4">
              {hotel.address || hotel.city || hotel.zip_code ? (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-cb-muted uppercase mb-1">Localização</p>
                   <p className="text-sm text-cb-text">{hotel.address}</p>
                   <p className="text-sm text-cb-muted mt-0.5">{[hotel.city, hotel.state].filter(Boolean).join(' - ')}</p>
                   <p className="text-sm text-cb-muted">{[hotel.country, hotel.zip_code].filter(Boolean).join(', ')}</p>
                </div>
              ) : null}

              {hotel.phone && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-cb-muted uppercase mb-1">Telefone</p>
                   <p className="text-sm text-cb-text flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {hotel.phone}</p>
                </div>
              )}
              {hotel.email && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-cb-muted uppercase mb-1">E-mail</p>
                   <p className="text-sm text-cb-text flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {hotel.email}</p>
                </div>
              )}
              {hotel.website && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-cb-muted uppercase mb-1">Site</p>
                   <a href={hotel.website} target="_blank" rel="noreferrer" className="text-sm text-cb-accent flex items-center gap-1.5 hover:underline">
                     <Globe className="h-3.5 w-3.5" /> Acessar site
                   </a>
                </div>
              )}
            </div>
          </BentoCell>

          {/* Comodidades */}
          <BentoCell>
            <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
              <Coffee className="h-4 w-4 text-cb-muted" /> Comodidades
            </h3>
            {amenities.length > 0 ? (
              <ul className="space-y-2">
                {amenities.map((item: string) => (
                  <li key={item} className="text-sm text-cb-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cb-accent" /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-cb-muted italic">Nenhuma comodidade detalhada.</p>
            )}
          </BentoCell>

          {/* Regimes */}
          <BentoCell colSpan={hotel.cover_image_url ? 1 : 2}>
             <h3 className="font-semibold mb-4 text-cb-text flex items-center gap-2">
               <Coffee className="h-4 w-4 text-cb-muted" /> Opções de Check-in / Regime
             </h3>
             {hotel.regime_options && hotel.regime_options.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hotel.regime_options.map(r => (
                    <StatusBadge key={r} variant="success" size="sm">{r}</StatusBadge>
                  ))}
                </div>
             ) : (
               <p className="text-sm text-cb-muted italic">Nenhuma opção de regime salva.</p>
             )}

             <div className="mt-8 border-t border-cb-border pt-4">
                <h3 className="font-semibold mb-3 text-cb-text flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-cb-muted" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {!hotel.tags || hotel.tags.length === 0 ? (
                    <p className="text-sm text-cb-muted italic">Sem tags</p>
                  ) : (
                    hotel.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs border border-cb-border bg-cb-s1 text-cb-text">{t}</span>
                    ))
                  )}
                </div>
             </div>
          </BentoCell>

        </BentoGrid>
      </div>

      <HotelEdit
        open={editOpen}
        id={id!}
        onClose={() => setEditOpen(false)}
      />
    </AppLayout>
  );
}
