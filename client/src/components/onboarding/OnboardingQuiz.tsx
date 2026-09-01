import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { OnboardingQuizQuestion } from '../../types/index';

interface OnboardingQuizProps {
  questions: OnboardingQuizQuestion[];
}

export const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleCheck = () => {
    setSubmitted(true);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  const allAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);
  const score = calculateScore();

  return (
    <div className="space-y-5">
      <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-zinc-300" />
          <div>
            <h4 className="text-xs font-semibold text-white">Comprehension Check</h4>
            <p className="text-[11px] text-zinc-500">Verify your understanding of this repository.</p>
          </div>
        </div>

        {submitted && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500">SCORE</span>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {score} / {questions.length} Correct
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {questions.map((q, qIdx) => {
          const selected = selectedAnswers[q.id];
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-2.5"
            >
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <h5 className="text-xs font-medium text-white">{q.question}</h5>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'border-white/[0.06] bg-[#090A0D] hover:bg-zinc-800 text-zinc-300';

                  if (selected === optIdx) {
                    optStyle = 'border-white/40 bg-zinc-800 text-white font-medium';
                  }

                  if (submitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium';
                    } else if (selected === optIdx && !isCorrect) {
                      optStyle = 'border-rose-500/40 bg-rose-500/10 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`p-2.5 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      {submitted && selected === optIdx && !isCorrect && (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="p-2.5 rounded-md bg-[#0A0B0E] border border-white/[0.05] text-[11px] text-zinc-400 space-y-0.5 animate-in fade-in">
                  <span className="font-semibold text-zinc-300 block text-[10px] uppercase tracking-wider">
                    Explanation:
                  </span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {submitted ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retake Quiz</span>
          </button>
        ) : (
          <button
            onClick={handleCheck}
            disabled={!allAnswered}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs shadow-sm transition-all active:scale-98 disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span>Check Answers</span>
          </button>
        )}
      </div>
    </div>
  );
};
