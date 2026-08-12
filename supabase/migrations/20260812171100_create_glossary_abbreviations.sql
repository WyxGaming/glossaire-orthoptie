/*
# Create glossary_abbreviations table

1. New Tables
  - `glossary_abbreviations`
    - `id` (uuid, primary key)
    - `abbr` (text, not null) — the abbreviation sigle
    - `meaning` (text, not null) — full meaning / definition
    - `category` (text, nullable) — optional grouping
    - `created_at` (timestamptz, default now())

2. Security
  - Same permissive RLS as glossary_terms (client-side admin password gate).
*/

CREATE TABLE IF NOT EXISTS glossary_abbreviations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abbr text NOT NULL,
  meaning text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE glossary_abbreviations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_abbreviations" ON glossary_abbreviations;
CREATE POLICY "anon_select_abbreviations" ON glossary_abbreviations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_abbreviations" ON glossary_abbreviations;
CREATE POLICY "anon_insert_abbreviations" ON glossary_abbreviations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_abbreviations" ON glossary_abbreviations;
CREATE POLICY "anon_update_abbreviations" ON glossary_abbreviations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_abbreviations" ON glossary_abbreviations;
CREATE POLICY "anon_delete_abbreviations" ON glossary_abbreviations FOR DELETE
  TO anon, authenticated USING (true);
