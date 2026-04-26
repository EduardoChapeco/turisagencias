import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  createTicket: vi.fn(),
}));

vi.mock('@/components/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/TicketDetailSheet', () => ({
  TicketDetailSheet: () => null,
}));

vi.mock('@/hooks/useTickets', () => ({
  useTickets: () => ({ data: [], isLoading: false }),
  useCreateTicket: () => ({
    mutateAsync: mocks.createTicket,
    isPending: false,
  }),
}));

vi.mock('@/hooks/useTeam', () => ({
  useTeamMembers: () => ({ data: [] }),
}));

vi.mock('@/hooks/useGroupTrips', () => ({
  useGroupTrips: () => ({ data: [{ id: 'trip-1', title: 'Paris Maio' }] }),
}));

vi.mock('@/components/ui/ClientSearchSelect', () => ({
  ClientSearchSelect: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('client-1')}>
      Selecionar Maria
    </button>
  ),
}));

import Tickets from '@/pages/Tickets';

describe('Tickets', () => {
  beforeEach(() => {
    mocks.createTicket.mockReset();
    mocks.createTicket.mockResolvedValue({ id: 'ticket-1' });
  });

  it('renders and opens the create SheetPage without ClientSearchSelect reference errors', () => {
    render(<Tickets />);

    fireEvent.click(screen.getByRole('button', { name: /novo protocolo/i }));

    expect(screen.getByRole('dialog')).toHaveTextContent(/novo protocolo/i);
    expect(screen.getByRole('button', { name: /v.nculo/i })).toBeInTheDocument();
  });

  it('saves client_id when a ticket is created with a linked client', async () => {
    render(<Tickets />);

    fireEvent.click(screen.getByRole('button', { name: /novo protocolo/i }));
    fireEvent.change(screen.getByPlaceholderText(/cancelamento de voo/i), {
      target: { value: 'Atendimento com cliente vinculado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /v.nculo/i }));
    fireEvent.click(screen.getByRole('button', { name: /selecionar maria/i }));
    fireEvent.click(screen.getByRole('button', { name: /abrir protocolo/i }));

    await waitFor(() => {
      expect(mocks.createTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Atendimento com cliente vinculado',
          client_id: 'client-1',
        }),
      );
    });
  });
});
