const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

const tablesCreated = new Set();
const rlsEnabled = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  
  // Find table creations
  const createRegex = /CREATE TABLE (IF NOT EXISTS )?(public\.)?([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = createRegex.exec(content)) !== null) {
    tablesCreated.add(match[3].toLowerCase());
  }
  
  // Find RLS enablement
  const rlsRegex = /ALTER TABLE (public\.)?([a-zA-Z0-9_]+) ENABLE ROW LEVEL SECURITY/g;
  let rlsMatch;
  while ((rlsMatch = rlsRegex.exec(content)) !== null) {
    rlsEnabled.add(rlsMatch[2].toLowerCase());
  }
});

const missingRls = [...tablesCreated].filter(t => !rlsEnabled.has(t));
console.log('Tables created:', tablesCreated.size);
console.log('Tables missing RLS:', missingRls.length);
console.log('List of tables missing RLS:');
missingRls.forEach(t => console.log(' - ' + t));
