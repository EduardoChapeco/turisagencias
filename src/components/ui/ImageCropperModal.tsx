import { useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Loader2, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (url: string) => void;
  aspectRatio?: number;
  circular?: boolean;
  folder?: string;
  bucket?: string;
  fileNamePrefix?: string;
  onUploaded?: (asset: {
    publicUrl: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
  }) => void | Promise<void>;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 92 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

function safeName(prefix: string) {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}.jpg`;
}

export function ImageCropperModal({
  open,
  onOpenChange,
  imageUrl,
  onCropComplete,
  aspectRatio = 1,
  circular = false,
  folder = 'avatars',
  bucket = 'media',
  fileNamePrefix = 'image',
  onUploaded,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  if (!open) return null;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  };

  const generateCroppedImage = async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement('canvas');
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingQuality = 'high';
    ctx.save();
    ctx.translate(-(completedCrop.x * scaleX), -(completedCrop.y * scaleY));
    ctx.translate(image.naturalWidth / 2, image.naturalHeight / 2);
    ctx.scale(scale, scale);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const blob = await generateCroppedImage();
      if (!blob) throw new Error('Nao foi possivel processar a imagem.');

      const filePath = `${folder.replace(/^\/+|\/+$/g, '')}/${safeName(fileNamePrefix)}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      await onUploaded?.({
        publicUrl,
        path: filePath,
        mimeType: 'image/jpeg',
        sizeBytes: blob.size,
        width: completedCrop ? Math.round(completedCrop.width) : null,
        height: completedCrop ? Math.round(completedCrop.height) : null,
      });
      onCropComplete(publicUrl);
      onOpenChange(false);
      toast({ title: 'Imagem ajustada' });
    } catch (err: any) {
      toast({ title: 'Erro ao ajustar imagem', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-vj-border bg-white ">
      <div className="flex items-center justify-between gap-3 border-b border-vj-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-bold text-vj-txt">
            <SlidersHorizontal className="h-4 w-4 text-vj-green" />
            Ajustar imagem
          </h3>
          <p className="mt-0.5 text-xs text-vj-txt3">Opcional: enquadre, ajuste o zoom e salve.</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[48dvh] overflow-auto bg-zinc-50 p-3">
        <div className="mx-auto flex max-w-3xl justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(nextCrop) => setCompletedCrop(nextCrop)}
            aspect={aspectRatio}
            circularCrop={circular}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Imagem para ajuste"
              onLoad={handleImageLoad}
              className="block max-h-[42dvh] max-w-full object-contain"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            />
          </ReactCrop>
        </div>
      </div>

      <div className="space-y-3 border-t border-vj-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-semibold uppercase text-vj-txt3">Zoom</span>
          <Slider value={[scale]} min={0.8} max={2.5} step={0.05} onValueChange={(v) => setScale(v[0])} />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale(1)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={uploading || !completedCrop}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar ajuste
          </Button>
        </div>
      </div>
    </section>
  );
}
