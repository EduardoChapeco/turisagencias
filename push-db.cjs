const { execSync } = require('child_process');

const dbUrl = String(process.env.SUPABASE_DB_URL || '').trim();

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL. Configure the new database URL before running migrations.');
  process.exit(1);
}

try {
  console.log('Pushing all migrations to the linked Supabase database...');
  execSync(`npx supabase db push --yes --db-url "${dbUrl}"`, {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Database migrated successfully. Schemas, triggers, RLS and hooks were applied.');
} catch (error) {
  console.error('Error pushing db:', error.message);
  process.exit(1);
}
