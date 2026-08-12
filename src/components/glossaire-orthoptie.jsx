import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  X,
  Lock,
  LogOut,
  Check,
  Trash2,
  Pencil,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Inbox,
  BookOpen,
  Eye,
  Printer,
  Filter,
  Layers,
  ClipboardList,
  BookMarked,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import FlashcardMode from "@/components/FlashcardMode";
import QuizMode from "@/components/QuizMode";
import AbbreviationsLexicon from "@/components/AbbreviationsLexicon";
import { DEFAULT_ABBREVIATIONS, ABBREVIATION_CATEGORIES } from "@/data/abbreviations";

/* ============================================================
   CONFIGURATION
   ============================================================
   Mot de passe de l'espace administration.
   ⚠️ Ce mot de passe est stocké côté client (dans ce code) : il
   offre une protection simple contre un accès "au hasard", mais
   n'est pas un vrai système de sécurité (il resterait visible
   dans le code source). Changez-le avant de partager l'app, et
   ne l'utilisez pas pour des données sensibles.
   ============================================================ */
const ADMIN_PASSWORD = "ortho2026";
const WELCOME_SEEN_KEY = "og-welcome-seen";

const CATEGORIES = [
  "Anatomie",
  "Physiologie",
  "Strabologie",
  "Pathologies ophtalmologiques",
  "Statistiques médicales",
  "Recherche clinique",
  "Pharmacologie",
  "Réfraction",
];

const DEFAULT_TERMS = [
  {
    term: "Amblyopie",
    nature: "n. f. — Du grec ambluops (vue faible)",
    category: "Pathologies ophtalmologiques",
    definition:
      "Diminution durable de l'acuité visuelle d'un œil, sans lésion organique décelable, liée à un trouble du développement de la vision durant l'enfance (strabisme, anisométropie ou privation sensorielle).",
  },
  {
    term: "Strabisme",
    nature: "n. m. — Du grec strabismos (loucher)",
    category: "Strabologie",
    definition:
      "Trouble de la motricité oculaire caractérisé par une déviation manifeste des axes visuels, permanente ou intermittente, entraînant une perte du parallélisme entre les deux yeux.",
  },
  {
    term: "Diplopie",
    nature: "n. f. — Du grec diploos (double) + ops (œil)",
    category: "Strabologie",
    definition:
      "Perception dédoublée d'un objet unique par le système visuel, le plus souvent liée à une atteinte de la motricité oculaire ou à une rupture de la vision binoculaire.",
  },
  {
    term: "Hétérophorie",
    nature: "n. f. — Du grec heteros (autre) + phoria (tendance)",
    category: "Strabologie",
    definition:
      "Déviation oculaire latente, maintenue alignée par les mécanismes de fusion binoculaire, qui ne se démasque qu'en cas de rupture de cette fusion (écran, test de couverture alterné).",
  },
  {
    term: "Convergence",
    nature: "n. f. — Du latin convergere (tendre vers)",
    category: "Physiologie",
    definition:
      "Mouvement oculaire conjugué et symétrique dirigeant les deux yeux vers l'intérieur, permettant la fixation binoculaire d'un objet situé en vision de près.",
  },
];

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function firstLetter(str) {
  const n = normalize(str);
  return n ? n[0].toUpperCase() : "#";
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.og-root {
  --bg: #EEF3F1;
  --surface: #FFFFFF;
  --ink: #16302B;
  --ink-muted: #5C7A73;
  --line: #DCE6E1;
  --accent: #C97A3D;
  --accent-deep: #9C5A28;
  --accent-soft: #F4E4D6;
  --pending: #B54A3F;
  --pending-soft: #F6E1DD;
  --validated: #3F7A5C;
  --validated-soft: #E1EEE5;
  font-family: 'Space Grotesk', sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
}
.og-serif { font-family: 'Source Serif 4', serif; }
.og-mono { font-family: 'IBM Plex Mono', monospace; }

.og-root *:focus-visible {
  outline: 2px solid var(--accent-deep);
  outline-offset: 2px;
}

.og-header {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 20;
}

.og-logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.og-logo-mark svg { width: 16px; height: 16px; }

.og-search {
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--ink);
}
.og-search::placeholder { color: var(--ink-muted); }
.og-search:focus { border-color: var(--accent); }

.og-btn-accent {
  background: var(--ink);
  color: var(--surface);
  transition: background 0.15s ease;
}
.og-btn-accent:hover { background: var(--accent-deep); }
.og-btn-accent:disabled { opacity: 0.5; cursor: not-allowed; }

.og-btn-ghost {
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.og-btn-ghost:hover { border-color: var(--ink); background: var(--surface); }

.og-icon-btn {
  color: var(--ink-muted);
  transition: color 0.15s ease, background 0.15s ease;
}
.og-icon-btn:hover { color: var(--ink); background: var(--accent-soft); }

.og-sidebar { border-right: 1px solid var(--line); }

.og-az-btn {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--ink-muted);
  transition: color 0.15s ease, background 0.15s ease;
}
.og-az-btn:hover { color: var(--ink); background: var(--accent-soft); }
.og-az-btn.active { color: var(--surface); background: var(--ink); }
.og-az-btn.disabled { color: var(--line); pointer-events: none; }

.og-letter-row {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}
.og-letter-big {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 3rem;
  line-height: 1;
  color: var(--ink);
}
.og-letter-rule {
  flex: 1;
  height: 1px;
  background: var(--line);
}
.og-letter-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  color: var(--ink-muted);
  text-transform: uppercase;
}

