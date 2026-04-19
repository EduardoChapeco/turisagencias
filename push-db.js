const { execSync } = require('child_process');

// Active project: DBturis (mdulkbvdedfgwzesgeuh)
// Legacy project ref (SWdb - xhdoupxnpjbzkzuhucpp) kept ONLY for emergency data recovery.

try {
  console.log('Pushing database migrations to DBturis...');
  execSync('npx supabase db push --project-ref mdulkbvdedfgwzesgeuh', {
    stdio: 'inherit',
  });
  console.log('Database pushed successfully.');
} catch (e) {
  console.error('Error pushing db:', e.message);
}
