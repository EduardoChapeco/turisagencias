import React from 'react';
import { Grid3X3, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const GalleryBentoGridBlock = {
 type: 'gallery_bento_grid',
 category: 'media',
 label: 'Bento Grid',
 icon: Grid3X3,
 defaultProps: {
 images: [
 { url: 'https://images.unsplash.com/photo-1542259009477-d625272157b7', alt: 'Image 1' },
 { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', alt: 'Image 2' },
 { url: 'https://images.unsplash.com/photo-1499678329028-1014352cac0e', alt: 'Image 3' },
 { url: 'https://images.unsplash.com/photo-1506744626753-140285375241', alt: 'Image 4' },
 ],
 gap: '16px'
 },
 defaultStyles: {
 padding: '24px 0',
 backgroundColor: '#ffffff'
 },
 renderComponent: ({ node }) => {
 const { images = [], gap = '16px' } = node.props || {};

 return (
 <div style={node.styles} className="w-full">
 {images.length === 0 ? (
 <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full min-h-[300px]">
 <div className="text-center text-gray-500">
 <Grid3X3 className="mx-auto h-12 w-12 mb-2 opacity-50" />
 <p>Adicione imagens ao Bento Grid</p>
 </div>
 </div>
 ) : (
 <div 
 className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 w-full max-w-6xl mx-auto"
 style={{ gap }}
 >
 {images.map((img: any, idx: number) => {
 // Lógica de classes para simular um layout Bento bonito (1ª maior, outras menores)
 let bentoClass = 'rounded-xl overflow-hidden relative group';
 
 if (idx === 0) {
 bentoClass += ' md:col-span-2 md:row-span-2 aspect-square md:aspect-auto h-full min-h-[300px] md:min-h-[500px]';
 } else if (idx === 1) {
 bentoClass += ' md:col-span-2 aspect-video md:aspect-auto h-full min-h-[200px] md:min-h-[242px]';
 } else {
 bentoClass += ' aspect-square md:aspect-auto h-full min-h-[200px] md:min-h-[242px]';
 }

 return (
 <div key={idx} className={bentoClass}>
 <img 
 src={img.url} 
 alt={img.alt} 
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 />
 {img.alt && (
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
 <span className="text-white font-medium text-sm drop-shadow-md">{img.alt}</span>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 const { images = [], gap = '16px' } = node.props || {};

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
 <div className="space-y-2">
 <Label>Espaçamento (Gap)</Label>
 <Input 
 value={gap}
 onChange={(e) => onChange({ props: { ...node.props, gap: e.target.value } })}
 placeholder="Ex: 16px"
 />
 </div>

 <div className="space-y-2">
 <Label className="flex items-center justify-between">
 Imagens
 <Button variant="ghost" size="sm" onClick={addImage}><Plus className="h-4 w-4" /></Button>
 </Label>
 
 <div className="space-y-3">
 {images.map((img: any, idx: number) => (
 <div key={idx} className="flex flex-col gap-2 p-2 border rounded relative bg-gray-50">
 <div className="text-[10px] font-bold text-gray-400 absolute top-2 left-2">
 #{idx + 1} {idx === 0 ? '(Destaque)' : ''}
 </div>
 <Button 
 variant="ghost" 
 size="sm" 
 className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
 onClick={() => removeImage(idx)}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 <div className="space-y-1 mt-5">
 <Label className="text-xs">URL da Imagem</Label>
 <Input 
 className="h-8 text-sm"
 value={img.url} 
 onChange={e => updateImage(idx, 'url', e.target.value)} 
 placeholder="https://..."
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs">Texto / Alt</Label>
 <Input 
 className="h-8 text-sm"
 value={img.alt} 
 onChange={e => updateImage(idx, 'alt', e.target.value)} 
 />
 </div>
 </div>
 ))}
 {images.length === 0 && <p className="text-xs text-gray-500">Nenhuma imagem. Recomendado: 4 imagens.</p>}
 </div>
 </div>
 </div>
 );
 }
};
