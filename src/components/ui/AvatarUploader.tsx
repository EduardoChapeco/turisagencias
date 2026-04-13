import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

export function AvatarUploader({ url, onUpload, fallbackName }: { url?: string; onUpload: (url: string) => void; fallbackName?: string }) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropSrc(reader.result?.toString() || null));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (newUrl: string) => {
    onUpload(newUrl);
    setCropSrc(null);
  };

  return (
    <>
      <div 
        className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-vj-border bg-vj-surface flex items-center justify-center flex-shrink-0 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-vj-green/50">
            {(fallbackName?.[0] || '?').toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="text-white h-6 w-6" />
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {cropSrc && (
        <ImageCropperModal
          open={!!cropSrc}
          onOpenChange={(v) => !v && setCropSrc(null)}
          imageUrl={cropSrc}
          onCropComplete={handleCropComplete}
          circular={true}
          aspectRatio={1}
        />
      )}
    </>
  );
}
