import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Plane, FileText, Globe2, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePortalOrganization, usePortalTrips } from '@/hooks/usePortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PortalHome() {
  const navigate = useNavigate();
  const { org_slug } = useParams<{ org_slug: string }>();
  const { data: organization } = usePortalOrganization(org_slug);
  const { data: trips, isLoading } = usePortalTrips(org_slug);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(`/portal/${org_slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-16 selection:bg-vj-green/10">
      {/* Hero Banner Immersive */}
      <div className="relative h-[250px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-60" 
            style={{ backgroundColor: organization?.primary_color || '#1A7A4A' }}
          />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-transparent to-transparent z-0" />
        
        <div className="relative z-10 h-full max-w-5xl mx-auto px-6 flex flex-col justify-end pb-8">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {organization?.logo_url ? (
                  <img src={organization.logo_url} alt={organization.name} className="h-10 w-10 object-contain rounded-lg drop-shadow-md bg-white/10 p-1" />
                ) : (
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                    <Globe2 className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="text-white/80 font-medium tracking-wide uppercase text-sm">{organization?.name || 'Portal do Cliente'}</span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-white tracking-tight drop-shadow-lg">Minhas Viagens</h1>
            </div>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 -mt-4 relative z-20 space-y-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-[2rem] bg-white/50 dark:bg-zinc-900/50 border border-vj-border" />
            ))}
          </div>
        ) : !trips?.length ? (
          <Card className="border-vj-border rounded-[2rem] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl ">
            <CardContent className="py-20 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-muted/60 rounded-full flex items-center justify-center mb-4 border border-vj-border">
                <Plane className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg">Nenhuma viagem encontrada</h3>
              <p className="max-w-sm mt-2 text-sm text-muted-foreground">
                Não localizamos viagens vinculadas a este e-mail. Caso acredite ser um erro, contate o seu consultor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                onClick={() => navigate(`/portal/${org_slug}/trip/${trip.id}`)}
                className="group cursor-pointer border-vj-border rounded-[2rem] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl  hover: hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-vj-green/5 dark:bg-vj-green/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <CardHeader className="pb-3 border-b border-vj-border/50 relative z-10">
                  <CardTitle className="flex items-start justify-between gap-3 text-lg">
                    <span className="font-heading font-bold text-foreground leading-tight group-hover:text-vj-green transition-colors">{trip.title}</span>
                    <Badge variant="outline" className="bg-background shrink-0  border-vj-border font-medium">{trip.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 relative z-10">
                  <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                     <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"><MapPin className="h-4 w-4 text-accent" /></div>
                     <span className="truncate">{[trip.destination_city, trip.destination_country].filter(Boolean).join(', ') || 'Destino a definir'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                     <div className="w-8 h-8 rounded-full bg-vj-green/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-vj-green" /></div>
                     <span>{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '--'} → {trip.return_date ? new Date(trip.return_date).toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}) : '--'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                     <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><FileText className="h-4 w-4 text-blue-500" /></div>
                     <span>{trip.trip_documents?.filter((d:any) => d.is_visible_to_client).length || 0} documento(s) compartilhado(s)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
