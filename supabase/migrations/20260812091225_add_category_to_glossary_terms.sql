/*
# Add "category" column to glossary_terms

1. Modified Tables
  - `glossary_terms`
    - Add `category` (text, nullable) — used to group terms by
      thematic area (e.g. motilité, réfraction, vision binoculaire).
      Optional: existing rows get NULL, the UI treats empty as
      "Non classé".

2. Security
  - No policy changes. The column inherits the existing permissive
    RLS policies already enabled on the table.
*/

ALTER TABLE glossary_terms
  ADD COLUMN IF NOT EXISTS category text;
