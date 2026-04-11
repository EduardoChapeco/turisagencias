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
  success: 'bg-cb-success/10 text-cb-success border-cb-success/20',
  warning: 'bg-cb-warning/10 text-cb-warning border-cb-warning/20',
  danger:  'bg-cb-danger/10  text-cb-danger  border-cb-danger/20',
  info:    'bg-cb-info/10    text-cb-info    border-cb-info/20',
  neutral: 'bg-cb-s2        text-cb-muted   border-cb-border',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-cb-success',
  warning: 'bg-cb-warning',
  danger:  'bg-cb-danger',
  info:    'bg-cb-info',
  neutral: 'bg-cb-muted',
};

export function StatusBadge({ variant, children, pulse = false, size = 'sm', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
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
