const { execSync } = require('child_process');

// Active project: DBturis (mdulkbvdedfgwzesgeuh)
// Legacy project ref (SWdb - xhdoupxnpjbzkzuhucpp) kept ONLY as a comment for emergency data recovery.

try {
  console.log('Linking to DBturis project...');
  execSync('npx supabase link --project-ref mdulkbvdedfgwzesgeuh', {
    stdio: 'inherit',
  });
  console.log('Link successful. Deploying all edge functions...');
  execSync('npx supabase functions deploy', {
    stdio: 'inherit',
  });
  console.log('Functions deployed successfully.');
} catch (e) {
  console.error('Error:', e.message);
}
