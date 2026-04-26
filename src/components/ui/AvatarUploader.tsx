import React, { useRef, useState } from 'react';
import { Crop } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';

interface AvatarUploaderProps {
  url?: string;
  onUpload: (url: string) => void;
  fallbackName?: string;
  folder?: string;
  bucket?: string;
}

export function AvatarUploader({ url, onUpload, fallbackName, folder = 'clients/avatars', bucket = 'media' }: AvatarUploaderProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload direto (sem crop) — centralização automática via object-fit: cover
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Se for imagem, oferece crop; caso contrário upload direto
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = (newUrl: string) => {
    onUpload(newUrl);
    setCropSrc(null);
  };

  const handleCropIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      // Abre o crop com a imagem atual
      setCropSrc(url);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <div className="relative group flex-shrink-0" style={{ width: 96, height: 96 }}>
        {/* Avatar circuler */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-vj-border bg-vj-surface flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Clique para trocar a foto"
        >
          {url ? (
            <img
              src={url}
              alt="Avatar"
              className="w-full h-full"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a7a4a', opacity: 0.5 }}>
              {(fallbackName?.[0] || '?').toUpperCase()}
            </span>
          )}
        </div>

        {/* Overlay com ícones no hover */}
        <div className="absolute inset-0 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.45)' }}>
          {/* Botão Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Trocar foto"
            className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
            style={{ color: '#1a7a4a' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>

          {/* Botão Crop (só aparece se já tem foto) */}
          {url && (
            <button
              type="button"
              onClick={handleCropIconClick}
              title="Ajustar recorte"
              className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
              style={{ color: '#1a7a4a' }}
            >
              <Crop size={14} />
            </button>
          )}
        </div>

      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Editor inline: acompanha o SheetPage e nao cria portal global. */}
      {cropSrc && (
        <ImageCropperModal
          open={!!cropSrc}
          onOpenChange={(v) => !v && setCropSrc(null)}
          imageUrl={cropSrc}
          onCropComplete={handleCropComplete}
          circular={true}
          aspectRatio={1}
          folder={folder}
          bucket={bucket}
          fileNamePrefix="avatar"
        />
      )}
    </>
  );
}
