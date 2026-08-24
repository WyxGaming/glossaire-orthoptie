/*
# Enable Realtime for glossary tables

Allows live sync between clients when terms, proposals or abbreviations change.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE glossary_terms;
ALTER PUBLICATION supabase_realtime ADD TABLE glossary_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE glossary_abbreviations;
