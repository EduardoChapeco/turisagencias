const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'supabase/migrations');

function sanitize(content) {
  // 1. CREATE TABLE → CREATE TABLE IF NOT EXISTS
  content = content.replace(
    /\bCREATE TABLE\s+(?!IF NOT EXISTS\s+)((?:public|auth)\.[a-zA-Z0-9_]+)/g,
    'CREATE TABLE IF NOT EXISTS $1'
  );

  // 2. CREATE INDEX → CREATE INDEX IF NOT EXISTS
  content = content.replace(
    /\bCREATE (UNIQUE )?INDEX\s+(?!IF NOT EXISTS\s+)([a-zA-Z0-9_]+)\s+ON\s+/g,
    'CREATE $1INDEX IF NOT EXISTS $2 ON '
  );

  // 3. CREATE TRIGGER → DROP TRIGGER IF EXISTS + CREATE TRIGGER
  content = content.replace(
    /\bCREATE TRIGGER\s+([a-zA-Z0-9_]+)\s+(BEFORE|AFTER|INSTEAD OF)\s+([^\n]+?)\s+ON\s+((?:public|auth)\.[a-zA-Z0-9_]+)/g,
    'DROP TRIGGER IF EXISTS $1 ON $4;\nCREATE TRIGGER $1 $2 $3 ON $4'
  );

  // 4a. CREATE POLICY IF NOT EXISTS → DROP + CREATE (invalid syntax fix)
  content = content.replace(
    /\bCREATE POLICY IF NOT EXISTS\s+("(?:[^"\\]|\\.)*")/g,
    'DROP POLICY IF EXISTS $1 ON ___PLACEHOLDER___;\nCREATE POLICY $1'
  );
  content = content.replace(
    /\bCREATE POLICY IF NOT EXISTS\s+('(?:[^'\\]|\\.)*')/g,
    'DROP POLICY IF EXISTS $1 ON ___PLACEHOLDER___;\nCREATE POLICY $1'
  );
  // Remove leftover placeholders (they'll be dangling from the regex parse)
  content = content.replace(/DROP POLICY IF EXISTS ([^\n]+) ON ___PLACEHOLDER___;\n/g, '');

  // 4b. Regular CREATE POLICY → DROP + CREATE (double-quoted)
  content = content.replace(
    /\bCREATE POLICY\s+("(?:[^"\\]|\\.)*")\s+ON\s+((?:public|auth|storage)\.[a-zA-Z0-9_]+)/g,
    'DROP POLICY IF EXISTS $1 ON $2;\nCREATE POLICY $1 ON $2'
  );
  // 4c. Single-quoted
  content = content.replace(
    /\bCREATE POLICY\s+('(?:[^'\\]|\\.)*')\s+ON\s+((?:public|auth|storage)\.[a-zA-Z0-9_]+)/g,
    'DROP POLICY IF EXISTS $1 ON $2;\nCREATE POLICY $1 ON $2'
  );

  // 5. DROP FUNCTION + CREATE OR REPLACE FUNCTION (handles signature change conflicts)
  content = content.replace(
    /\bCREATE OR REPLACE FUNCTION\s+((?:public|auth)\.[a-zA-Z0-9_]+)\s*\(/g,
    'DROP FUNCTION IF EXISTS $1 CASCADE;\nCREATE OR REPLACE FUNCTION $1('
  );

  return content;
}

let filesFixed = 0;
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.sql')) return;
  const filePath = path.join(dir, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const sanitized = sanitize(original);
  if (sanitized !== original) {
    fs.writeFileSync(filePath, sanitized);
    filesFixed++;
  }
});

console.log(`✅ Done. ${filesFixed} migration files patched.`);