.og-card {
  background: var(--surface);
  border: 1px solid var(--line);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.og-card:hover { border-color: var(--accent); box-shadow: 0 2px 14px rgba(22,48,43,0.06); }

.og-term-name {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
}
.og-nature {
  font-family: 'Source Serif 4', serif;
  font-style: italic;
  font-size: 0.85rem;
  color: var(--ink-muted);
  line-height: 1.4;
}
.og-definition {
  font-family: 'Source Serif 4', serif;
  color: var(--ink);
  line-height: 1.55;
}

.og-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.og-badge-pending { background: var(--pending-soft); color: var(--pending); }
.og-badge-validated { background: var(--validated-soft); color: var(--validated); }

.og-modal-backdrop {
  background: rgba(22,48,43,0.45);
  backdrop-filter: blur(2px);
}
.og-modal {
  background: var(--surface);
  border: 1px solid var(--line);
}

.og-input, .og-textarea {
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--ink);
}
.og-input:focus, .og-textarea:focus { border-color: var(--accent); }

.og-tab {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-muted);
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.og-tab.active { color: var(--ink); border-color: var(--accent); }
.og-tab:hover { color: var(--ink); }

.og-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

@media (max-width: 768px) {
  .og-letter-big { font-size: 2.1rem; }
}

.og-cat-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.og-cat-btn:hover { color: var(--ink); border-color: var(--ink); }
.og-cat-btn.active {
  color: var(--surface);
  background: var(--ink);
  border-color: var(--ink);
}

.og-cat-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-deep);
  display: inline-block;
}

.og-badge-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--pending);
  border: 1.5px solid var(--surface);
}

@media print {
  .og-header, .og-sidebar, .og-no-print, .og-study-nav { display: none !important; }
  .og-root { background: #fff !important; }
  .og-card { border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; }
  .og-letter-big { font-size: 1.5rem !important; }
  .og-letter-row { margin-bottom: 0.5rem !important; }
  body { font-size: 11pt; }
}

.og-study-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.og-study-nav-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-muted);
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}
.og-study-nav-btn:hover { color: var(--ink); background: var(--accent-soft); }
.og-study-nav-btn.active {
  color: var(--surface);
  background: var(--ink);
  border-color: var(--ink);
}

.og-flashcard {
  background: var(--surface);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.og-flashcard:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(22,48,43,0.08);
}
.og-flashcard.flipped {
  border-color: var(--accent-deep);
  background: var(--accent-soft);
}

.og-quiz-option {
  background: var(--bg);
  border: 1px solid var(--line);
  color: var(--ink);
  transition: border-color 0.15s ease, background 0.15s ease;
}
.og-quiz-option:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--surface);
}
.og-quiz-option.correct {
  border-color: var(--validated);
  background: var(--validated-soft);
}
.og-quiz-option.wrong {
  border-color: var(--pending);
  background: var(--pending-soft);
}
.og-quiz-option.muted {
  opacity: 0.55;
}
`;

/* ---------------- Sous-composants ---------------- */

function StudyNav({ view, setView }) {
  const items = [
    { id: "glossary", label: "Glossaire", icon: BookOpen },
    { id: "flashcards", label: "Révision", icon: Layers },
    { id: "quiz", label: "Quiz", icon: ClipboardList },
    { id: "abbreviations", label: "Abréviations", icon: BookMarked },
  ];
  return (
    <nav className="og-study-nav og-no-print">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex gap-1.5 overflow-x-auto">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`og-study-nav-btn flex-shrink-0 ${view === id ? "active" : ""}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex items-center justify-center gap-2 py-24 og-eyebrow">
      <Loader2 className="animate-spin" size={16} />
      <span>{label}</span>
    </div>
  );
}

function TermCard({ t, adminView, onEdit, onDelete, editing, editDraft, setEditDraft, onSaveEdit, onCancelEdit, deleteConfirm, onAskDelete, onConfirmDelete, onCancelDelete, editNature, setEditNature, editCategory, setEditCategory }) {
  return (
    <div className="og-card rounded-xl p-4 sm:p-5 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="og-term-name text-lg sm:text-xl">{t.term}</h3>
          {t.category && !editing && (
            <span className="og-cat-badge mt-1">{t.category}</span>
          )}
        </div>
        {adminView && !editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              aria-label={`Modifier ${t.term}`}
              onClick={onEdit}
              className="og-icon-btn p-1.5 rounded-lg"
            >
              <Pencil size={15} />
            </button>
            {deleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onConfirmDelete}
                  className="og-mono text-xs px-2 py-1 rounded-lg"
                  style={{ background: "var(--pending)", color: "#fff" }}
                >
                  Confirmer
                </button>
                <button
                  onClick={onCancelDelete}
                  className="og-mono text-xs px-2 py-1 rounded-lg og-btn-ghost"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                aria-label={`Supprimer ${t.term}`}
                onClick={onAskDelete}
                className="og-icon-btn p-1.5 rounded-lg"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <label className="og-eyebrow block mb-1">Catégorie</label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="og-input w-full rounded-lg px-3 py-2 og-serif text-[0.9rem] mb-2"
          >
            <option value="">— Non classé —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="og-eyebrow block mb-1">Nature / Étymologie</label>
          <input
            value={editNature}
            onChange={(e) => setEditNature(e.target.value)}
            placeholder="ex. n. f. — Du grec ambluops (vue faible)"
            className="og-input w-full rounded-lg px-3 py-2 og-serif italic text-[0.85rem] mb-2"
          />
          <label className="og-eyebrow block mb-1">Définition</label>
          <textarea
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            rows={4}
            className="og-textarea w-full rounded-lg p-3 og-serif text-[0.95rem]"
          />
          <div className="flex items-center gap-2 mt-2">
            <button onClick={onSaveEdit} className="og-btn-accent rounded-lg px-3 py-1.5 text-sm og-mono flex items-center gap-1.5">
              <Check size={14} /> Enregistrer
            </button>
            <button onClick={onCancelEdit} className="og-btn-ghost rounded-lg px-3 py-1.5 text-sm og-mono">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          {t.nature && <p className="og-nature mt-1">{t.nature}</p>}
          <p className="og-definition text-[0.97rem] mt-2">{t.definition}</p>
        </>
      )}
    </div>
  );
}

