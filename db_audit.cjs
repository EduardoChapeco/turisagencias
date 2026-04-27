require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { execSync } = require('child_process');

const dbUrl = String(process.env.SUPABASE_DB_URL || '').trim();

if (!dbUrl) {
  console.error('Missing SUPABASE_DB_URL in .env');
  process.exit(1);
}

const query = `
SELECT u.email, u.id as user_id, p.id as profile_id, p.org_id, o.name as org_name, 
  (SELECT string_agg(role::text, ',') FROM public.user_roles ur WHERE ur.user_id = u.id) as roles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.organizations o ON p.org_id = o.id
WHERE u.email ILIKE '%edu%';
`;

try {
  console.log('Using DB URL starting with:', dbUrl.substring(0, 20) + '...');
  const result = execSync(`npx supabase db psql --db-url "${dbUrl}" -c "${query}"`, { env: process.env }).toString();
  console.log(result);
} catch (error) {
  console.error('Error executing query', error.message);
}
