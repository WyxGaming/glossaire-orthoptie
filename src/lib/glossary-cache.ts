const CACHE_KEY = 'og-glossary-cache-v1';

export type CachedGlossary = {
  terms: Array<{
    id: string;
    term: string;
    nature: string;
    category: string;
    definition: string;
  }>;
  abbreviations: Array<{
    id: string;
    abbr: string;
    meaning: string;
    category: string | null;
  }>;
  proposals: Array<{
    id: string;
    term: string;
    note: string;
    date: string;
    status: string;
  }>;
  savedAt: string;
};

export function readGlossaryCache(): CachedGlossary | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedGlossary;
  } catch {
    return null;
  }
}

export function writeGlossaryCache(payload: Omit<CachedGlossary, 'savedAt'>) {
  try {
    const entry: CachedGlossary = { ...payload, savedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* quota or private mode */
  }
}
