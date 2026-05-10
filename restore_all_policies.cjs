const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

let restoredPolicies = '';
const seenPolicies = new Set();

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // A crude regex to capture CREATE POLICY statements
  // This will match CREATE POLICY "name" ON table FOR ... USING (...) WITH CHECK (...)
  // Because SQL statements end with a semicolon, we can match up to the semicolon.
  // We need to make sure we don't match across multiple statements, so [^;]+ is usually good enough.
  const regex = /CREATE POLICY[^;]+;/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const policy = match[0];
    if (policy.includes('get_my_org_id()')) {
      // To handle policy overwrites, we can prepend DROP POLICY IF EXISTS
      // Parse table and policy name
      const nameMatch = policy.match(/CREATE POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/i) || 
                        policy.match(/CREATE POLICY\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)/i);
      
      if (nameMatch) {
        const policyName = nameMatch[1];
        const tableName = nameMatch[2];
        const key = `${tableName}.${policyName}`;
        
        // We only keep the latest definition of the policy
        seenPolicies.add(key);
        
        // We will store all of them, but we can write a script that generates DROP + CREATE
        // Actually, just pushing them to an array/map by key will keep the latest one!
      }
    }
  }
}

// Map to store the latest policy
const policyMap = new Map();

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const regex = /CREATE\s+POLICY[^;]+;/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const policy = match[0];
    if (policy.includes('get_my_org_id()')) {
      const nameMatch = policy.match(/CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/i) || 
                        policy.match(/CREATE\s+POLICY\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)/i);
      if (nameMatch) {
        let policyName = nameMatch[1];
        let tableName = nameMatch[2].replace('public.', ''); // normalize
        // If it starts with public., remove it for the DROP
        policyMap.set(`${tableName}.${policyName}`, {
          tableName,
          policyName,
          sql: policy
        });
      }
    }
  }
}

let finalSql = `-- =====================================================================\n`;
finalSql += `-- MIGRAÇÃO: 20260428000013_restore_all_dropped_policies\n`;
finalSql += `-- Restaura TODAS as políticas que foram dropadas devido ao CASCADE do DROP FUNCTION get_my_org_id()\n`;
finalSql += `-- =====================================================================\n\n`;

for (const [key, value] of policyMap.entries()) {
  finalSql += `ALTER TABLE public.${value.tableName} ENABLE ROW LEVEL SECURITY;\n`;
  finalSql += `DROP POLICY IF EXISTS "${value.policyName}" ON public.${value.tableName};\n`;
  finalSql += value.sql + '\n\n';
}

fs.writeFileSync(path.join(dir, '20260428000013_restore_all_dropped_policies.sql'), finalSql);
console.log('Generated 20260428000013_restore_all_dropped_policies.sql with', policyMap.size, 'policies.');
