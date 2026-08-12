import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle, RotateCw } from "lucide-react";
import { shuffle, termsWithDefinitions } from "@/lib/study-utils";

export default function FlashcardMode({ terms, categories }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deckKey, setDeckKey] = useState(0);
  const [isShuffled, setIsShuffled] = useState(true);

  const deck = useMemo(() => {
    const list = termsWithDefinitions(terms, categoryFilter);
    return isShuffled ? shuffle(list) : [...list].sort((a, b) => a.term.localeCompare(b.term, "fr"));
  }, [terms, categoryFilter, isShuffled, deckKey]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [categoryFilter, isShuffled, deckKey]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        setFlipped(false);
        setIndex((i) => (i + 1) % deck.length);
      } else if (e.key === "ArrowLeft") {
        setFlipped(false);
        setIndex((i) => (i - 1 + deck.length) % deck.length);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deck.length]);

  if (deck.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="og-term-name text-lg mb-1">Pas assez de termes</p>
        <p className="og-eyebrow">
          Il faut au moins un terme avec définition{categoryFilter ? " dans cette catégorie" : ""} pour réviser.
        </p>
      </div>
    );
  }

  const current = deck[index];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="og-term-name text-2xl mb-1">Mode révision</h2>
          <p className="og-eyebrow">Flashcards — retournez la carte pour voir la définition</p>
        </div>
        <span className="og-mono text-sm" style={{ color: "var(--ink-muted)" }}>
          {index + 1} / {deck.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="og-input rounded-lg px-3 py-2 text-sm og-serif"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => setDeckKey((k) => k + 1)}
          className="og-btn-ghost rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5"
        >
          <Shuffle size={14} /> Mélanger
        </button>
        <button
          onClick={() => setIsShuffled((s) => !s)}
          className="og-btn-ghost rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5"
        >
          <RotateCw size={14} /> {isShuffled ? "Ordre A–Z" : "Ordre aléatoire"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={`og-flashcard w-full rounded-2xl p-8 sm:p-10 mb-6 text-left min-h-[220px] flex flex-col justify-center ${flipped ? "flipped" : ""}`}
      >
        {!flipped ? (
          <>
            {current.category && <span className="og-cat-badge mb-3">{current.category}</span>}
            <p className="og-term-name text-2xl sm:text-3xl">{current.term}</p>
            {current.nature && <p className="og-nature mt-2">{current.nature}</p>}
            <p className="og-eyebrow mt-6">Cliquez ou appuyez sur Espace pour retourner</p>
          </>
        ) : (
          <>
            <p className="og-term-name text-lg mb-2" style={{ color: "var(--accent-deep)" }}>{current.term}</p>
            <p className="og-definition text-[1.05rem]">{current.definition}</p>
          </>
        )}
      </button>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => { setFlipped(false); setIndex((i) => (i - 1 + deck.length) % deck.length); }}
          className="og-btn-ghost rounded-lg px-4 py-2.5 text-sm og-mono flex items-center gap-1.5"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="og-btn-accent rounded-lg px-4 py-2.5 text-sm og-mono"
        >
          {flipped ? "Voir le terme" : "Voir la définition"}
        </button>
        <button
          onClick={() => { setFlipped(false); setIndex((i) => (i + 1) % deck.length); }}
          className="og-btn-ghost rounded-lg px-4 py-2.5 text-sm og-mono flex items-center gap-1.5"
        >
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
