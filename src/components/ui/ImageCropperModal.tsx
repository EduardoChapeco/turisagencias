import { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onCropComplete: (url: string) => void;
  aspectRatio?: number;
  circular?: boolean;
  folder?: string;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropperModal({
  open, onOpenChange, imageUrl, onCropComplete,
  aspectRatio = 1, circular = false, folder = 'avatars'
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
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const offscreen = document.createElement('canvas');
    offscreen.width = completedCrop.width * scaleX;
    offscreen.height = completedCrop.height * scaleY;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, offscreen.width, offscreen.height
    );
    return new Promise((resolve) => offscreen.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95));
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      const blob = await generateCroppedImage();
      if (!blob) throw new Error('Erro ao processar imagem');

      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const filePath = `${folder}/${file.name}`;

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

      onCropComplete(publicUrl);
      onOpenChange(false);
      toast({ title: '✅ Foto salva com sucesso!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // Renderiza via portal no body para garantir z-index acima de qualquer sheet/modal
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Box */}
      <div style={{
        position: 'relative', zIndex: 1, background: 'white', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)', width: '90vw', maxWidth: 520,
        display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e4e0' }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a18' }}>✂️ Ajuste a imagem</h2>
            <p style={{ margin: 0, fontSize: 11, color: '#888', marginTop: 2 }}>Recorte e ajuste o zoom conforme desejar</p>
          </div>
          <button onClick={() => onOpenChange(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4, display:'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Crop Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ed', maxHeight: '55vh', overflow: 'auto', padding: 16 }}>
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
              alt="Crop"
              style={{ transform: `scale(${scale})`, transition: 'transform 0.1s', maxHeight: '50vh', objectFit: 'contain', display: 'block' }}
              onLoad={handleImageLoad}
            />
          </ReactCrop>
        </div>

        {/* Zoom */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e4e0' }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zoom</p>
          <Slider value={[scale]} min={0.5} max={3} step={0.1} onValueChange={(v) => setScale(v[0])} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid #e5e4e0' }}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={uploading || !completedCrop}
            style={{ background: '#1a7a4a', color: 'white', minWidth: 130 }}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {uploading ? 'Salvando...' : 'Salvar Foto'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
