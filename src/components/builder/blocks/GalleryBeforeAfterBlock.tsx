import React, { useState, useRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const GalleryBeforeAfterBlock = {
 type: 'gallery_before_after',
 category: 'media',
 label: 'Before/After Slider',
 icon: ArrowLeftRight,
 defaultProps: {
 imageBefore: 'https://images.unsplash.com/photo-1542259009477-d625272157b7',
 imageAfter: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
 labelBefore: 'Inverno',
 labelAfter: 'Verão'
 },
 defaultStyles: {
 padding: '24px 0',
 backgroundColor: '#ffffff'
 },
 renderComponent: ({ node }) => {
 const { imageBefore, imageAfter, labelBefore, labelAfter } = node.props || {};
 const [sliderPos, setSliderPos] = useState(50);
 const containerRef = useRef<HTMLDivElement>(null);

 const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
 if (!containerRef.current) return;
 
 const { left, width } = containerRef.current.getBoundingClientRect();
 const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
 
 let pos = ((clientX - left) / width) * 100;
 pos = Math.max(0, Math.min(pos, 100)); // Clamp between 0-100
 setSliderPos(pos);
 };

 return (
 <div style={node.styles} className="w-full flex justify-center">
 {!imageBefore || !imageAfter ? (
 <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full max-w-4xl min-h-[300px]">
 <div className="text-center text-gray-500">
 <ArrowLeftRight className="mx-auto h-12 w-12 mb-2 opacity-50" />
 <p>Adicione as imagens "Antes" e "Depois"</p>
 </div>
 </div>
 ) : (
 <div 
 ref={containerRef}
 className="w-full max-w-4xl aspect-[16/9] relative rounded-xl overflow-hidden select-none cursor-ew-resize group"
 onMouseMove={(e) => e.buttons === 1 && handleMove(e)}
 onTouchMove={handleMove}
 onMouseDown={handleMove}
 >
 {/* Imagem AFTER (Fundo Completo) */}
 <div className="absolute inset-0">
 <img src={imageAfter} alt={labelAfter} className="w-full h-full object-cover" draggable={false} />
 {labelAfter && (
 <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 text-sm font-bold rounded-md backdrop-blur-sm ">
 {labelAfter}
 </div>
 )}
 </div>

 {/* Imagem BEFORE (Corta com clip-path) */}
 <div 
 className="absolute inset-0 border-r-2 border-white"
 style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
 >
 <img src={imageBefore} alt={labelBefore} className="w-full h-full object-cover" draggable={false} />
 {labelBefore && (
 <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 text-sm font-bold rounded-md backdrop-blur-sm ">
 {labelBefore}
 </div>
 )}
 </div>

 {/* Handle do Slider */}
 <div 
 className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
 style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
 >
 <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center _0_10px_rgba(0,0,0,0.5)] border border-gray-200">
 <ArrowLeftRight className="h-4 w-4 text-gray-600" />
 </div>
 </div>
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="p-4 space-y-4">
 <div className="space-y-2">
 <Label>URL da Imagem Esquerda (Antes)</Label>
 <Input 
 value={node.props?.imageBefore || ''}
 onChange={(e) => onChange({ props: { ...node.props, imageBefore: e.target.value } })}
 />
 </div>
 <div className="space-y-2">
 <Label>Rótulo Esquerda</Label>
 <Input 
 value={node.props?.labelBefore || ''}
 onChange={(e) => onChange({ props: { ...node.props, labelBefore: e.target.value } })}
 />
 </div>
 <div className="h-px bg-gray-200 my-4" />
 <div className="space-y-2">
 <Label>URL da Imagem Direita (Depois)</Label>
 <Input 
 value={node.props?.imageAfter || ''}
 onChange={(e) => onChange({ props: { ...node.props, imageAfter: e.target.value } })}
 />
 </div>
 <div className="space-y-2">
 <Label>Rótulo Direita</Label>
 <Input 
 value={node.props?.labelAfter || ''}
 onChange={(e) => onChange({ props: { ...node.props, labelAfter: e.target.value } })}
 />
 </div>
 </div>
 );
 }
};
