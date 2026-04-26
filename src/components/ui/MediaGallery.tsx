import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  images: string[];
  className?: string;
}

export function MediaGallery({ images, className }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const next = () => setSelectedIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
  const prev = () => setSelectedIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {images.map((src, index) => (
        <div 
          key={src + index}
          className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-vj-bg border border-vj-border hover:border-vj-green/50 transition-all duration-300  hover:"
          onClick={() => openLightbox(index)}
        >
          <img 
            src={src} 
            alt={`Gallery item ${index + 1}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6" />
          </div>
        </div>
      ))}

      {selectedIndex !== null && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-50"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={images[selectedIndex]}
              alt="Lightbox"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            />

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 text-white text-sm backdrop-blur-md">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
