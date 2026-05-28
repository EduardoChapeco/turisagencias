import { BlockDef } from '../core/types';
import { Repeat } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const defaultLogos = [
 "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
 "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
 "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
 "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
 "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
];

export const LogoTickerBlock: BlockDef = {
 type: 'LogoTickerBlock',
 label: 'Logo Ticker',
 category: 'advanced',
 icon: Repeat,
 defaultProps: {
 speed: 20,
 logos: defaultLogos,
 },
 defaultStyles: {
 padding: '2rem 0',
 backgroundColor: '#ffffff',
 },
 renderComponent: ({ node }) => {
 return (
 <div style={node.styles} className="w-full overflow-hidden flex flex-col items-center">
 <style>{`
 @keyframes ticker {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 .ticker-track {
 display: flex;
 width: max-content;
 animation: ticker ${node.props.speed}s linear infinite;
 }
 .ticker-track:hover {
 animation-play-state: paused;
 }
 `}</style>
 <div className="relative w-full max-w-full overflow-hidden flex items-center bg-gray-50/50 py-8 border-y border-gray-100">
 <div className="ticker-track flex items-center space-x-16 px-8">
 {[...node.props.logos, ...node.props.logos].map((logo, idx) => (
 <img 
 key={idx} 
 src={logo} 
 alt={`Logo ${idx}`} 
 className="h-8 md:h-12 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
 />
 ))}
 </div>
 </div>
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label>Animation Speed (seconds)</Label>
 <Input 
 type="number"
 value={node.props.speed} 
 onChange={(e) => onChange({ props: { ...node.props,  speed: Number(e.target.value) } })} 
 min="1"
 />
 </div>
 <p className="text-xs text-muted-foreground mt-2">Logos can be updated in code currently.</p>
 </div>
 ),
};
