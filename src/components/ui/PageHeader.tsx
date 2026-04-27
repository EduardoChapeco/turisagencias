import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePageInfo } from '@/contexts/PageInfoContext';

// Context mantido para retrocompatibilidade
export const PageHeaderPortalContext = React.createContext<HTMLElement | null | undefined>(undefined);

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string; onClick?: () => void }[];
  badge?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader v3
 *
 * - Registra title/description/icon no PageInfoContext → AppLayout exibe no header global
 * - Renderiza apenas a barra de ações (botões) no conteúdo da página
 * - Zero título duplicado no conteúdo
 */
export function PageHeader({
  title,
  description,
  icon,
  actions,
  breadcrumb,
  badge,
  className,
}: PageHeaderProps) {
  const { setPageInfo } = usePageInfo();

  // Atualiza o context quando a página muda
  useEffect(() => {
    setPageInfo({ title, description, icon });
    return () => setPageInfo(null);
  }, [title, description, icon, setPageInfo]);

  // Se não há ações nem badge, não renderiza nada no conteúdo
  if (!actions && !badge && !breadcrumb) return null;

  return (
    <div className={cn('page-header', className)}>
      {/* Esquerda: breadcrumb + badge */}
      <div className="page-header-left">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="page-header-breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="opacity-30">/</span>}
                <span
                  className={item.onClick ? 'cursor-pointer hover:text-vj-green transition-colors' : ''}
                  onClick={item.onClick}
                >
                  {item.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Direita: botões de ação */}
      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
