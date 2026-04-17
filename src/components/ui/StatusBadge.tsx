import { cn } from '@/lib/utils';

/**
 * StatusBadge — Badge semântico com 5 variantes + dot indicator.
 *
 * Uso:
 * <StatusBadge variant="success">Confirmada</StatusBadge>
 * <StatusBadge variant="warning">Pendente</StatusBadge>
 * <StatusBadge variant="danger">Cancelada</StatusBadge>
 * <StatusBadge variant="info">Em análise</StatusBadge>
 * <StatusBadge variant="neutral">Rascunho</StatusBadge>
 */

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  /** Exibe o indicador com ponto pulsante (apenas para "ativo") */
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-vj-green-bg text-vj-green border-vj-green/20 ',
  warning: 'bg-vj-orange-bg text-vj-orange border-vj-orange/20 ',
  danger:  'bg-vj-red-bg  text-vj-red  border-vj-red/20 ',
  info:    'bg-vj-blue-bg text-vj-blue border-vj-blue/20 ',
  neutral: 'bg-vj-bg text-vj-txt3 border-vj-border',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-vj-green',
  warning: 'bg-vj-orange',
  danger:  'bg-vj-red',
  info:    'bg-vj-blue',
  neutral: 'bg-cb-muted',
};

export function StatusBadge({ variant, children, pulse = false, size = 'sm', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full font-medium tracking-tight whitespace-nowrap transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        variantStyles[variant],
        className,
      )}
    >
      <span
        className={cn(
          'shrink-0 rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          dotStyles[variant],
          pulse && 'animate-pulse',
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

/**
 * mapStatusToVariant — converte strings de status de negócio para variante semântica.
 * Expanda conforme novas tabelas.
 */
export function mapStatusToVariant(status: string): StatusVariant {
  const s = status.toLowerCase();
  if (['confirmada', 'confirmado', 'pago', 'ativo', 'ativa', 'concluída', 'concluido', 'published', 'active'].includes(s)) return 'success';
  if (['pendente', 'em_andamento', 'em andamento', 'aguardando', 'processing', 'pending'].includes(s)) return 'warning';
  if (['cancelada', 'cancelado', 'recusado', 'expirado', 'cancelled', 'canceled', 'rejected'].includes(s)) return 'danger';
  if (['rascunho', 'draft', 'novo', 'new', 'aberto', 'open'].includes(s)) return 'neutral';
  if (['em_análise', 'revisao', 'review', 'info'].includes(s)) return 'info';
  return 'neutral';
}
