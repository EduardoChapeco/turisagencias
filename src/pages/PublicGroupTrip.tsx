import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle2, XCircle, MessageCircle, Loader2, Ticket } from 'lucide-react';
import { usePublicGroupTrip } from '@/hooks/useGroupTrips';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/ui/LazyImage';
import { PublicBookingForm } from '@/components/group-trips/PublicBookingForm';
import { SheetPage } from '@/components/ui/SheetPage';

export default function PublicGroupTrip() {
 const { slug } = useParams<{ slug: string }>();
 const { data, isLoading } = usePublicGroupTrip(slug);
 const [bookingOpen, setBookingOpen] = useState(false);

 useEffect(() => {
 if (data?.trip?.title) {
 document.title = `${data.trip.title} | Turis Agências`;
 }
 return () => {
 document.title = "Turis Agências — Gestão de Viagens";
 };
 }, [data]);

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-vj-bg">
 <Loader2 className="animate-spin text-vj-green" size={32} />
 </div>
 );
 }

 if (!data?.trip) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-vj-bg p-6">
 <h1 className="text-2xl font-bold text-vj-txt mb-2">Pacote não encontrado</h1>
 <p className="text-vj-txt3">Este pacote pode ter sido removido ou não está mais disponível.</p>
 </div>
 );
 }

 const { trip, days } = data;
 const formatPrice = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: trip.currency || 'BRL' }).format(v);
 const installmentValue = trip.installments_count > 1 ? trip.price_per_pax / trip.installments_count : 0;

 const handleReserve = () => setBookingOpen(true);
 const handleWhatsapp = () => {
 if (trip.org_whatsapp) {
 const msg = encodeURIComponent(`Olá! Tenho interesse no pacote "${trip.title}". Pode me passar mais detalhes?`);
 window.open(`https://wa.me/${trip.org_whatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
 }
 };

 return (
 <div className="min-h-screen bg-white">
 {/* Header */}
 <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-vj-border">
 <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
 <div className="flex items-center gap-2">
 {trip.org_logo && <img src={trip.org_logo} alt={trip.org_name} className="h-8 w-8 rounded-full object-cover" />}
 <span className="font-semibold text-sm text-vj-txt">{trip.org_name}</span>
 </div>
 <Button onClick={handleReserve} className="gap-2" size="sm">
 <MessageCircle size={14} /> Reservar
 </Button>
 </div>
 </header>

 {/* Hero */}
 <section className="relative h-[60vh] min-h-[400px] bg-vj-bg overflow-hidden">
 {trip.cover_image_url ? (
 <LazyImage
 src={trip.cover_image_url}
 alt={trip.title}
 aspectRatio="auto"
 wrapperClassName="h-full w-full"
 className="h-full w-full object-cover"
 fallback={<div className="h-full w-full bg-gradient-to-br from-vj-green/20 to-vj-bg" />}
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-vj-green/20 to-vj-bg" />
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
 <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white max-w-6xl mx-auto">
 <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4">
 Pacote em Grupo
 </div>
 <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">{trip.title}</h1>
 {trip.subtitle && <p className="text-lg md:text-xl text-white/90 max-w-2xl">{trip.subtitle}</p>}
 <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
 {trip.destination && <span className="flex items-center gap-1.5"><MapPin size={16} /> {trip.destination}</span>}
 {trip.departure_date && <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(trip.departure_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
 <span className="flex items-center gap-1.5"><Users size={16} /> {trip.max_pax - trip.current_pax} vagas restantes</span>
 </div>
 </div>
 </section>

 {/* Price Bar */}
 <section className="sticky top-[57px] z-20 bg-vj-green text-white">
 <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-xs uppercase tracking-wider opacity-80">A partir de</p>
 <p className="text-2xl md:text-3xl font-bold">{formatPrice(trip.price_per_pax)}</p>
 {installmentValue > 0 && (
 <p className="text-xs opacity-90">ou {trip.installments_count}x de {formatPrice(installmentValue)}</p>
 )}
 </div>
 <div className="flex gap-2">
 {trip.org_whatsapp && (
 <Button onClick={handleWhatsapp} variant="ghost" size="lg" className="gap-2 text-white hover:bg-white/10">
 <MessageCircle size={18} /> Tirar dúvidas
 </Button>
 )}
 <Button onClick={handleReserve} variant="secondary" size="lg" className="gap-2 bg-white text-vj-green hover:bg-white/90">
 <Ticket size={18} /> Reservar minha vaga
 </Button>
 </div>
 </div>
 </section>

 {/* Description */}
 {trip.description_md && (
 <section className="max-w-3xl mx-auto px-4 py-12">
 <h2 className="text-2xl font-bold text-vj-txt mb-6">Sobre este pacote</h2>
 <div className="prose prose-slate max-w-none text-vj-txt2 whitespace-pre-wrap leading-relaxed">
 {trip.description_md}
 </div>
 </section>
 )}

 {/* Day-by-day */}
 {days.length > 0 && (
 <section className="bg-vj-bg py-12">
 <div className="max-w-5xl mx-auto px-4">
 <h2 className="text-2xl md:text-3xl font-bold text-vj-txt mb-8">Dia a dia</h2>
 <div className="space-y-8">
 {days.map(day => (
 <div key={day.id} className="surface-card p-6">
 <div className="flex items-center gap-3 mb-4">
 <div className="h-10 w-10 rounded-full bg-vj-green text-white font-bold flex items-center justify-center text-sm">
 {day.day_number}
 </div>
 <h3 className="text-xl font-bold text-vj-txt">{day.title || `Dia ${day.day_number}`}</h3>
 </div>
 {day.description_md && (
 <p className="text-vj-txt2 whitespace-pre-wrap leading-relaxed mb-4">{day.description_md}</p>
 )}
 {day.media && day.media.length > 0 && (
 <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
 {day.media.map((m, i) => (
 <div key={i} className="flex-none w-72 h-48 snap-start rounded-vj-r overflow-hidden bg-vj-bg">
 {m.type === 'video' ? (
 <video src={m.url} className="w-full h-full object-cover" controls />
 ) : (
 <LazyImage src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" />
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Gallery */}
 {trip.gallery_urls && trip.gallery_urls.length > 0 && (
 <section className="py-12">
 <div className="max-w-6xl mx-auto px-4">
 <h2 className="text-2xl md:text-3xl font-bold text-vj-txt mb-8">Galeria</h2>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
 {trip.gallery_urls.map((url, i) => (
 <div key={i} className="aspect-square overflow-hidden bg-vj-bg">
 <LazyImage
 src={url}
 alt={`Foto ${i + 1}`}
 aspectRatio="1/1"
 wrapperClassName="h-full w-full"
 className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
 />
 </div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Includes / Excludes */}
 {(trip.includes?.length || trip.excludes?.length) && (
 <section className="bg-vj-bg py-12">
 <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8">
 {trip.includes && trip.includes.length > 0 && (
 <div>
 <h3 className="text-xl font-bold text-vj-txt mb-4 flex items-center gap-2">
 <CheckCircle2 className="text-vj-green" size={20} /> Inclui
 </h3>
 <ul className="space-y-2">
 {trip.includes.map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-vj-txt2">
 <CheckCircle2 size={16} className="text-vj-green flex-none mt-0.5" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 {trip.excludes && trip.excludes.length > 0 && (
 <div>
 <h3 className="text-xl font-bold text-vj-txt mb-4 flex items-center gap-2">
 <XCircle className="text-destructive" size={20} /> Não inclui
 </h3>
 <ul className="space-y-2">
 {trip.excludes.map((item, i) => (
 <li key={i} className="flex items-start gap-2 text-sm text-vj-txt2">
 <XCircle size={16} className="text-destructive flex-none mt-0.5" />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </section>
 )}

 {/* Final CTA */}
 <section className="py-16 text-center max-w-3xl mx-auto px-4">
 <h2 className="text-3xl font-bold text-vj-txt mb-4">Garanta sua vaga</h2>
 <p className="text-vj-txt2 mb-6">Restam {trip.max_pax - trip.current_pax} vagas. Reserva confirmada com sinal.</p>
 <Button onClick={handleReserve} size="lg" className="gap-2">
 <Ticket size={18} /> Reservar agora
 </Button>
 </section>

 {trip.important_notes && (
 <footer className="bg-vj-bg py-8 border-t border-vj-border">
 <div className="max-w-3xl mx-auto px-4">
 <h4 className="text-xs font-bold uppercase tracking-wider text-vj-txt3 mb-2">Observações importantes</h4>
 <p className="text-xs text-vj-txt2 whitespace-pre-wrap">{trip.important_notes}</p>
 </div>
 </footer>
 )}

 <SheetPage
 open={bookingOpen}
 onClose={() => setBookingOpen(false)}
 title="Reservar Viagem"
 subtitle={trip.title}
 icon={Ticket}
 >
 {() => (
 <div className="pb-10">
 <PublicBookingForm
 tripId={trip.id}
 orgId={trip.org_id}
 tripTitle={trip.title}
 pricePerPax={Number(trip.price_per_pax)}
 installmentsCount={trip.installments_count || 1}
 currency={trip.currency || 'BRL'}
 busLayout={trip.bus_layout}
 occupiedSeats={trip.occupied_seats ?? []}
 onSuccess={(token) => {
 setBookingOpen(false);
 window.location.href = `/voucher/${token}`;
 }}
 />
 </div>
 )}
 </SheetPage>
 </div>
 );
}
