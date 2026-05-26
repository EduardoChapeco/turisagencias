import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MediaPicker } from '@/components/builder/MediaPicker';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url' } }),
      }),
    },
  },
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    organization: { id: 'org-123' },
  }),
}));

describe('MediaPicker Component', () => {
  it('renders presets tab and updates search input when AI suggestion is clicked', () => {
    const onChange = vi.fn();
    render(<MediaPicker value="" onChange={onChange} blockKind="hero" />);

    // Click on the presets library tab
    const presetTab = screen.getByRole('button', { name: /biblioteca/i });
    fireEvent.click(presetTab);

    // Verify AI suggestion chips are displayed
    expect(screen.getByText(/Sugestões de Busca IA:/i)).toBeInTheDocument();
    
    // Find the chip with "Resort"
    const chip = screen.getByRole('button', { name: 'Resort' });
    expect(chip).toBeInTheDocument();

    // Click the chip
    fireEvent.click(chip);

    // Verify search input value changes to "Resort"
    const searchInput = screen.getByPlaceholderText('Pesquisar...') as HTMLInputElement;
    expect(searchInput.value).toBe('Resort');
  });
});
