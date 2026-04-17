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
import { MediaCarousel } from '@/components/ui/MediaCarousel';
import { MediaGallery } from '@/components/ui/MediaGallery';
import { SectionRenderer } from '@/components/ui/SectionRenderer';
import { Building2, MapPin, Phone, Globe, Mail, Star, Trash2, Pencil, Coffee, Info, Tag, Video, Image as ImageIcon } from 'lucide-react';
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
  const gallery = (hotel as any).gallery_urls || [];
  const sections = (hotel as any).sections || [];
  const carouselImages = [hotel.photo_url, ...gallery].filter(Boolean);

  return (
    <AppLayout>
      <PageHeader
        title={hotel.name}
        description={[hotel.city, hotel.state, hotel.country].filter(Boolean).join(', ')}
        icon={Building2}
        badge={stars > 0 ? (
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(stars, 5) }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 text-vj-orange fill-vj-orange" />
            ))}
          </div>
        ) : undefined}
        backTo="/hotels"
        backToLabel="Hotéis"
        actions={
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-vj-red/20 text-vj-red hover:bg-vj-red/10">
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
                  <AlertDialogAction onClick={handleDelete} className="bg-vj-red text-cb-s0 hover:bg-vj-red/90">
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

      <div className="max-w-6xl space-y-12">
        <BentoGrid cols={3} gap="lg">
          {/* Capa e Descrição (2 columns wide, 2 rows high if there's image) */}
          <BentoCell colSpan={2} rowSpan={carouselImages.length > 0 ? 2 : 1} padding="none" className="flex flex-col">
            {carouselImages.length > 0 && (
              <MediaCarousel images={carouselImages} aspectRatio="wide" />
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-vj-txt3" /> Sobre o Hotel
              </h3>
              {hotel.description ? (
                <p className="text-sm text-vj-txt3 leading-relaxed whitespace-pre-wrap">
                  {hotel.description}
                </p>
              ) : (
                <p className="text-sm text-vj-txt3 italic">Nenhuma descrição informada.</p>
              )}
            </div>
          </BentoCell>

          {/* Box de Contato e Endereço */}
          <BentoCell colSpan={1} rowSpan={1} padding="lg">
            <h3 className="font-semibold mb-4 text-vj-txt flex items-center gap-2">
              <MapPin className="h-4 w-4 text-vj-txt3" /> Endereço e Contato
            </h3>
            <div className="space-y-4">
              {hotel.address || hotel.city ? (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-vj-txt3 uppercase mb-1">Localização</p>
                   <p className="text-sm text-vj-txt">{hotel.address}</p>
                   <p className="text-sm text-vj-txt3 mt-0.5">{[hotel.city, hotel.state].filter(Boolean).join(' - ')}</p>
                   <p className="text-sm text-vj-txt3">{hotel.country}</p>
                </div>
              ) : null}

              {hotel.phone && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-vj-txt3 uppercase mb-1">Telefone</p>
                   <p className="text-sm text-vj-txt flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {hotel.phone}</p>
                </div>
              )}
              {hotel.email && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-vj-txt3 uppercase mb-1">E-mail</p>
                   <p className="text-sm text-vj-txt flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {hotel.email}</p>
                </div>
              )}
              {hotel.website && (
                <div>
                   <p className="text-[10px] font-semibold tracking-wider text-vj-txt3 uppercase mb-1">Site</p>
                   <a href={hotel.website} target="_blank" rel="noreferrer" className="text-sm text-vj-green flex items-center gap-1.5 hover:underline">
                     <Globe className="h-3.5 w-3.5" /> Acessar site
                   </a>
                </div>
              )}
            </div>
          </BentoCell>

          {/* Comodidades */}
          <BentoCell>
            <h3 className="font-semibold mb-4 text-vj-txt flex items-center gap-2">
              <Coffee className="h-4 w-4 text-vj-txt3" /> Comodidades
            </h3>
            {amenities.length > 0 ? (
              <ul className="space-y-2">
                {amenities.map((item: string) => (
                  <li key={item} className="text-sm text-vj-txt flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-vj-green" /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-vj-txt3 italic">Nenhuma comodidade detalhada.</p>
            )}
          </BentoCell>

          {/* Regimes */}
          <BentoCell colSpan={carouselImages.length > 0 ? 1 : 2}>
             <h3 className="font-semibold mb-4 text-vj-txt flex items-center gap-2">
               <Coffee className="h-4 w-4 text-vj-txt3" /> Opções de Check-in / Regime
             </h3>
             {hotel.regime_options && hotel.regime_options.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {hotel.regime_options.map(r => (
                    <StatusBadge key={r} variant="success" size="sm">{r}</StatusBadge>
                  ))}
                </div>
             ) : (
               <p className="text-sm text-vj-txt3 italic">Nenhuma opção de regime salva.</p>
             )}

             <div className="mt-8 border-t border-vj-border pt-4">
                <h3 className="font-semibold mb-3 text-vj-txt flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-vj-txt3" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {!hotel.tags || hotel.tags.length === 0 ? (
                    <p className="text-sm text-vj-txt3 italic">Sem tags</p>
                  ) : (
                    hotel.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs border border-vj-border bg-vj-bg text-vj-txt">{t}</span>
                    ))
                  )}
                </div>
             </div>
          </BentoCell>
        </BentoGrid>

        {/* Dynamic Sections */}
        <SectionRenderer sections={sections} />

        {/* Gallery Section If Not Handled In Sections */}
        {gallery.length > 0 && !sections.some((s: any) => s.type === 'gallery') && (
          <div className="pt-8">
            <h2 className="text-2xl font-bold mb-6 text-vj-txt flex items-center gap-3">
              <ImageIcon className="h-6 w-6 text-vj-green" /> Galeria de Fotos
            </h2>
            <MediaGallery images={gallery} />
          </div>
        )}

        {/* Video Section */}
        {(hotel as any).video_url && (
           <div className="pt-8">
            <h2 className="text-2xl font-bold mb-6 text-vj-txt flex items-center gap-3">
              <Video className="h-6 w-6 text-vj-green" /> Apresentação em Vídeo
            </h2>
            <div className="aspect-video rounded-3xl overflow-hidden  border border-vj-border">
              <iframe 
                src={(hotel as any).video_url.replace('watch?v=', 'embed/')} 
                className="w-full h-full" 
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      <HotelEdit
        open={editOpen}
        id={id!}
        onClose={() => setEditOpen(false)}
      />
    </AppLayout>
  );
}
