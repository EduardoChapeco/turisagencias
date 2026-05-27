import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { User } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';

describe('SheetPage layout contract', () => {
 it('renders as a fixed right-side page with internal sidebar, content and footer regions', () => {
 render(
 <SheetPage
 open
 onClose={vi.fn()}
 title="Auditoria"
 icon={User}
 sections={[
 { id: 'dados', label: 'Dados', icon: User },
 { id: 'vinculos', label: 'Vinculos', icon: User },
 ]}
 footer={<button type="button">Salvar</button>}
 >
 <div>Conteudo interno</div>
 </SheetPage>,
 );

 const dialog = screen.getByRole('dialog');
 const panel = dialog.querySelector('.right-0');
 const sidebar = dialog.querySelector('nav');

 expect(dialog).toHaveClass('fixed', 'inset-0', 'overflow-hidden');
 expect(panel).toHaveClass('fixed', 'inset-y-0', 'right-0', 'overflow-hidden');
 expect(panel?.className).toContain('h-[100dvh]');
 expect(sidebar).toHaveClass('md:overflow-y-auto');
 expect(screen.getByText(/conteudo interno/i)).toBeInTheDocument();
 expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
 });
});