function AbbrevCard({
  a,
  adminView,
  editing,
  editAbbr,
  setEditAbbr,
  editMeaning,
  setEditMeaning,
  editCategory,
  setEditCategory,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  deleteConfirm,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  return (
    <div className="og-card rounded-xl p-4 sm:p-5 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="og-term-name text-lg og-mono">{a.abbr}</h3>
          {a.category && !editing && <span className="og-cat-badge mt-1">{a.category}</span>}
        </div>
        {adminView && !editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button aria-label={`Modifier ${a.abbr}`} onClick={onEdit} className="og-icon-btn p-1.5 rounded-lg">
              <Pencil size={15} />
            </button>
            {deleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onConfirmDelete}
                  className="og-mono text-xs px-2 py-1 rounded-lg"
                  style={{ background: "var(--pending)", color: "#fff" }}
                >
                  Confirmer
                </button>
                <button onClick={onCancelDelete} className="og-mono text-xs px-2 py-1 rounded-lg og-btn-ghost">
                  Annuler
                </button>
              </div>
            ) : (
              <button aria-label={`Supprimer ${a.abbr}`} onClick={onAskDelete} className="og-icon-btn p-1.5 rounded-lg">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <label className="og-eyebrow block mb-1">Abréviation *</label>
          <input
            value={editAbbr}
            onChange={(e) => setEditAbbr(e.target.value)}
            className="og-input w-full rounded-lg px-3 py-2 og-mono text-[0.95rem] mb-2"
          />
          <label className="og-eyebrow block mb-1">Catégorie</label>
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="og-input w-full rounded-lg px-3 py-2 og-serif text-[0.9rem] mb-2"
          >
            <option value="">— Non classé —</option>
            {ABBREVIATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="og-eyebrow block mb-1">Signification *</label>
          <textarea
            value={editMeaning}
            onChange={(e) => setEditMeaning(e.target.value)}
            rows={3}
            className="og-textarea w-full rounded-lg p-3 og-serif text-[0.95rem]"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              disabled={!editAbbr.trim() || !editMeaning.trim()}
              onClick={onSaveEdit}
              className="og-btn-accent rounded-lg px-3 py-1.5 text-sm og-mono flex items-center gap-1.5"
            >
              <Check size={14} /> Enregistrer
            </button>
            <button onClick={onCancelEdit} className="og-btn-ghost rounded-lg px-3 py-1.5 text-sm og-mono">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <p className="og-definition text-[0.97rem] mt-2">{a.meaning}</p>
      )}
    </div>
  );
}

function ProposeModal({ onClose, onSubmit, submitting, success }) {
  const [term, setTerm] = useState("");
  const [note, setNote] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="og-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="og-modal rounded-2xl w-full max-w-md p-6 relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="og-icon-btn absolute top-4 right-4 p-1.5 rounded-lg"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-6 text-center">
            <div className="og-logo-mark mx-auto mb-4" style={{ borderColor: "var(--validated)" }}>
              <Check size={16} color="var(--validated)" />
            </div>
            <h3 className="og-term-name text-lg mb-1">Terme envoyé</h3>
            <p className="og-eyebrow">Il sera examiné par l'équipe avant publication.</p>
            <button onClick={onClose} className="og-btn-accent rounded-lg px-4 py-2 text-sm og-mono mt-5">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <h3 className="og-term-name text-xl mb-1">Proposer un terme</h3>
            <p className="og-eyebrow mb-5">Un mot manquant au glossaire ? Proposez-le, la définition sera rédigée à la validation.</p>

            <label className="og-eyebrow block mb-1.5">Terme *</label>
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="ex. Anisométropie"
              className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.97rem] mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter" && term.trim() && !submitting) onSubmit(term, note);
              }}
            />

            <label className="og-eyebrow block mb-1.5">Contexte (facultatif)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Où avez-vous rencontré ce terme ? Une piste de définition ?"
              rows={3}
              className="og-textarea w-full rounded-lg px-3 py-2.5 og-serif text-[0.95rem] mb-5"
            />

            <button
              disabled={!term.trim() || submitting}
              onClick={() => onSubmit(term, note)}
              className="og-btn-accent w-full rounded-lg py-2.5 text-sm og-mono flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
              {submitting ? "Envoi…" : "Envoyer la proposition"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoginModal({ onClose, onSubmit, error }) {
  const [pwd, setPwd] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div className="og-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="og-modal rounded-2xl w-full max-w-sm p-6 relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="og-icon-btn absolute top-4 right-4 p-1.5 rounded-lg"
        >
          <X size={18} />
        </button>
        <div className="og-logo-mark mb-4">
          <Lock size={15} />
        </div>
        <h3 className="og-term-name text-xl mb-1">Espace administration</h3>
        <p className="og-eyebrow mb-5">Réservé à l'équipe de validation.</p>
        <input
          ref={inputRef}
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Mot de passe"
          className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.97rem] mb-2"
          onKeyDown={(e) => e.key === "Enter" && onSubmit(pwd)}
        />
        {error && (
          <p className="text-sm mb-3 flex items-center gap-1.5" style={{ color: "var(--pending)" }}>
            <AlertCircle size={14} /> {error}
          </p>
        )}
        <button
          onClick={() => onSubmit(pwd)}
          className="og-btn-accent w-full rounded-lg py-2.5 text-sm og-mono mt-2"
        >
          Entrer
        </button>
      </div>
    </div>
  );
}

