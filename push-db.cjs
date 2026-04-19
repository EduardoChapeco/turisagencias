const { execSync } = require('child_process');

try {
  console.log('Pushing ALL 45 Migrations to the blank DB...');
  execSync('npx supabase db push --yes --db-url "postgresql://postgres:EEaR6399%21%40%232026@db.mdulkbvdedfgwzesgeuh.supabase.co:5432/postgres"', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_PASSWORD: 'EEaR6399!@#2026' }
  });
  console.log('Database migrated successfully! All Schemas, Triggers, RLS and Hooks applied.');
} catch (e) {
  console.error('Error pushing db:', e.message);
  process.exit(1);
}
