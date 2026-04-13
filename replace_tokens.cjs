const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /bg-cb-s0/g, to: 'bg-white' },
  { from: /bg-cb-s1/g, to: 'bg-vj-bg' },
  { from: /bg-cb-s2/g, to: 'bg-vj-bg' },
  { from: /border-cb-border/g, to: 'border-vj-border' },
  { from: /text-cb-text/g, to: 'text-vj-txt' },
  { from: /text-cb-muted/g, to: 'text-vj-txt3' },
  { from: /text-cb-primary/g, to: 'text-vj-txt' },
  { from: /text-cb-secondary/g, to: 'text-vj-txt2' },
  { from: /cb-accent/g, to: 'vj-green' },
  { from: /cb-success/g, to: 'vj-green' },
  { from: /cb-warning/g, to: 'vj-orange' },
  { from: /cb-danger/g, to: 'vj-red' },
  { from: /cb-info/g, to: 'vj-blue' },
  { from: /border-cb-strong/g, to: 'border-vj-border2' },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.tsx')) {
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