function WelcomeModal({ onClose }) {
  return (
    <div className="og-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="og-modal rounded-2xl w-full max-w-md p-6 relative text-center">
        <div className="og-logo-mark mx-auto mb-4">
          <BookOpen size={16} color="var(--ink)" strokeWidth={2} />
        </div>
        <h3 className="og-term-name text-xl mb-4">Ortho·Glossaire</h3>
        <p className="og-definition text-[0.97rem] mb-2">
          Votre glossaire d'orthoptie : définitions, abréviations, flashcards et quiz pour réviser à votre rythme.
        </p>
        <p className="og-eyebrow mb-6">
          Réalisé par Simon BARBARAY, Maxence RATEAUX et Alice LECLERCQ
        </p>
        <button
          onClick={onClose}
          className="og-btn-accent rounded-lg px-5 py-2.5 text-sm og-mono"
        >
          Entrer dans le glossaire
        </button>
      </div>
    </div>
  );
}

function AddTermModal({ onClose, onSubmit, submitting }) {
  const [term, setTerm] = useState("");
  const [nature, setNature] = useState("");
  const [category, setCategory] = useState("");
  const [def, setDef] = useState("");
  return (
    <div className="og-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="og-modal rounded-2xl w-full max-w-md p-6 relative">
        <button
          aria-label="Fermer"
          onClick={onClose}
          className="og-icon-btn absolute top-4 right-4 p-1.5 rounded-lg"
        >
          <X size={18} />
        </button>
        <h3 className="og-term-name text-xl mb-4">Ajouter un terme</h3>
        <label className="og-eyebrow block mb-1.5">Terme *</label>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.97rem] mb-3"
        />
        <label className="og-eyebrow block mb-1.5">Catégorie (facultatif)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.9rem] mb-3"
        >
          <option value="">— Non classé —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="og-eyebrow block mb-1.5">Nature / Étymologie (facultatif)</label>
        <input
          value={nature}
          onChange={(e) => setNature(e.target.value)}
          placeholder="ex. n. f. — Du grec ambluops (vue faible)"
          className="og-input w-full rounded-lg px-3 py-2.5 og-serif italic text-[0.9rem] mb-3"
        />
        <label className="og-eyebrow block mb-1.5">Définition *</label>
        <textarea
          value={def}
          onChange={(e) => setDef(e.target.value)}
          rows={4}
          className="og-textarea w-full rounded-lg px-3 py-2.5 og-serif text-[0.95rem] mb-5"
        />
        <button
          disabled={!term.trim() || !def.trim() || submitting}
          onClick={() => onSubmit(term, nature, category, def)}
          className="og-btn-accent w-full rounded-lg py-2.5 text-sm og-mono flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
          {submitting ? "Ajout…" : "Ajouter au glossaire"}
        </button>
      </div>
    </div>
  );
}

