import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * LazyImage — Imagem com Intersection Observer para lazy load + skeleton.
 *
 * Uso:
 * <LazyImage
 *   src="https://..."
 *   alt="Hotel Exemplo"
 *   aspectRatio="16/9"
 *   className="rounded-cb-md"
 * />
 */

interface LazyImageProps {
  src: string;
  alt: string;
  /** Ex: "16/9", "1/1", "4/3", "3/2" */
  aspectRatio?: string;
  /** Fallback exibido em caso de erro */
  fallback?: React.ReactNode;
  className?: string;
  /** Classe adicional para o wrapper */
  wrapperClassName?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export function LazyImage({
  src,
  alt,
  aspectRatio = '16/9',
  fallback,
  className,
  wrapperClassName,
  objectFit = 'cover',
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative overflow-hidden bg-vj-bg', wrapperClassName)}
      style={{ aspectRatio }}
    >
      {/* Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-vj-bg animate-pulse" aria-hidden="true" />
      )}

      {/* Image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-vj-bg text-vj-txt3 text-xs">
          {fallback ?? <span>Imagem indisponível</span>}
        </div>
      )}
    </div>
  );
}
