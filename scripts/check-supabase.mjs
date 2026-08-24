#!/usr/bin/env node
/**
 * Vérifie que le projet Supabase répond (DNS + REST).
 * Usage: node scripts/check-supabase.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv(path) {
  const vars = {};
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    /* optional */
  }
  return vars;
}

const env = loadEnv(resolve(root, '.env'));
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Variables manquantes : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log(`Test de ${url} …`);

try {
  const res = await fetch(`${url}/rest/v1/glossary_terms?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`Échec HTTP ${res.status}: ${body.slice(0, 200)}`);
    process.exit(1);
  }
  console.log('OK — Supabase répond, table glossary_terms accessible.');
} catch (error) {
  console.error(`Connexion impossible : ${error.message}`);
  console.error('Vérifiez que le projet Supabase existe et que les migrations sont appliquées.');
  process.exit(1);
}
