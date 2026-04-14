import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageHeader — Cabeçalho padronizado de páginas Turis Agencias.
 *
 * Uso:
 * <PageHeader
 *   title="Clientes"
 *   description="Gerencie seus clientes e viajantes"
 *   icon={Users}
 *   actions={<Button>+ Novo</Button>}
 *   breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Clientes' }]}
 * />
 */

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  /** Badge/chip exibido ao lado do título */
  badge?: React.ReactNode;
  /** Back navigation link */
  backTo?: string;
  backToLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  badge,
  backTo,
  backToLabel,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-vj-border mb-6', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cb-md bg-vj-bg border border-vj-border text-vj-txt3 mt-0.5">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 text-xs text-vj-txt3 mb-1" aria-label="Breadcrumb">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="opacity-40">/</span>}
                  {item.href || item.onClick ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="hover:text-vj-txt transition-colors"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className="text-vj-txt font-medium">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-heading font-bold text-2xl text-vj-txt leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-vj-txt3 mt-1 leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

