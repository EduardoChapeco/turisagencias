const fs = require('fs');
const content = fs.readFileSync('c:/Users/aline/Music/turisagencias/src/integrations/supabase/types.ts', 'utf8');

// Find the Tables section
const startIdx = content.indexOf('    Tables: {');
if (startIdx === -1) {
  console.log('Tables section not found');
  process.exit(1);
}

// Find matching closing brace for Tables section
let braceCount = 1;
let currentIdx = startIdx + '    Tables: {'.length;
let tableBlock = '';

while (braceCount > 0 && currentIdx < content.length) {
  const char = content[currentIdx];
  if (char === '{') braceCount++;
  else if (char === '}') braceCount--;
  tableBlock += char;
  currentIdx++;
}

// Parse table names
const tableNames = [];
const lines = tableBlock.split('\n');
for (const line of lines) {
  const match = line.match(/^\s{6}([a-z0-9_]+):\s*\{/);
  if (match) {
    tableNames.push(match[1]);
  }
}

console.log('Found tables:', tableNames.join(', '));
