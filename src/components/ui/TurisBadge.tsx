import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurisBadgeProps {
  className?: string;
  position?: 'fixed' | 'inline';
}

/**
 * TurisBadge — badge "Criado com Turis Agências" para páginas públicas.
 * position="fixed" → barra fixa no rodapé da página.
 * position="inline" → renderiza inline (ex: dentro de um container).
 */
export function TurisBadge({ className, position = 'fixed' }: TurisBadgeProps) {
  if (position === 'fixed') {
    return (
      <div className={cn('fixed bottom-0 left-0 right-0 z-50 flex justify-center py-2 bg-white/90 backdrop-blur-sm border-t border-zinc-100', className)}>
        <a
          href="https://turisagencias.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <Globe className="h-3 w-3" />
          Criado com <span className="font-semibold text-zinc-600">Turis Agências</span>
        </a>
      </div>
    );
  }

  return (
    <a
      href="https://turisagencias.com.br"
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-500 transition-colors', className)}
    >
      <Globe className="h-3 w-3" />
      Criado com <span className="font-semibold">Turis Agências</span>
    </a>
  );
}
