const fs = require('fs');
const path = require('path');
const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

let rlsEnabled = new Set();
let hasPolicy = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
  
  const rlsRegex = /ALTER TABLE (public\.)?([a-zA-Z0-9_]+) ENABLE ROW LEVEL SECURITY/gi;
  let rlsMatch;
  while ((rlsMatch = rlsRegex.exec(content)) !== null) {
    rlsEnabled.add(rlsMatch[2].toLowerCase());
  }

  const polRegex = /CREATE POLICY[^;]+ON (public\.)?([a-zA-Z0-9_]+)/gi;
  let polMatch;
  while ((polMatch = polRegex.exec(content)) !== null) {
    hasPolicy.add(polMatch[2].toLowerCase());
  }
});

const rlsWithoutPolicy = [...rlsEnabled].filter(t => !hasPolicy.has(t));
console.log('Tables with RLS enabled but NO POLICY:', rlsWithoutPolicy);

