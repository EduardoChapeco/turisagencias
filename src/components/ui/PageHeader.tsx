import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SheetPage } from '@/components/ui/SheetPage';

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

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  badge,
  className,
}: PageHeaderProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const portalTarget = React.useContext(PageHeaderPortalContext);
  const isPortalAware = portalTarget !== undefined;

  const headerContent = (
    <div className={cn('flex min-w-0 flex-1 items-center justify-between gap-4 animate-in fade-in slide-in-from-left-4 duration-500', className)}>
      <div className="flex min-w-0 items-center gap-4">
        {Icon && (
          <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-vj-border bg-zinc-50 text-vj-txt3 ">
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="hidden items-center gap-1.5 text-[10px] font-bold text-vj-txt3 sm:flex mb-1 uppercase tracking-widest opacity-60" aria-label="Breadcrumb">
              {breadcrumb.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="opacity-40">/</span>}
                  <span className="truncate">{item.label}</span>
                </React.Fragment>
              ))}
            </nav>
          )}
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate font-heading text-lg font-black text-vj-txt uppercase tracking-tight sm:text-xl leading-none">
              {title}
            </h1>
            {badge && <div className="hidden shrink-0 items-center sm:flex">{badge}</div>}
            {description && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl text-vj-txt3 hover:bg-vj-green/10 hover:text-vj-green transition-all"
                onClick={() => setInfoOpen(true)}
              >
                <Info size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex h-11 min-w-0 items-center justify-end gap-3 no-scrollbar overflow-x-auto whitespace-nowrap">
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isPortalAware ? (portalTarget ? createPortal(headerContent, portalTarget) : null) : headerContent}

      {description && (
        <SheetPage
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={title}
          icon={Icon || Info}
          className="lg:w-[42vw] xl:w-[38vw]"
        >
          <div className="p-8 space-y-4 text-sm leading-relaxed text-vj-txt2 animate-in fade-in duration-500">
            <p className="font-medium">{description}</p>
          </div>
        </SheetPage>
      )}
    </>
  );
}
