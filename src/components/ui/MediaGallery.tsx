import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
          className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-vj-bg border border-vj-border hover:border-vj-green/50 transition-all duration-300 shadow-sm hover:shadow-md"
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

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedIndex !== null && (
              <>
                <img 
                  src={images[selectedIndex]} 
                  alt="Lightbox" 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
                />
                
                <button 
                  onClick={prev}
                  className="absolute left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                
                <button 
                  onClick={next}
                  className="absolute right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 text-white text-sm backdrop-blur-md">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
