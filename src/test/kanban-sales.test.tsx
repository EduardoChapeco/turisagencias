import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/pages/KanbanCardPage', () => ({
  default: () => null,
}));

vi.mock('@/hooks/useKanbanBoards', () => ({
  useKanbanBoard: () => ({
    isLoading: false,
    data: {
      board: { id: 'board-1', slug: 'sales', name: 'Funil' },
      columns: [
        { id: 'col-1', board_id: 'board-1', name: 'Novo Lead', position: 0, color: '#6B7280' },
      ],
      cards: [
        {
          id: 'card-1',
          board_id: 'board-1',
          column_id: 'col-1',
          title: 'Lead em auditoria',
          description: null,
          estimated_value: null,
          whatsapp: null,
          email: null,
          tags: [],
          client_id: null,
          quotation_id: null,
          trip_id: null,
          group_trip_id: null,
          assigned_to: null,
          meta: {},
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  }),
  useCreateKanbanCard: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateKanbanCard: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useEnsureDefaultBoards: () => ({ mutate: vi.fn(), isPending: false }),
  useKanbanRealtime: () => undefined,
}));

import KanbanBoard from '@/pages/KanbanBoard';

describe('Sales Kanban', () => {
  it('keeps the board as the first experience and does not render the large AI assistant block', () => {
    render(
      <MemoryRouter initialEntries={['/kanban/sales']}>
        <KanbanBoard />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /funil de vendas/i })).toBeInTheDocument();
    expect(screen.queryByText(/prioridades comerciais/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/lead r.pida ia/i)).not.toBeInTheDocument();
    expect(screen.getByText(/lead em auditoria/i)).toBeInTheDocument();
    expect(screen.getByText(/frio/i)).toBeInTheDocument();
    expect(screen.getByText(/sem valor/i)).toBeInTheDocument();
  });
});
