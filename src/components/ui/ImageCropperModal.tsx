import { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ImageCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (url: string) => void;
  aspectRatio?: number;
  circular?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropperModal({ open, onOpenChange, imageUrl, onCropComplete, aspectRatio = 1, circular = false }: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  const generateCroppedImage = async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const offscreen = document.createElement('canvas');
    offscreen.width = completedCrop.width * scaleX;
    offscreen.height = completedCrop.height * scaleY;
    const ctx = offscreen.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height
    );

    return new Promise((resolve) => {
      offscreen.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const blob = await generateCroppedImage();
      if (!blob) throw new Error("Erro ao processar imagem");

      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const filePath = `avatars/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onCropComplete(publicUrl);
      onOpenChange(false);
      toast({ title: 'Foto recortada e salva com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-vj-bg border-vj-border p-6 rounded-vj-xl">
        <DialogHeader>
          <DialogTitle className="text-vj-txt text-lg">Ajuste de Imagem</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center gap-6 mt-4 w-full">
          <div className="overflow-hidden bg-black/5 rounded-vj-lg w-full flex items-center justify-center" style={{ maxHeight: '60vh' }}>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circular}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                style={{ transform: `scale(${scale})`, transition: 'transform 0.1s', maxHeight: '50vh', objectFit: 'contain' }}
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          </div>

          <div className="w-full space-y-3">
            <div className="text-sm text-vj-txt2 font-medium">Zoom</div>
            <Slider
              value={[scale]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={(v) => setScale(v[0])}
              className="w-full"
            />
          </div>

          <div className="w-full flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-vj-md border-vj-border">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={uploading || !completedCrop} className="bg-vj-green text-white hover:bg-vj-green-light rounded-vj-md min-w-[120px]">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
