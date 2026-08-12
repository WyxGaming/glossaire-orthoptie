import { useMemo, useState } from "react";
import { Search } from "lucide-react";

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function AbbreviationsLexicon({ abbreviations, categories }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categoryList = useMemo(() => {
    const fromData = [...new Set(abbreviations.map((a) => a.category).filter(Boolean))];
    const merged = [...new Set([...(categories || []), ...fromData])];
    return merged.sort((a, b) => a.localeCompare(b, "fr"));
  }, [abbreviations, categories]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return abbreviations.filter((a) => {
      const matchesSearch =
        !q ||
        normalize(a.abbr).includes(q) ||
        normalize(a.meaning).includes(q);
      const matchesCategory = !categoryFilter || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.abbr.localeCompare(b.abbr, "fr"));
  }, [abbreviations, search, categoryFilter]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      const letter = item.abbr[0]?.toUpperCase() || "#";
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(item);
    }
    return groups;
  }, [filtered]);

  const letters = Object.keys(grouped).sort();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h2 className="og-term-name text-2xl mb-1">Lexique d'abréviations</h2>
        <p className="og-eyebrow">Sigles et abréviations courants en orthoptie</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--ink-muted)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une abréviation…"
            className="og-search w-full rounded-lg pl-9 pr-3 py-2 text-sm og-serif"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="og-input rounded-lg px-3 py-2 text-sm og-serif sm:w-52"
        >
          <option value="">Toutes les catégories</option>
          {categoryList.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="og-eyebrow mb-6">{filtered.length} abréviation{filtered.length > 1 ? "s" : ""}</p>

      {letters.length === 0 ? (
        <p className="og-eyebrow text-center py-12">Aucun résultat.</p>
      ) : (
        letters.map((letter) => (
          <section key={letter} className="mb-8">
            <div className="og-letter-row">
              <span className="og-letter-big">{letter}</span>
              <span className="og-letter-rule" />
            </div>
            {grouped[letter].map((item) => (
              <div key={item.id} className="og-card rounded-xl p-4 mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="og-term-name text-lg og-mono">{item.abbr}</span>
                {item.category && <span className="og-cat-badge">{item.category}</span>}
                <p className="og-definition text-[0.97rem] w-full sm:w-auto flex-1">{item.meaning}</p>
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
