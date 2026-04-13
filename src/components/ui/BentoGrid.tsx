import React from 'react';
import { cn } from '@/lib/utils';

/**
 * BentoGrid — Layouts em grade Bento estilo CloudBlock.
 *
 * Uso:
 * <BentoGrid cols={3} gap="md">
 *   <BentoCell colSpan={2} rowSpan={1}>...</BentoCell>
 *   <BentoCell>...</BentoCell>
 * </BentoGrid>
 */

interface BentoGridProps {
  cols?: 1 | 2 | 3 | 4;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const gapMap: Record<string, string> = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-cb-md',
  lg: 'gap-cb-lg',
};

const colsMap: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

export function BentoGrid({ cols = 3, gap = 'md', className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full',
        colsMap[cols] ?? 'grid-cols-3',
        gapMap[gap] ?? 'gap-cb-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── BentoCell ── */

interface BentoCellProps {
  /** Quantas colunas ocupa (1–4) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Quantas linhas ocupa (1–3) */
  rowSpan?: 1 | 2 | 3;
  /** Padding interno */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Variante visual */
  variant?: 'default' | 'muted' | 'raised' | 'accent';
  className?: string;
  children: React.ReactNode;
  /** Handler de click para células interativas */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const colSpanMap: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

const rowSpanMap: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

const paddingMap: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantMap: Record<string, string> = {
  default: 'bg-white border border-vj-border',
  muted:   'bg-vj-bg border border-vj-border',
  raised:  'bg-white border border-vj-border',
  accent:  'bg-vj-green/5 border border-vj-green/20',
};

export function BentoCell({
  colSpan = 1,
  rowSpan = 1,
  padding = 'md',
  variant = 'default',
  className,
  children,
  onClick,
}: BentoCellProps) {
  return (
    <div
      className={cn(
        'rounded-cb-lg overflow-hidden transition-colors duration-200',
        colSpanMap[colSpan] ?? 'col-span-1',
        rowSpanMap[rowSpan] ?? 'row-span-1',
        paddingMap[padding],
        variantMap[variant],
        onClick && 'cursor-pointer hover:bg-vj-bg',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
