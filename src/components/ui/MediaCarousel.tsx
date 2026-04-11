import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MediaCarouselProps {
  images: string[];
  aspectRatio?: "video" | "square" | "wide";
  className?: string;
  showArrows?: boolean;
}

export function MediaCarousel({ 
  images, 
  aspectRatio = "video", 
  className,
  showArrows = true 
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (!images || images.length === 0) return null;

  return (
    <div className={cn("relative group", className)}>
      <div className="overflow-hidden rounded-2xl shadow-lg border border-cb-border bg-cb-s1" ref={emblaRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div key={src + index} className="flex-[0_0_100%] min-w-0">
              <div className={cn(
                "w-full bg-cb-s2",
                aspectRatio === "video" && "aspect-video",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "wide" && "aspect-[21/9]"
              )}>
                <img 
                  src={src} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 hover:bg-white backdrop-blur-sm border-none shadow-md hidden md:flex"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5 text-cb-text" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/80 hover:bg-white backdrop-blur-sm border-none shadow-md hidden md:flex"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5 text-cb-text" />
          </Button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/20 backdrop-blur-md">
          {images.map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />
          ))}
        </div>
      )}
    </div>
  );
}
