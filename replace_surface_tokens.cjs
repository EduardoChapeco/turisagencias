const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /bg-surface-elevated/g, to: 'bg-white' },
  { from: /bg-surface\/\d+/g, to: 'bg-vj-bg' },
  { from: /bg-surface/g, to: 'bg-vj-bg' },
  { from: /text-primary\/\d+/g, to: 'text-vj-green' },
  { from: /text-primary/g, to: 'text-vj-green' },
  { from: /bg-primary\/\d+/g, to: 'bg-vj-green/10' },
  { from: /bg-primary/g, to: 'bg-vj-green' },
  { from: /border-primary\/\d+/g, to: 'border-vj-green/20' },
  { from: /border-primary/g, to: 'border-vj-green/20' },
  { from: /border-border\/\d+/g, to: 'border-vj-border' },
  { from: /border-border/g, to: 'border-vj-border' },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.tsx') && !fullPath.includes('ui\\')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      replacements.forEach(r => {
        if (content.match(r.from)) {
          content = content.replace(r.from, r.to);
          modified = true;
        }
      });
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

processDir('src/pages');
processDir('src/components');
