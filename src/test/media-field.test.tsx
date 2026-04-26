import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://storage.test/file.jpg' } }),
      }),
    },
  },
}));

describe('Media upload fields', () => {
  it('keeps image adjustment inline instead of rendering a dialog portal', () => {
    const { container } = render(
      <div data-testid="sheet-content">
        <ImageCropperModal
          open
          imageUrl="data:image/png;base64,iVBORw0KGgo="
          onOpenChange={vi.fn()}
          onCropComplete={vi.fn()}
        />
      </div>,
    );

    const sheetContent = screen.getByTestId('sheet-content');
    expect(sheetContent).toHaveTextContent(/ajustar imagem/i);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('defaults to local upload and keeps external URLs as an advanced option', () => {
    render(<MediaUploader existingUrls={[]} onUploadComplete={vi.fn()} folder="audit" />);

    expect(screen.getByText(/upload/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /usar link externo/i })).toBeInTheDocument();
  });

  it('accepts external URLs only through the advanced action', async () => {
    const onUploadComplete = vi.fn();
    render(<MediaUploader existingUrls={[]} onUploadComplete={onUploadComplete} folder="audit" />);

    fireEvent.click(screen.getByRole('button', { name: /usar link externo/i }));
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com/foto.jpg' },
    });
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith(['https://example.com/foto.jpg']);
    });
  });
});
