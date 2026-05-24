const { execSync } = require('child_process');

const dbUrl = "postgresql://postgres:EEaR6399!%40%232026@db.mdulkbvdedfgwzesgeuh.supabase.co:5432/postgres";

function runQuery(query) {
  try {
    const escapedQuery = query.replace(/"/g, '\\"');
    const cmd = `npx supabase db query --db-url "${dbUrl}" "${escapedQuery}"`;
    return execSync(cmd).toString();
  } catch (error) {
    return `Error: ${error.message}\nOutput: ${error.stdout?.toString()}\nStderr: ${error.stderr?.toString()}`;
  }
}

console.log('--- TESTANDO CONEXÃO ---');
console.log(runQuery('SELECT version();'));

console.log('--- CONTAGEM DE TABELAS E POLICIES RLS ---');
const tableQuery = `
  SELECT 
    tablename, 
    rowsecurity, 
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count 
  FROM pg_tables t 
  WHERE schemaname = 'public' 
  ORDER BY tablename;
`;
console.log(runQuery(tableQuery));

console.log('--- CONTAGEM DE REGISTROS CRÍTICOS ---');
console.log('Organizações:', runQuery('SELECT count(*) FROM public.organizations;'));
console.log('Perfis:', runQuery('SELECT count(*) FROM public.profiles;'));
console.log('Usuários Auth:', runQuery('SELECT count(*) FROM auth.users;'));
console.log('Cotações:', runQuery('SELECT count(*) FROM public.quotations;'));
console.log('Logs de Decisão IA:', runQuery('SELECT count(*) FROM public.ai_decision_logs;'));
