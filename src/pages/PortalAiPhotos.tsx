import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Image as ImageIcon, Upload, Loader2, Sparkles, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
const motion = { div: 'div' as Record<string, any> }; // framer-motion placeholder

const AI_STYLES = [
  { id: 'pixel_art', name: 'Pixel Art', desc: 'Estilo retro 8-bits' },
  { id: 'watercolor', name: 'Aquarela', desc: 'Pintura suave em aquarela' },
  { id: 'vintage_poster', name: 'Pôster Vintage', desc: 'Cartaz de viagem clássico' },
  { id: 'anime', name: 'Anime', desc: 'Animação japonesa' },
  { id: 'ghibli', name: 'Studio Ghibli', desc: 'Fantasia caprichosa e mágica' },
  { id: 'disney', name: 'Disney 3D', desc: 'Personagem de filme de animação 3D' },
];

export default function PortalAiPhotos() {
  const { org_slug, trip_id } = useParams<{ org_slug: string; trip_id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>(AI_STYLES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);

  // Load user data and available credits ideally
  // In a real scenario, check if the client has generated < X photos for this trip

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImgUrl(null); // Reset previous generation
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      // 1. Upload original image to Supabase Storage Bucket
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `ai-generations/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(filePath, selectedImage);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl: originalUrl } } = supabase.storage
        .from('client-photos')
        .getPublicUrl(filePath);

      // 2. Save generation record in `portal_ai_photos` table
      const { data: record, error: insertError } = await supabase
        .from('portal_ai_photos')
        .insert({
          org_id: user.organization_id || undefined,
          trip_id: trip_id || undefined,
          original_url: originalUrl,
          style: selectedStyle,
          status: 'pending',
          provider: 'system_simulation'
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // 3. Delay to simulate AI generation time
      await new Promise(r => setTimeout(r, 4000));
      
      // 4. MOCK RESULT and update the database record
      const mockResultUrl = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1000&auto=format&fit=crop"; 
      
      await supabase
        .from('portal_ai_photos')
        .update({
          status: 'completed',
          result_url: mockResultUrl
        })
        .eq('id', record.id);
        
      setGeneratedImgUrl(mockResultUrl);

      toast({
        title: "Magia concluída!",
        description: "Sua foto foi transformada com sucesso e salva no histórico.",
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na geração",
        description: error.message || "Não foi possível transformar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImgUrl) return;
    const link = document.createElement('a');
    link.href = generatedImgUrl;
    link.download = `ai-photo-${selectedStyle}.jpg`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950/20 overflow-y-auto">
      <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        <PageHeader 
          title="Transforme suas Fotos" 
          description="Transforme as memórias da sua viagem em estilos únicos de Arte!"
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* Upload and Selection Side */}
          <div className="space-y-6">
            <Card className="p-6 border-dashed border-2 border-vj-border/60 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-colors">
              <div className="flex flex-col items-center justify-center text-center px-4 py-8 relative">
                {previewUrl ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden group">
                    <img src={previewUrl} alt="Original" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" onClick={() => document.getElementById('photo-upload')?.click()}>
                        Trocar Foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-vj-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-vj-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Envie uma Foto</h3>
                    <p className="text-sm text-vj-txt3 mb-6 max-w-[250px]">
                      Pode ser uma selfie ou uma paisagem da sua viagem!
                    </p>
                    <Button onClick={() => document.getElementById('photo-upload')?.click()}>
                      Procurar no dispositivo
                    </Button>
                  </>
                )}
                <input 
                  type="file" 
                  id="photo-upload" 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleImageUpload}
                />
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-semibold text-vj-txt">Escolha o Estilo (Magia)</h3>
              <div className="grid grid-cols-2 gap-3">
                {AI_STYLES.map((style) => (
                  <div 
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`cursor-pointer min-h-[80px] p-3 rounded-xl border transition-all flex flex-col justify-center ${selectedStyle === style.id ? 'border-vj-primary bg-vj-primary/5 ring-1 ring-vj-primary ' : 'border-vj-border bg-white dark:bg-zinc-950 hover:border-vj-primary/30'}`}
                  >
                    <div className="font-medium text-sm text-vj-txt">{style.name}</div>
                    <div className="text-xs text-vj-txt3 leading-tight mt-1">{style.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 "
              disabled={!selectedImage || isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando Arte...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Transformar Foto Mágica</>
              )}
            </Button>
          </div>

          {/* Result Side */}
          <div className="h-full flex flex-col justify-center">
             <Card className="min-h-[500px] h-full flex flex-col border-vj-border/60 bg-white/50 dark:bg-zinc-900/50 overflow-hidden relative">
                {generatedImgUrl ? (
                  <>
                     <div className="flex-1 w-full relative">
                        <img src={generatedImgUrl} alt="AI Generated" className="absolute inset-0 w-full h-full object-contain bg-black/90" />
                     </div>
                     <div className="p-4 bg-white dark:bg-zinc-950 border-t flex justify-between items-center z-10 shrink-0">
                        <div>
                           <p className="font-medium text-sm text-vj-txt">Transformação Concluída</p>
                           <p className="text-xs text-vj-txt3 text-left">Estilo {AI_STYLES.find(s => s.id === selectedStyle)?.name}</p>
                        </div>
                        <Button variant="default" onClick={downloadImage}>
                          <Download className="mr-2 h-4 w-4" /> Baixar Imagem
                        </Button>
                     </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                     <div className="relative">
                        <ImageIcon className="w-24 h-24 text-vj-border mb-4" />
                        {isGenerating && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Loader2 className="w-12 h-12 text-vj-primary animate-spin" />
                           </div>
                        )}
                     </div>
                     
                     <h3 className="font-semibold text-xl mb-2 text-vj-txt">
                       {isGenerating ? 'A magia está acontecendo...' : 'Sua Arte Aparecerá Aqui'}
                     </h3>
                     <p className="text-vj-txt3 text-sm max-w-[280px]">
                       {isGenerating 
                         ? 'A inteligência artificial está pintando cada pixel baseada na sua foto e estilo. Aguarde uns instantes.' 
                         : 'Faça upload de uma imagem e selecione um estilo ao lado para começar gerar.'}
                     </p>
                  </div>
                )}
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
