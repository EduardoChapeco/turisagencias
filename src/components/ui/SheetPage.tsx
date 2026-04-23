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

  // Sync internal state when defaultSection changes or sheet opens
  useEffect(() => {
    if (open) {
      setActiveSection(defaultSection ?? sections[0]?.id ?? '');
    }
  }, [open, defaultSection, sections]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  const hasSidebar = sections.length > 0;

  const portalContent = (
    <div
      className="fixed inset-0 z-[999] flex items-stretch justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative flex flex-col z-10 shadow-2xl h-screen',
          'w-full lg:w-[70vw]',
          'bg-white border-l border-vj-border',
          'animate-in slide-in-from-right duration-300',
          'rounded-none',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-vj-border flex-shrink-0 bg-white">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vj-green/10 text-vj-green border border-vj-green/20">
              <Icon size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-lg text-vj-txt leading-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-vj-txt3 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-vj-txt3 hover:text-vj-red hover:bg-vj-red/5 rounded-xl transition-all"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        <div
          className={cn(
            'flex flex-col md:flex-row flex-1 min-h-0 bg-white',
            hasSidebar && 'md:grid md:grid-cols-[240px_1fr]',
          )}
        >
          {/* Sidebar */}
          {hasSidebar && (
            <nav
              className="md:border-r border-b md:border-b-0 border-vj-border bg-zinc-50/50 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto scrollbar-none shrink-0"
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
                      'flex items-center gap-3 w-max md:w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left shrink-0',
                      isActive
                        ? 'bg-vj-green text-white shadow-lg shadow-vj-green/20'
                        : 'text-vj-txt2 hover:bg-white hover:text-vj-txt hover:shadow-sm border border-transparent hover:border-vj-border/50',
                    )}
                  >
                    {SectionIcon && <SectionIcon size={16} className={cn("shrink-0", isActive ? "text-white" : "text-vj-txt3")} />}
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Content Area */}
          <div className="overflow-y-auto w-full p-6 md:p-8 flex-1 bg-white">
            {typeof children === 'function' ? children(activeSection) : children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-vj-border flex-shrink-0 bg-white/50 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}
