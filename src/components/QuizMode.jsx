import { useState, useMemo } from "react";
import { CheckCircle, XCircle, RotateCw, Trophy } from "lucide-react";
import { buildQuizQuestions } from "@/lib/study-utils";

const QUIZ_SIZE = 10;

export default function QuizMode({ terms, categories }) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sessionKey, setSessionKey] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = useMemo(
    () => buildQuizQuestions(terms, categoryFilter, QUIZ_SIZE),
    [terms, categoryFilter, sessionKey]
  );

  function restart() {
    setSessionKey((k) => k + 1);
    setQuestionIndex(0);
    setSelectedId(null);
    setScore(0);
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="og-term-name text-lg mb-1">Quiz indisponible</p>
        <p className="og-eyebrow">
          Il faut au moins 4 termes avec définition{categoryFilter ? " dans cette catégorie" : ""} pour lancer un quiz.
        </p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="og-logo-mark mx-auto mb-4" style={{ width: 48, height: 48 }}>
          <Trophy size={22} color="var(--accent-deep)" />
        </div>
        <h2 className="og-term-name text-2xl mb-2">Résultat du quiz</h2>
        <p className="og-definition text-3xl mb-1">{score} / {questions.length}</p>
        <p className="og-eyebrow mb-8">{pct}% de bonnes réponses</p>
        <button onClick={restart} className="og-btn-accent rounded-lg px-5 py-2.5 text-sm og-mono flex items-center gap-2 mx-auto">
          <RotateCw size={15} /> Recommencer
        </button>
      </div>
    );
  }

  const q = questions[questionIndex];
  const answered = selectedId !== null;
  const isCorrect = selectedId === q.correctId;

  function pickOption(id) {
    if (answered) return;
    setSelectedId(id);
    if (id === q.correctId) setScore((s) => s + 1);
  }

  function nextQuestion() {
    if (questionIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="og-term-name text-2xl mb-1">Quiz auto-évaluatif</h2>
          <p className="og-eyebrow">Choisissez la bonne définition</p>
        </div>
        <span className="og-mono text-sm" style={{ color: "var(--ink-muted)" }}>
          Score : {score} · {questionIndex + 1}/{questions.length}
        </span>
      </div>

      <select
        value={categoryFilter}
        onChange={(e) => { setCategoryFilter(e.target.value); restart(); }}
        className="og-input rounded-lg px-3 py-2 text-sm og-serif mb-6 w-full sm:w-auto"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="og-card rounded-2xl p-6 sm:p-8 mb-6">
        {q.term.category && <span className="og-cat-badge mb-3">{q.term.category}</span>}
        <p className="og-eyebrow mb-2">Quelle est la définition de</p>
        <p className="og-term-name text-2xl sm:text-3xl mb-6">{q.term.term}</p>

        <div className="flex flex-col gap-2">
          {q.options.map((opt) => {
            let cls = "og-quiz-option w-full rounded-xl px-4 py-3 text-left og-serif text-sm";
            if (answered) {
              if (opt.id === q.correctId) cls += " correct";
              else if (opt.id === selectedId) cls += " wrong";
              else cls += " muted";
            }
            return (
              <button
                key={opt.id}
                disabled={answered}
                onClick={() => pickOption(opt.id)}
                className={cls}
              >
                {opt.definition}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className="mt-5 flex items-center gap-2 text-sm og-mono"
            style={{ color: isCorrect ? "var(--validated)" : "var(--pending)" }}
          >
            {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {isCorrect ? "Bonne réponse !" : "Ce n'était pas la bonne définition."}
          </div>
        )}
      </div>

      {answered && (
        <button onClick={nextQuestion} className="og-btn-accent w-full rounded-lg py-2.5 text-sm og-mono">
          {questionIndex + 1 >= questions.length ? "Voir le résultat" : "Question suivante"}
        </button>
      )}
    </div>
  );
}
