/*
# Create glossary tables

1. New Tables
  - `glossary_terms`
    - `id` (uuid, primary key)
    - `term` (text, not null) — the vocabulary word
    - `definition` (text, not null) — its definition
    - `created_at` (timestamptz, default now())
  - `glossary_proposals`
    - `id` (uuid, primary key)
    - `term` (text, not null) — the term being proposed
    - `note` (text, default '') — optional context supplied by the proposer
    - `status` (text, default 'pending') — proposal status
    - `created_at` (timestamptz, default now())

2. Security
  - Enable RLS on both tables.
  - This is a single-tenant, no-login app (the "admin" screen is a client-side
    password gate, not real authentication), so policies allow `anon` and
    `authenticated` full CRUD — the shared glossary data is intentionally
    public and editable by anyone using the app.
*/

CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  definition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS glossary_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  note text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_terms" ON glossary_terms;
CREATE POLICY "anon_select_terms" ON glossary_terms FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_terms" ON glossary_terms;
CREATE POLICY "anon_insert_terms" ON glossary_terms FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_terms" ON glossary_terms;
CREATE POLICY "anon_update_terms" ON glossary_terms FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_terms" ON glossary_terms;
CREATE POLICY "anon_delete_terms" ON glossary_terms FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_proposals" ON glossary_proposals;
CREATE POLICY "anon_select_proposals" ON glossary_proposals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_proposals" ON glossary_proposals;
CREATE POLICY "anon_insert_proposals" ON glossary_proposals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_proposals" ON glossary_proposals;
CREATE POLICY "anon_update_proposals" ON glossary_proposals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_proposals" ON glossary_proposals;
CREATE POLICY "anon_delete_proposals" ON glossary_proposals FOR DELETE
  TO anon, authenticated USING (true);
