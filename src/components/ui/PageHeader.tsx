import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SheetPage } from '@/components/ui/SheetPage';

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
  const [infoOpen, setInfoOpen] = useState(false);
  const InfoIcon = Icon ?? Info;

  return (
    <>
      <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-vj-border mb-4', className)}>
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-vj-bg border border-vj-border text-vj-txt3">
              <Icon size={17} />
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
              <h1 className="font-heading font-bold text-xl text-vj-txt leading-tight">
                {title}
              </h1>
              {badge}
              {description && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-vj-txt3 hover:text-vj-green hover:bg-vj-green/10"
                  onClick={() => setInfoOpen(true)}
                  aria-label={`Sobre ${title}`}
                  title={`Sobre ${title}`}
                >
                  <Info size={15} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {actions}
          </div>
        )}
      </div>

      {description && (
        <SheetPage
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={title}
          icon={InfoIcon}
          className="lg:w-[42vw] xl:w-[38vw]"
        >
          <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-vj-txt2">
            <p>{description}</p>
          </div>
        </SheetPage>
      )}
    </>
  );
}

