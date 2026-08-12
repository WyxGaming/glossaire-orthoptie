/*
# Add "nature" column to glossary_terms

1. Modified Tables
  - `glossary_terms`
    - Add `nature` (text, nullable) — free-text field shown in italics
      under the term name, used to indicate the grammatical nature of
      the term and/or its etymology. Optional: existing rows get NULL,
      the UI treats empty as "not displayed".

2. Security
  - No policy changes. The column inherits the existing permissive
    RLS policies already enabled on the table.
*/

ALTER TABLE glossary_terms
  ADD COLUMN IF NOT EXISTS nature text;
