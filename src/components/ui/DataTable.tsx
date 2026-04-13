import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * DataTable — Tabela padronizada CloudBlock com toolbar de busca.
 *
 * Uso:
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Nome', render: (row) => row.name },
 *     { key: 'status', header: 'Status', render: (row) => <StatusBadge ... /> },
 *   ]}
 *   data={clients}
 *   isLoading={isLoading}
 *   emptyIcon={Users}
 *   emptyTitle="Nenhum cliente"
 *   onRowClick={(row) => navigate(`/clients/${row.id}`)}
 *   actions={<Button>+ Novo</Button>}
 *   searchPlaceholder="Buscar clientes..."
 *   onSearch={setSearch}
 * />
 */

export interface DataTableColumn<T> {
  key: string;
  header: string;
  /** Largura relativa (tailwind width class, e.g. 'w-24', 'w-1/3') */
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: React.ElementType;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Conteúdo adicional no toolbar (botões de filtro, etc.) */
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  /** Mostra/esconde o toolbar*/
  showToolbar?: boolean;
  className?: string;
}

const alignMap: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-vj-bg animate-pulse" style={{ width: `${60 + (i * 20) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyIcon,
  emptyTitle = 'Nenhum resultado',
  emptyDescription,
  emptyAction,
  onRowClick,
  actions,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearch,
  showToolbar = true,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('data-table-wrapper', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="data-table-toolbar">
          {onSearch !== undefined ? (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-vj-txt3 pointer-events-none" />
              <Input
                id="data-table-search"
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-8 h-8 text-sm border-vj-border bg-white"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-vj-txt3 hover:text-vj-txt"
                  aria-label="Limpar busca"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ) : (
            <div />
          )}
          {actions && (
            <div className="flex items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vj-border bg-vj-bg">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 font-semibold text-xs text-vj-txt3 uppercase tracking-wide',
                    col.width ?? '',
                    alignMap[col.align ?? 'left'],
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cb-border">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <RowSkeleton key={i} cols={columns.length} />
                ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                    />
                  </td>
                </tr>
              )
              : data.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors duration-100',
                    onRowClick ? 'cursor-pointer hover:bg-vj-bg' : '',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-vj-txt',
                        alignMap[col.align ?? 'left'],
                      )}
                    >
                      {col.render(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
