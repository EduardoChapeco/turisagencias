const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'supabase/migrations');

try {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.sql')) {
      let content = fs.readFileSync(path.join(dir, file), 'utf8');
      
      // Fix missing IF NOT EXISTS for tables
      content = content.replace(/CREATE TABLE\s+(?!IF NOT EXISTS\s+)public\./g, 'CREATE TABLE IF NOT EXISTS public.');
      content = content.replace(/CREATE TABLE\s+(?!IF NOT EXISTS\s+)auth\./g, 'CREATE TABLE IF NOT EXISTS auth.');
      
      // Fix missing IF NOT EXISTS for indexes
      content = content.replace(/CREATE INDEX\s+(?!IF NOT EXISTS\s+)(idx_[^\s]+)\s+ON/g, 'CREATE INDEX IF NOT EXISTS $1 ON');
      
      fs.writeFileSync(path.join(dir, file), content);
    }
  });
  console.log('Migrations sanitized successfully.');
} catch(e) {
  console.error(e);
}
