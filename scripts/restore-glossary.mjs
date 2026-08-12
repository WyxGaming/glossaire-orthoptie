/**
 * Restaure glossary_terms, glossary_proposals et glossary_abbreviations
 * depuis l'ancien projet Supabase (Bolt) vers le projet actuel (.env).
 *
 * Usage: node scripts/restore-glossary.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnvFile(path) {
  const vars = {};
  try {
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    /* optional file */
  }
  return vars;
}

const env = { ...loadEnvFile(resolve(root, '.env.old')), ...loadEnvFile(resolve(root, '.env')) };

const oldUrl = env.VITE_OLD_SUPABASE_URL;
const oldKey = env.VITE_OLD_SUPABASE_ANON_KEY;
const newUrl = env.VITE_SUPABASE_URL;
const newKey = env.VITE_SUPABASE_ANON_KEY;

if (!oldUrl || !oldKey || !newUrl || !newKey) {
  console.error('Missing env: set VITE_OLD_SUPABASE_URL + VITE_OLD_SUPABASE_ANON_KEY in .env.old');
  process.exit(1);
}

const oldDb = createClient(oldUrl, oldKey);
const newDb = createClient(newUrl, newKey);

async function fetchAll(client, table, select) {
  const { data, error } = await client.from(table).select(select);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data || [];
}

async function replaceTable(client, table, rows, mapRow) {
  const { error: delError } = await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) throw new Error(`delete ${table}: ${delError.message}`);

  if (rows.length === 0) return 0;

  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(mapRow);
    const { error } = await client.from(table).insert(batch);
    if (error) throw new Error(`insert ${table}: ${error.message}`);
    inserted += batch.length;
    console.log(`  ${table}: ${inserted}/${rows.length}`);
  }
  return inserted;
}

console.log('Fetching from old project…');
const [terms, proposals, abbrs] = await Promise.all([
  fetchAll(oldDb, 'glossary_terms', 'term, nature, category, definition, created_at'),
  fetchAll(oldDb, 'glossary_proposals', 'term, note, status, created_at'),
  fetchAll(oldDb, 'glossary_abbreviations', 'abbr, meaning, category, created_at').catch(() => []),
]);

console.log(`Found: ${terms.length} terms, ${proposals.length} proposals, ${abbrs.length} abbreviations`);

console.log('Restoring to new project…');
const termCount = await replaceTable(newDb, 'glossary_terms', terms, (r) => ({
  term: r.term,
  nature: r.nature,
  category: r.category,
  definition: r.definition ?? '',
  created_at: r.created_at,
}));

const proposalCount = await replaceTable(newDb, 'glossary_proposals', proposals, (r) => ({
  term: r.term,
  note: r.note ?? '',
  status: r.status ?? 'pending',
  created_at: r.created_at,
}));

let abbrCount = 0;
if (abbrs.length > 0) {
  abbrCount = await replaceTable(newDb, 'glossary_abbreviations', abbrs, (r) => ({
    abbr: r.abbr,
    meaning: r.meaning,
    category: r.category,
    created_at: r.created_at,
  }));
}

console.log(`Done: ${termCount} terms, ${proposalCount} proposals, ${abbrCount} abbreviations restored.`);