function AddAbbrevModal({ onClose, onSubmit, submitting }) {
  const [abbr, setAbbr] = useState("");
  const [meaning, setMeaning] = useState("");
  const [category, setCategory] = useState("");
  return (
    <div className="og-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="og-modal rounded-2xl w-full max-w-md p-6 relative">
        <button aria-label="Fermer" onClick={onClose} className="og-icon-btn absolute top-4 right-4 p-1.5 rounded-lg">
          <X size={18} />
        </button>
        <h3 className="og-term-name text-xl mb-4">Ajouter une abréviation</h3>
        <label className="og-eyebrow block mb-1.5">Abréviation *</label>
        <input
          value={abbr}
          onChange={(e) => setAbbr(e.target.value)}
          placeholder="ex. AV"
          className="og-input w-full rounded-lg px-3 py-2.5 og-mono text-[0.97rem] mb-3"
        />
        <label className="og-eyebrow block mb-1.5">Catégorie (facultatif)</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.9rem] mb-3"
        >
          <option value="">— Non classé —</option>
          {ABBREVIATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="og-eyebrow block mb-1.5">Signification *</label>
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          rows={3}
          placeholder="ex. Acuité visuelle"
          className="og-textarea w-full rounded-lg px-3 py-2.5 og-serif text-[0.95rem] mb-5"
        />
        <button
          disabled={!abbr.trim() || !meaning.trim() || submitting}
          onClick={() => onSubmit(abbr, meaning, category)}
          className="og-btn-accent w-full rounded-lg py-2.5 text-sm og-mono flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />}
          {submitting ? "Ajout…" : "Ajouter au lexique"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Composant principal ---------------- */

export default function OrthoGlossaire() {
  const [terms, setTerms] = useState([]);
  const [abbreviations, setAbbreviations] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");

  const [view, setView] = useState("glossary");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("pending");

  const [showWelcome, setShowWelcome] = useState(
    () => localStorage.getItem(WELCOME_SEEN_KEY) !== "1"
  );

  const [showPropose, setShowPropose] = useState(false);
  const [proposeSubmitting, setProposeSubmitting] = useState(false);
  const [proposeSuccess, setProposeSuccess] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [showAddTerm, setShowAddTerm] = useState(false);
  const [addTermSubmitting, setAddTermSubmitting] = useState(false);

  const [showAddAbbrev, setShowAddAbbrev] = useState(false);
  const [addAbbrevSubmitting, setAddAbbrevSubmitting] = useState(false);
  const [editingAbbrevId, setEditingAbbrevId] = useState(null);
  const [editAbbrevAbbr, setEditAbbrevAbbr] = useState("");
  const [editAbbrevMeaning, setEditAbbrevMeaning] = useState("");
  const [editAbbrevCategory, setEditAbbrevCategory] = useState("");
  const [deleteAbbrevConfirmId, setDeleteAbbrevConfirmId] = useState(null);

  const [drafts, setDrafts] = useState({});
  const [natureDrafts, setNatureDrafts] = useState({});
  const [categoryDrafts, setCategoryDrafts] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [editNature, setEditNature] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError(false);

    try {
      const { data: termsData, error: termsError } = await supabase
        .from("glossary_terms")
        .select("id, term, nature, category, definition")
        .order("term", { ascending: true });
      if (termsError) throw termsError;

      let loadedTerms = termsData || [];
      if (loadedTerms.length === 0) {
        const { data: seeded, error: seedError } = await supabase
          .from("glossary_terms")
          .insert(DEFAULT_TERMS)
          .select("id, term, nature, category, definition");
        if (seedError) throw seedError;
        loadedTerms = seeded || [];
      }

      const { data: proposalsData, error: proposalsError } = await supabase
        .from("glossary_proposals")
        .select("id, term, note, status, created_at")
        .order("created_at", { ascending: false });
      if (proposalsError) throw proposalsError;

      const { data: abbrData, error: abbrError } = await supabase
        .from("glossary_abbreviations")
        .select("id, abbr, meaning, category")
        .order("abbr", { ascending: true });
      if (abbrError) throw abbrError;

      let loadedAbbr = abbrData || [];
      if (loadedAbbr.length === 0) {
        const { data: seededAbbr, error: seedAbbrError } = await supabase
          .from("glossary_abbreviations")
          .insert(DEFAULT_ABBREVIATIONS)
          .select("id, abbr, meaning, category");
        if (seedAbbrError) throw seedAbbrError;
        loadedAbbr = seededAbbr || [];
      }

      setTerms(loadedTerms);
      setAbbreviations(loadedAbbr);
      setProposals(
        (proposalsData || []).map((p) => ({
          id: p.id,
          term: p.term,
          note: p.note,
          date: p.created_at,
          status: p.status,
        }))
      );
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  const filteredGrouped = useMemo(() => {
    const q = normalize(search);
    const filtered = terms.filter((t) => {
      const matchesSearch = !q || normalize(t.term).includes(q) || normalize(t.definition).includes(q);
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term, "fr"));
    const groups = {};
    for (const t of sorted) {
      const l = firstLetter(t.term);
      if (!groups[l]) groups[l] = [];
      groups[l].push(t);
    }
    return groups;
  }, [terms, search, categoryFilter]);

  const allLetters = useMemo(() => {
    const set = new Set(terms.map((t) => firstLetter(t.term)));
    return Array.from(set).sort();
  }, [terms]);

  const presentLetters = Object.keys(filteredGrouped).sort();

  function scrollToLetter(letter) {
    const el = document.getElementById(`og-letter-${letter}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitProposal(term, note) {
    setProposeSubmitting(true);
    const { data, error } = await supabase
      .from("glossary_proposals")
      .insert({ term: term.trim(), note: note.trim() })
      .select("id, term, note, status, created_at")
      .maybeSingle();
    setProposeSubmitting(false);
    if (error || !data) {
      setLoadError(true);
      return;
    }
    setProposals((prev) => [
      { id: data.id, term: data.term, note: data.note, date: data.created_at, status: data.status },
      ...prev,
    ]);
    setProposeSuccess(true);
  }

  function closeProposeModal() {
    setShowPropose(false);
    setProposeSuccess(false);
  }

  function handleLogin(pwd) {
    if (pwd === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError("");
      setView("admin");
    } else {
      setLoginError("Mot de passe incorrect.");
    }
  }

  function logout() {
    setIsAdmin(false);
    setView("glossary");
  }

  async function validateProposal(proposal) {
    const def = (drafts[proposal.id] || "").trim();
    const nature = (natureDrafts[proposal.id] || "").trim();
    const category = (categoryDrafts[proposal.id] || "").trim();
    if (!def) return;

    const existing = terms.find((t) => normalize(t.term) === normalize(proposal.term));
    let nextTerms;

    if (existing) {
      const { error } = await supabase
        .from("glossary_terms")
        .update({ definition: def, nature: nature || null, category: category || null })
        .eq("id", existing.id);
      if (error) {
        setLoadError(true);
        return;
      }
      nextTerms = terms.map((t) => (t.id === existing.id ? { ...t, definition: def, nature, category } : t));
    } else {
      const { data, error } = await supabase
        .from("glossary_terms")
        .insert({ term: proposal.term, definition: def, nature: nature || null, category: category || null })
        .select("id, term, nature, category, definition")
        .maybeSingle();
      if (error || !data) {
        setLoadError(true);
        return;
      }
      nextTerms = [...terms, data];
    }

    const { error: delError } = await supabase
      .from("glossary_proposals")
      .delete()
      .eq("id", proposal.id);
    if (delError) {
      setLoadError(true);
      return;
    }

    setTerms(nextTerms);
    setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
    setDrafts((d) => {
      const { [proposal.id]: _, ...rest } = d;
      return rest;
    });
    setNatureDrafts((d) => {
      const { [proposal.id]: _, ...rest } = d;
      return rest;
    });
    setCategoryDrafts((d) => {
      const { [proposal.id]: _, ...rest } = d;
      return rest;
    });
  }

  async function rejectProposal(proposal) {
    const { error } = await supabase
      .from("glossary_proposals")
      .delete()
      .eq("id", proposal.id);
    if (error) {
      setLoadError(true);
      return;
    }
    setProposals((prev) => prev.filter((p) => p.id !== proposal.id));
  }

  function startEdit(t) {
    setEditingId(t.id);
    setEditDraft(t.definition);
    setEditNature(t.nature || "");
    setEditCategory(t.category || "");
  }

  async function saveEdit(t) {
    const definition = editDraft.trim();
    const nature = editNature.trim();
    const category = editCategory.trim();
    const { error } = await supabase
      .from("glossary_terms")
      .update({ definition, nature: nature || null, category: category || null })
      .eq("id", t.id);
    if (error) {
      setLoadError(true);
      return;
    }
    setTerms((prev) => prev.map((x) => (x.id === t.id ? { ...x, definition, nature, category } : x)));
    setEditingId(null);
  }

  async function deleteTerm(t) {
    const { error } = await supabase.from("glossary_terms").delete().eq("id", t.id);
    if (error) {
      setLoadError(true);
      return;
    }
    setTerms((prev) => prev.filter((x) => x.id !== t.id));
    setDeleteConfirmId(null);
  }

  async function addTermDirect(term, nature, category, def) {
    setAddTermSubmitting(true);
    const { data, error } = await supabase
      .from("glossary_terms")
      .insert({ term: term.trim(), nature: nature.trim() || null, category: category.trim() || null, definition: def.trim() })
      .select("id, term, nature, category, definition")
      .maybeSingle();
    setAddTermSubmitting(false);
    if (error || !data) {
      setLoadError(true);
      return;
    }
    setTerms((prev) => [...prev, data]);
    setShowAddTerm(false);
  }

  function startEditAbbrev(a) {
    setEditingAbbrevId(a.id);
    setEditAbbrevAbbr(a.abbr);
    setEditAbbrevMeaning(a.meaning);
    setEditAbbrevCategory(a.category || "");
  }

  async function saveEditAbbrev(a) {
    const abbr = editAbbrevAbbr.trim();
    const meaning = editAbbrevMeaning.trim();
    const category = editAbbrevCategory.trim() || null;
    const { error } = await supabase
      .from("glossary_abbreviations")
      .update({ abbr, meaning, category })
      .eq("id", a.id);
    if (error) {
      setLoadError(true);
      return;
    }
    setAbbreviations((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, abbr, meaning, category } : x))
    );
    setEditingAbbrevId(null);
  }

  async function deleteAbbrev(a) {
    const { error } = await supabase.from("glossary_abbreviations").delete().eq("id", a.id);
    if (error) {
      setLoadError(true);
      return;
    }
    setAbbreviations((prev) => prev.filter((x) => x.id !== a.id));
    setDeleteAbbrevConfirmId(null);
  }

  async function addAbbrevDirect(abbr, meaning, category) {
    setAddAbbrevSubmitting(true);
    const { data, error } = await supabase
      .from("glossary_abbreviations")
      .insert({
        abbr: abbr.trim(),
        meaning: meaning.trim(),
        category: category.trim() || null,
      })
      .select("id, abbr, meaning, category")
      .maybeSingle();
    setAddAbbrevSubmitting(false);
    if (error || !data) {
      setLoadError(true);
      return;
    }
    setAbbreviations((prev) => [...prev, data].sort((a, b) => a.abbr.localeCompare(b.abbr, "fr")));
    setShowAddAbbrev(false);
  }

  const pendingCount = proposals.length;

  return (
    <div className="og-root">
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="og-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="og-logo-mark">
            <Eye size={16} color="var(--ink)" strokeWidth={2} />
          </div>
          <div className="mr-2 hidden sm:block">
            <div className="og-term-name text-[0.95rem] leading-tight">Ortho·Glossaire</div>
            <div className="og-eyebrow leading-tight">Orthoptie</div>
          </div>

          {view === "glossary" ? (
            <>
              <div className="relative flex-1 max-w-md">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  color="var(--ink-muted)"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un terme…"
                  className="og-search w-full rounded-lg pl-9 pr-3 py-2 text-sm og-serif"
                />
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setShowPropose(true)}
                className="og-btn-accent rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm og-mono flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Proposer un terme</span>
                <span className="inline sm:hidden">Proposer</span>
              </button>
              <button
                aria-label="Administration"
                onClick={() => (isAdmin ? setView("admin") : setShowLogin(true))}
                className="og-icon-btn p-2 rounded-lg flex-shrink-0 relative"
              >
                <Lock size={16} />
                {pendingCount > 0 && !isAdmin && <span className="og-badge-dot" />}
              </button>
              <button
                aria-label="Imprimer le glossaire"
                onClick={() => window.print()}
                className="og-icon-btn p-2 rounded-lg flex-shrink-0 og-no-print"
              >
                <Printer size={16} />
              </button>
            </>
          ) : view === "admin" ? (
            <>
              <div className="flex-1" />
              <button
                onClick={() => setView("glossary")}
                className="og-btn-ghost rounded-lg px-3 py-2 text-xs sm:text-sm og-mono flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Retour au glossaire
              </button>
              <button
                onClick={logout}
                className="og-icon-btn p-2 rounded-lg"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1" />
              <button
                aria-label="Administration"
                onClick={() => (isAdmin ? setView("admin") : setShowLogin(true))}
                className="og-icon-btn p-2 rounded-lg flex-shrink-0 relative"
              >
                <Lock size={16} />
                {pendingCount > 0 && !isAdmin && <span className="og-badge-dot" />}
              </button>
            </>
          )}
        </div>
      </header>

      {view !== "admin" && <StudyNav view={view} setView={setView} />}

      {loadError && (
        <div
          className="text-center py-2 text-sm og-mono flex items-center justify-center gap-2"
          style={{ background: "var(--pending-soft)", color: "var(--pending)" }}
        >
          <AlertCircle size={14} />
          Synchronisation impossible.
          <button onClick={loadData} className="underline">
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <Spinner label="Chargement du glossaire…" />
      ) : view === "flashcards" ? (
        <FlashcardMode terms={terms} categories={CATEGORIES} />
      ) : view === "quiz" ? (
        <QuizMode terms={terms} categories={CATEGORIES} />
      ) : view === "abbreviations" ? (
        <AbbreviationsLexicon abbreviations={abbreviations} categories={ABBREVIATION_CATEGORIES} />
      ) : view === "glossary" ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-8">
          {/* SIDEBAR A-Z + Categories */}
          <aside className="og-sidebar hidden sm:flex flex-col pr-4 gap-0.5 sticky top-[70px] self-start h-fit og-no-print">
            <button
              onClick={() => setShowCategories((v) => !v)}
              className="og-eyebrow flex items-center gap-1.5 mb-2 text-left"
            >
              <Filter size={12} /> Catégories
            </button>
            {showCategories && (
              <div className="flex flex-wrap gap-1.5 mb-3 max-w-[160px]">
                <button
                  onClick={() => setCategoryFilter("")}
                  className={`og-cat-btn ${categoryFilter === "" ? "active" : ""}`}
                >
                  Toutes
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c === categoryFilter ? "" : c)}
                    className={`og-cat-btn ${categoryFilter === c ? "active" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
              <button
                key={l}
                onClick={() => allLetters.includes(l) && scrollToLetter(l)}
                className={`og-az-btn text-xs w-7 h-6 rounded ${
                  !allLetters.includes(l) ? "disabled" : ""}`}
              >
                {l}
              </button>
            ))}
            <div className="og-eyebrow pt-3 mt-2 border-t" style={{ borderColor: "var(--line)" }}>
              {terms.length} terme{terms.length > 1 ? "s" : ""}
            </div>
          </aside>

          {/* LISTE */}
          <main className="flex-1 min-w-0">
            {presentLetters.length === 0 ? (
              <div className="text-center py-20">
                <p className="og-term-name text-lg mb-1">Aucun résultat</p>
                <p className="og-eyebrow">Essayez un autre mot, ou proposez-le au glossaire.</p>
              </div>
            ) : (
              presentLetters.map((letter) => (
                <section key={letter} id={`og-letter-${letter}`} className="mb-8 scroll-mt-20">
                  <div className="og-letter-row">
                    <span className="og-letter-big">{letter}</span>
                    <span className="og-letter-rule" />
                    <span className="og-letter-count">
                      {filteredGrouped[letter].length} terme{filteredGrouped[letter].length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {filteredGrouped[letter].map((t) => (
                    <TermCard key={t.id} t={t} adminView={false} />
                  ))}
                </section>
              ))
            )}
          </main>
        </div>
      ) : (
        /* ADMIN VIEW */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="og-term-name text-2xl mb-1">Administration</h2>
          <p className="og-eyebrow mb-6">Validez les propositions et gérez le glossaire et les abréviations.</p>

          <div className="flex items-center gap-6 border-b mb-6 flex-wrap" style={{ borderColor: "var(--line)" }}>
            <button
              onClick={() => setAdminTab("pending")}
              className={`og-tab pb-3 ${adminTab === "pending" ? "active" : ""}`}
            >
              Propositions en attente ({pendingCount})
            </button>
            <button
              onClick={() => setAdminTab("all")}
              className={`og-tab pb-3 ${adminTab === "all" ? "active" : ""}`}
            >
              Termes du glossaire ({terms.length})
            </button>
            <button
              onClick={() => setAdminTab("abbreviations")}
              className={`og-tab pb-3 ${adminTab === "abbreviations" ? "active" : ""}`}
            >
              Abréviations ({abbreviations.length})
            </button>
          </div>

          {adminTab === "pending" ? (
            proposals.length === 0 ? (
              <div className="text-center py-16">
                <Inbox size={28} color="var(--ink-muted)" className="mx-auto mb-3" />
                <p className="og-eyebrow">Aucune proposition en attente pour le moment.</p>
              </div>
            ) : (
              proposals.map((p) => (
                <div key={p.id} className="og-card rounded-xl p-4 sm:p-5 mb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="og-term-name text-lg">{p.term}</h3>
                        <span className="og-badge og-badge-pending">En attente</span>
                      </div>
                      <p className="og-eyebrow mt-0.5">Proposé le {formatDate(p.date)}</p>
                    </div>
                  </div>
                  {p.note && (
                    <p className="og-definition text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
                      « {p.note} »
                    </p>
                  )}
                  <label className="og-eyebrow block mb-1.5">Catégorie (facultatif)</label>
                  <select
                    value={categoryDrafts[p.id] || ""}
                    onChange={(e) => setCategoryDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="og-input w-full rounded-lg px-3 py-2.5 og-serif text-[0.9rem] mb-3"
                  >
                    <option value="">— Non classé —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <label className="og-eyebrow block mb-1.5">Nature / Étymologie (facultatif)</label>
                  <input
                    value={natureDrafts[p.id] || ""}
                    onChange={(e) => setNatureDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    placeholder="ex. n. f. — Du grec ambluops (vue faible)"
                    className="og-input w-full rounded-lg px-3 py-2.5 og-serif italic text-[0.9rem] mb-3"
                  />
                  <label className="og-eyebrow block mb-1.5">Définition à publier</label>
                  <textarea
                    value={drafts[p.id] || ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    rows={3}
                    placeholder="Rédigez la définition adaptée…"
                    className="og-textarea w-full rounded-lg px-3 py-2.5 og-serif text-sm mb-3"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!(drafts[p.id] || "").trim()}
                      onClick={() => validateProposal(p)}
                      className="og-btn-accent rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5"
                    >
                      <Check size={14} /> Valider et ajouter
                    </button>
                    <button
                      onClick={() => rejectProposal(p)}
                      className="og-btn-ghost rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5"
                    >
                      <X size={14} /> Rejeter
                    </button>
                  </div>
                </div>
              ))
            )
          ) : adminTab === "all" ? (
            <>
              <button
                onClick={() => setShowAddTerm(true)}
                className="og-btn-ghost rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5 mb-4"
              >
                <Plus size={14} /> Ajouter un terme directement
              </button>
              {[...terms]
                .sort((a, b) => a.term.localeCompare(b.term, "fr"))
                .map((t) => (
                  <TermCard
                    key={t.id}
                    t={t}
                    adminView
                    editing={editingId === t.id}
                    editDraft={editDraft}
                    setEditDraft={setEditDraft}
                    editNature={editNature}
                    setEditNature={setEditNature}
                    editCategory={editCategory}
                    setEditCategory={setEditCategory}
                    onEdit={() => startEdit(t)}
                    onSaveEdit={() => saveEdit(t)}
                    onCancelEdit={() => setEditingId(null)}
                    deleteConfirm={deleteConfirmId === t.id}
                    onAskDelete={() => setDeleteConfirmId(t.id)}
                    onConfirmDelete={() => deleteTerm(t)}
                    onCancelDelete={() => setDeleteConfirmId(null)}
                  />
                ))}
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAddAbbrev(true)}
                className="og-btn-ghost rounded-lg px-3 py-2 text-xs og-mono flex items-center gap-1.5 mb-4"
              >
                <Plus size={14} /> Ajouter une abréviation
              </button>
              {[...abbreviations]
                .sort((a, b) => a.abbr.localeCompare(b.abbr, "fr"))
                .map((a) => (
                  <AbbrevCard
                    key={a.id}
                    a={a}
                    adminView
                    editing={editingAbbrevId === a.id}
                    editAbbr={editAbbrevAbbr}
                    setEditAbbr={setEditAbbrevAbbr}
                    editMeaning={editAbbrevMeaning}
                    setEditMeaning={setEditAbbrevMeaning}
                    editCategory={editAbbrevCategory}
                    setEditCategory={setEditAbbrevCategory}
                    onEdit={() => startEditAbbrev(a)}
                    onSaveEdit={() => saveEditAbbrev(a)}
                    onCancelEdit={() => setEditingAbbrevId(null)}
                    deleteConfirm={deleteAbbrevConfirmId === a.id}
                    onAskDelete={() => setDeleteAbbrevConfirmId(a.id)}
                    onConfirmDelete={() => deleteAbbrev(a)}
                    onCancelDelete={() => setDeleteAbbrevConfirmId(null)}
                  />
                ))}
            </>
          )}
        </div>
      )}

      {showWelcome && (
        <WelcomeModal
          onClose={() => {
            localStorage.setItem(WELCOME_SEEN_KEY, "1");
            setShowWelcome(false);
          }}
        />
      )}
      {showPropose && (
        <ProposeModal
          onClose={closeProposeModal}
          onSubmit={submitProposal}
          submitting={proposeSubmitting}
          success={proposeSuccess}
        />
      )}
      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false);
            setLoginError("");
          }}
          onSubmit={handleLogin}
          error={loginError}
        />
      )}
      {showAddTerm && (
        <AddTermModal
          onClose={() => setShowAddTerm(false)}
          onSubmit={addTermDirect}
          submitting={addTermSubmitting}
        />
      )}
      {showAddAbbrev && (
        <AddAbbrevModal
          onClose={() => setShowAddAbbrev(false)}
          onSubmit={addAbbrevDirect}
          submitting={addAbbrevSubmitting}
        />
      )}
    </div>
  );
}
