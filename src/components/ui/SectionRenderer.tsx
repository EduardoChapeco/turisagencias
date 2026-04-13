import React from 'react';
import { MediaGallery } from './MediaGallery';
import { MediaCarousel } from './MediaCarousel';
import { cn } from '@/lib/utils';

export type SectionType = 'text' | 'gallery' | 'carousel' | 'divider' | 'bento';

export interface contentSection {
  id: string;
  type: SectionType;
  title?: string;
  content?: string;
  items?: string[]; // Para imagens/carrossel
  layout?: 'full' | 'split' | 'centered';
}

interface SectionRendererProps {
  sections: contentSection[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-16 py-8">
      {sections.map((section) => (
        <section key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {section.title && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-vj-txt">{section.title}</h2>
              <div className="h-1 w-12 bg-vj-green rounded-full mt-2" />
            </div>
          )}

          <div className={cn(
            "w-full",
            section.layout === 'centered' && "max-w-3xl mx-auto text-center",
          )}>
            {section.type === 'text' && (
              <div className="prose prose-slate dark:prose-invert max-w-none text-vj-txt3 leading-relaxed whitespace-pre-wrap text-lg">
                {section.content}
              </div>
            )}

            {section.type === 'gallery' && (
              <MediaGallery images={section.items || []} />
            )}

            {section.type === 'carousel' && (
              <MediaCarousel images={section.items || []} />
            )}

            {section.type === 'divider' && (
              <hr className="border-vj-border" />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
