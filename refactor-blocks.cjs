const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/aline/Music/turisagencias/src/components/builder/blocks';

const files = [
  'CarouselLogosBlock.tsx',
  'CarouselTestimonialsBlock.tsx',
  'GalleryBeforeAfterBlock.tsx',
  'GalleryBentoGridBlock.tsx',
  'GalleryCarouselBlock.tsx',
  'GalleryInstagramFeedBlock.tsx',
  'GalleryMasonryBlock.tsx',
  'LayoutGrid2ColBlock.tsx',
  'LayoutGrid3ColBlock.tsx',
  'LayoutSidebarLeftBlock.tsx',
  'LayoutSidebarRightBlock.tsx',
  'MediaAudioPlayerBlock.tsx',
  'MediaDocumentViewerBlock.tsx',
  'MediaTestimonialVideoBlock.tsx'
];

files.forEach(file => {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf-8');
  
  // Replace old block props with new block props
  content = content.replace(/renderComponent:\s*\(\s*props\s*:\s*any\s*\)\s*=>\s*\{/g, 'renderComponent: ({ node }) => {');
  content = content.replace(/renderComponent:\s*\(\s*props\s*:\s*any\s*\)\s*=>\s*\(/g, 'renderComponent: ({ node }) => (');
  content = content.replace(/renderComponent:\s*\(\s*\)\s*=>\s*\{/g, 'renderComponent: ({ node }) => {');
  content = content.replace(/renderComponent:\s*\(\s*\)\s*=>\s*\(/g, 'renderComponent: ({ node }) => (');
  
  content = content.replace(/settingsComponent:\s*\(\s*props\s*:\s*any\s*\)\s*=>\s*\{/g, 'settingsComponent: ({ node, onChange }) => {');
  content = content.replace(/settingsComponent:\s*\(\s*props\s*:\s*any\s*\)\s*=>\s*\(/g, 'settingsComponent: ({ node, onChange }) => (');
  content = content.replace(/settingsComponent:\s*\(\s*\)\s*=>\s*\{/g, 'settingsComponent: ({ node, onChange }) => {');
  content = content.replace(/settingsComponent:\s*\(\s*\)\s*=>\s*\(/g, 'settingsComponent: ({ node, onChange }) => (');

  // If there are specific old references, clean them up
  content = content.replace(/props\./g, 'node.props.');
  
  fs.writeFileSync(p, content, 'utf-8');
  console.log(`Updated ${file}`);
});
