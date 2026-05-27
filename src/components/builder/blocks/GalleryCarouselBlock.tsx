import React, { useState } from 'react';
import { Columns, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const GalleryCarouselBlock = {
  type: 'gallery_carousel',
  category: 'media',
  label: 'Image Carousel',
  icon: Columns,
  defaultProps: {
    images: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', alt: 'Beach' },
      { url: 'https://images.unsplash.com/photo-1499678329028-1014352cac0e', alt: 'Mountain' },
    ],
    showControls: true
  },
  defaultStyles: {
    padding: '24px',
    backgroundColor: '#ffffff'
  },
  renderComponent: ({ node }) => {
    const { images = [], showControls = true } = node.props || {};
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div style={node.styles} className="w-full relative overflow-hidden group">
        {images.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
            <div className="text-center text-gray-500">
              <Columns className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Adicione imagens ao carrossel</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[400px]">
            <img 
              src={images[currentIndex]?.url} 
              alt={images[currentIndex]?.alt}
              className="w-full h-full object-cover transition-opacity duration-500 rounded-lg shadow-sm"
            />
            {showControls && images.length > 1 && (
              <>
                <button 
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button 
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const { images = [], showControls = true } = node.props || {};

    const addImage = () => {
      onChange({ props: { ...node.props, images: [...images, { url: '', alt: '' }] } });
    };

    const updateImage = (index: number, field: string, value: string) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      onChange({ props: { ...node.props, images: newImages } });
    };

    const removeImage = (index: number) => {
      onChange({ props: { ...node.props, images: images.filter((_: any, i: number) => i !== index) } });
    };

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="showControls"
            checked={showControls}
            onChange={(e) => onChange({ props: { ...node.props, showControls: e.target.checked } })}
          />
          <Label htmlFor="showControls">Mostrar setas e indicadores</Label>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            Imagens
            <Button variant="ghost" size="sm" onClick={addImage}><Plus className="h-4 w-4" /></Button>
          </Label>
          
          <div className="space-y-3">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-2 border rounded relative bg-gray-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeImage(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="space-y-1 mt-4">
                  <Label className="text-xs">URL da Imagem</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={img.url} 
                    onChange={e => updateImage(idx, 'url', e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};
