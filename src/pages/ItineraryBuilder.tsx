import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { useItineraryDetail, useItineraryStops } from '@/hooks/useItineraries';
import { ItinerarySplitView } from '@/components/itinerary/ItinerarySplitView';
import { StopCoordinate } from '@/components/itinerary/ItineraryMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ItineraryBuilder() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { profile } = useAuthStore();

 const { data: itinerary, isLoading: isItineraryLoading } = useItineraryDetail(id);
 const { stops, isLoading: isStopsLoading, generateAI, generateAILoading } = useItineraryStops(id);

 const [prompt, setPrompt] = useState('');

 const handleGenerate = async () => {
 if (!prompt.trim() || !profile?.org_id) return;
 await generateAI({ prompt, orgId: profile.org_id });
 setPrompt('');
 };

 // Map stops to the StopCoordinate format expected by ItinerarySplitView
 const mappedStops: StopCoordinate[] = (stops || []).map((s: any) => ({
 id: s.id,
 lat: s.lat ?? 0,
 lng: s.lng ?? 0,
 name: s.name,
 time: s.time_start,
 category: s.category || s.stop_type,
 emoji: s.emoji,
 description: s.description,
 day_number: s.day_number ?? 1,
 }));

 if (isItineraryLoading) {
 return (
 <AppLayout>
 <div className="flex items-center justify-center h-64">
 <Loader2 className="w-8 h-8 animate-spin text-vj-green" />
 </div>
 </AppLayout>
 );
 }

 if (!itinerary) {
 return (
 <AppLayout>
 <div className="p-8 text-red-500">Roteiro não encontrado.</div>
 </AppLayout>
 );
 }

 return (
 <AppLayout fullHeight>
 <div className="flex flex-col h-full gap-4">
 {/* Header */}
 <div className="flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => navigate('/itineraries')} className="rounded-full">
 <ArrowLeft className="w-5 h-5" />
 </Button>
 <div>
 <h1 className="text-xl font-bold tracking-tight text-vj-txt">
 🗺️ {itinerary.title}
 </h1>
 <div className="flex items-center gap-2 mt-0.5">
 <Badge variant="outline" className="text-xs text-vj-txt3">
 {mappedStops.length} paradas
 </Badge>
 {itinerary.is_public ? (
 <Badge className="bg-emerald-500/10 text-emerald-600 text-xs border-0">Público</Badge>
 ) : (
 <Badge variant="secondary" className="text-xs">Rascunho</Badge>
 )}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 className="hidden sm:flex"
 onClick={() => window.open(`/roteiro/${itinerary.public_token}`, '_blank')}
 >
 Preview Público
 </Button>
 </div>
 </div>

 {/* AI Chat Bar */}
 <div className="bg-vj-green/5 border border-vj-green/20 rounded-2xl p-2 md:p-3 shrink-0 flex items-center gap-3">
 <div className="bg-vj-green/10 p-2 rounded-xl text-vj-green hidden md:flex">
 <Sparkles className="w-5 h-5" />
 </div>
 <Input
 placeholder="Descreva a viagem e a IA criará o roteiro e o mapa automaticamente…"
 className="border-0 bg-transparent focus-visible:ring-0 px-0 md:px-2 text-sm placeholder:text-vj-txt3"
 value={prompt}
 onChange={(e) => setPrompt(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && !generateAILoading && handleGenerate()}
 disabled={generateAILoading}
 />
 <Button
 onClick={handleGenerate}
 disabled={generateAILoading || !prompt.trim()}
 className="rounded-xl px-5 shrink-0"
 >
 {generateAILoading ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Send className="w-4 h-4 mr-2" />
 )}
 {generateAILoading ? 'Gerando…' : 'Gerar'}
 </Button>
 </div>

 {/* Split View — flex-1 fills remaining height */}
 <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-vj-border">
 {isStopsLoading ? (
 <div className="absolute inset-0 flex items-center justify-center bg-vj-bg/50 backdrop-blur-sm z-10">
 <Loader2 className="w-8 h-8 animate-spin text-vj-green" />
 </div>
 ) : (
 <ItinerarySplitView stops={mappedStops} isEditable className="h-full border-0 rounded-none" />
 )}
 </div>
 </div>
 </AppLayout>
 );
}
