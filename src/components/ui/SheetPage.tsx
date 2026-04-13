import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * SheetPage — Shell 70vw padronizado para formulários de edição.
 *
 * Uso:
 * <SheetPage
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Editar Cliente"
 *   sections={[
 *     { id: 'dados', label: 'Dados Gerais', icon: User },
 *     { id: 'docs', label: 'Documentos', icon: FileText },
 *   ]}
 *   footer={<Button onClick={handleSave}>Salvar</Button>}
 * >
 *   {(activeSection) => (
 *     <>
 *       {activeSection === 'dados' && <DadosForm />}
 *       {activeSection === 'docs' && <DocsForm />}
 *     </>
 *   )}
 * </SheetPage>
 */

export interface SheetSection {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface SheetPageProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  /** Seções da sidebar vertical (deixe vazio para sem sidebar) */
  sections?: SheetSection[];
  /** Render prop — recebe o activeSection atual */
  children: ((activeSection: string) => React.ReactNode) | React.ReactNode;
  /** Conteúdo da área de footer (botões, etc.) */
  footer?: React.ReactNode;
  /** ID inicial da seção ativa */
  defaultSection?: string;
  className?: string;
}

export function SheetPage({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  sections = [],
  children,
  footer,
  defaultSection,
  className,
}: SheetPageProps) {
  const [activeSection, setActiveSection] = useState<string>(
    defaultSection ?? sections[0]?.id ?? '',
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const hasSidebar = sections.length > 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-page-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-cb-text/40 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative flex flex-col z-10',
          'w-[min(70vw,_900px)] h-full',
          'bg-white border-l border-vj-border',
          'cb-animate-slide',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-vj-border flex-shrink-0">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-cb-md bg-vj-bg border border-vj-border text-vj-txt3">
              <Icon size={18} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 id="sheet-page-title" className="font-heading font-semibold text-base text-vj-txt leading-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-vj-txt3 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-vj-txt3 hover:text-vj-txt"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Body */}
        <div
          className={cn(
            'flex flex-1 min-h-0',
            hasSidebar && 'grid grid-cols-[200px_1fr]',
          )}
        >
          {/* Sidebar (opcional) */}
          {hasSidebar && (
            <nav
              className="border-r border-vj-border bg-vj-bg p-2 flex flex-col gap-0.5 overflow-y-auto"
              aria-label="Seções"
            >
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 rounded-cb-md text-sm font-medium transition-colors duration-100 text-left',
                      isActive
                        ? 'bg-vj-green/10 text-vj-green font-semibold'
                        : 'text-vj-txt3 hover:bg-vj-bg hover:text-vj-txt',
                    )}
                  >
                    {SectionIcon && <SectionIcon size={15} className="shrink-0" />}
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Content */}
          <div className="overflow-y-auto p-6">
            {typeof children === 'function' ? children(activeSection) : children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-vj-border flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
