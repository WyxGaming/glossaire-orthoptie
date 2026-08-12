export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function termsWithDefinitions(terms, categoryFilter = "") {
  return terms.filter((t) => {
    if (!t.definition?.trim()) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    return true;
  });
}

export function buildQuizQuestions(terms, categoryFilter = "", count = 10) {
  const pool = termsWithDefinitions(terms, categoryFilter);
  if (pool.length < 4) return [];

  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  return selected.map((term) => {
    const distractors = shuffle(pool.filter((t) => t.id !== term.id)).slice(0, 3);
    return {
      term,
      options: shuffle([term, ...distractors]),
      correctId: term.id,
    };
  });
}
