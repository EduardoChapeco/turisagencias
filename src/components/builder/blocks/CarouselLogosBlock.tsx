import React from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const CarouselLogosBlock = {
  type: 'carousel_logos',
  category: 'media',
  label: 'Logo Carousel',
  icon: Building2,
  defaultProps: {
    title: 'Parceiros de Confiança',
    logos: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', alt: 'Google' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', alt: 'IBM' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', alt: 'Amazon' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', alt: 'Microsoft' },
    ],
    speed: 30
  },
  defaultStyles: {
    padding: '48px 24px',
    backgroundColor: '#f9fafb'
  },
  renderComponent: ({ node }) => {
    const { logos = [], title = '', speed = 30 } = node.props || {};

    return (
      <div style={node.styles} className="w-full overflow-hidden flex flex-col items-center">
        {title && <h3 className="text-center font-semibold text-gray-500 uppercase tracking-wider mb-8 text-sm">{title}</h3>}
        
        {logos.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full max-w-4xl">
            <div className="text-center text-gray-500">
              <Building2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Adicione logos no painel</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto overflow-hidden relative">
            {/* Máscara de gradiente para fading nas bordas */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--vj-bg)] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--vj-bg)] to-transparent z-10"></div>
            
            <div 
              className="flex items-center gap-16 min-w-max"
              style={{
                animation: `marquee ${speed}s linear infinite`,
              }}
            >
              {/* Duplicar array para efeito infinito real */}
              {[...logos, ...logos, ...logos].map((logo: any, idx: number) => (
                <img 
                  key={idx}
                  src={logo.url} 
                  alt={logo.alt} 
                  className="h-10 md:h-12 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              ))}
            </div>
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-100% / 3)); }
              }
            `}</style>
          </div>
        )}
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const { logos = [], title = '', speed = 30 } = node.props || {};

    const addLogo = () => {
      onChange({ props: { ...node.props, logos: [...logos, { url: '', alt: '' }] } });
    };

    const updateLogo = (index: number, field: string, value: string) => {
      const newLogos = [...logos];
      newLogos[index] = { ...newLogos[index], [field]: value };
      onChange({ props: { ...node.props, logos: newLogos } });
    };

    const removeLogo = (index: number) => {
      onChange({ props: { ...node.props, logos: logos.filter((_: any, i: number) => i !== index) } });
    };

    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Título Acima do Carrossel</Label>
          <Input 
            value={title}
            onChange={(e) => onChange({ props: { ...node.props, title: e.target.value } })}
            placeholder="Ex: Parceiros de Confiança"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Velocidade da Animação (segundos)</Label>
          <Input 
            type="number"
            min={5}
            max={100}
            value={speed}
            onChange={(e) => onChange({ props: { ...node.props, speed: parseInt(e.target.value) } })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            Logos
            <Button variant="ghost" size="sm" onClick={addLogo}><Plus className="h-4 w-4" /></Button>
          </Label>
          
          <div className="space-y-3">
            {logos.map((logo: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-2 border rounded relative bg-gray-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeLogo(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="space-y-1 mt-4">
                  <Label className="text-xs">URL da Logo (PNG/SVG Transparente)</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={logo.url} 
                    onChange={e => updateLogo(idx, 'url', e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nome da Empresa</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={logo.alt} 
                    onChange={e => updateLogo(idx, 'alt', e.target.value)} 
                  />
                </div>
              </div>
            ))}
            {logos.length === 0 && <p className="text-xs text-gray-500">Nenhuma logo.</p>}
          </div>
        </div>
      </div>
    );
  }
};
