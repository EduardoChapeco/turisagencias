import React from 'react';
import { cn } from '@/lib/utils';

/**
 * EmptyState — Estado vazio padronizado OMEGA v5.
 *
 * Uso:
 * <EmptyState
 *   icon={Users}
 *   title="Nenhum cliente encontrado"
 *   description="Adicione seu primeiro cliente para começar."
 *   action={<Button onClick={...}>+ Novo Cliente</Button>}
 * />
 */

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Exibe loader de conteúdo (skeletons) em vez do estado vazio */
  loading?: boolean;
  loadingRows?: number;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 px-8 text-center min-h-[280px]',
        className,
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vj-bg border border-vj-border text-vj-txt3">
          <Icon size={24} />
        </div>
      )}
      <div className="space-y-1.5 max-w-xs">
        <p className="font-bold text-base text-vj-txt3">{title}</p>
        {description && (
          <p className="text-sm text-vj-txt3/70 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ── Skeleton variant ── */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-zinc-100 animate-pulse',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** PageSkeleton — Skeleton de carregamento de página completo */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300" aria-busy="true" aria-label="Carregando...">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-vj-border">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {/* Content skeletons */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-32 rounded-2xl ${i % 3 === 0 ? 'col-span-2' : 'col-span-1'}`} />
        ))}
      </div>
    </div>
  );
}
