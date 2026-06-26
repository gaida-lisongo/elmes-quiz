'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import MathRenderer from '@/components/common/MathRenderer';
import { Loader2, Timer, CheckCircle2, XCircle } from 'lucide-react';
import { useSound } from '@/context/SoundContext';
import type { QuestionClient, SubmitAnswerResult } from '@/app/actions/partie.actions';

interface GameEngineProps {
  questions: QuestionClient[];
  partieId: string;
  questionExpiresAt: number;
  onSubmitAnswer: (
    partieId: string,
    quizId: string,
    answerIndex: number | null
  ) => Promise<SubmitAnswerResult>;
  onGameOver: (result: SubmitAnswerResult) => void;
}

const TOTAL_SECONDS = 15;

const GameEngine: React.FC<GameEngineProps> = ({
  questions,
  partieId,
  questionExpiresAt: initialExpiresAt,
  onSubmitAnswer,
  onGameOver,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.ceil((initialExpiresAt - Date.now()) / 1000)));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [animateOut, setAnimateOut] = useState(false);

  const frozenRef = useRef(false);
  const question = questions[currentIndex];
  const { playSound } = useSound();

  // ── Compte à rebours purement visuel (autorité = serveur) ──
  useEffect(() => {
    frozenRef.current = false;
    setSelectedAnswer(null);
    setFeedback(null);
    setSubmitting(false);
    setAnimateOut(false);

    const tick = () => {
      if (frozenRef.current) return;
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !frozenRef.current) {
        frozenRef.current = true;
        // Le serveur détectera le timeout dans submitAnswer
        handleTimeout();
      }
    };

    tick(); // immédiat
    const id = setInterval(tick, 200); // rafraîchit 5×/s pour fluidité
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, expiresAt]);

  // ── Timeout : on envoie answerIndex = null, le serveur tranche ──
  const handleTimeout = useCallback(async () => {
    setSubmitting(true);
    try {
      const result = await onSubmitAnswer(partieId, question.quizId, null);
      setAnimateOut(true);
      setTimeout(() => onGameOver(result), 400);
    } catch {
      onGameOver({ correct: false, gameOver: true, isLastQuestion: false, won: false });
    } finally {
      setSubmitting(false);
    }
  }, [partieId, question, onSubmitAnswer, onGameOver]);

  // ── Submit answer ──
  const handleSelectAnswer = useCallback(
    async (idx: number) => {
      if (frozenRef.current || submitting || feedback) return;

      frozenRef.current = true;
      setSelectedAnswer(question.assertions[idx]);
      setSubmitting(true);

      try {
        const result = await onSubmitAnswer(partieId, question.quizId, idx);

        if (result.correct && !result.gameOver) {
          // Bonne réponse → question suivante, nouveau délai serveur
          playSound("correct");
          setFeedback('correct');
          if (result.nextExpiresAt) {
            setExpiresAt(result.nextExpiresAt);
          }
          setTimeout(() => {
            setAnimateOut(true);
            setTimeout(() => setCurrentIndex((i) => i + 1), 300);
          }, 500);
        } else {
          // Fin de partie : jouer le son final (win/lose) PUIS le feedback visuel
          playSound(result.won ? "win" : "lose");
          setFeedback(result.correct ? 'correct' : 'wrong');
          setTimeout(() => {
            setAnimateOut(true);
            setTimeout(() => onGameOver(result), 300);
          }, 700);
        }
      } catch {
        onGameOver({ correct: false, gameOver: true, isLastQuestion: false, won: false });
      } finally {
        setSubmitting(false);
      }
    },
    [partieId, question, submitting, feedback, onSubmitAnswer, onGameOver]
  );

  // ── Progress ──
  const progressPct = (currentIndex / questions.length) * 100;
  const timerPct = (timeLeft / TOTAL_SECONDS) * 100;
  const timerUrgent = timeLeft <= 5;

  if (!question) return null;

  return (
    <div className={`flex flex-col px-4 py-6 transition-all duration-300 ${animateOut ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      {/* Barre de progression */}
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            {currentIndex + 1}
          </span>
          Question {currentIndex + 1}/{questions.length}
        </span>
        <span
          className={`flex items-center gap-1 transition-colors duration-300 ${
            timerUrgent ? 'font-bold text-red-500 animate-pulse' : ''
          }`}
        >
          <Timer className="h-3.5 w-3.5" />
          {timeLeft}s
        </span>
      </div>

      {/* Double barre */}
      <div className="mb-6 flex gap-1">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all duration-200 ease-linear ${
              timerUrgent ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>
      </div>

      {/* Énoncé */}
      <div className="mb-6 animate-slideUp rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <MathRenderer
          content={question.enonce}
          className="text-base font-medium text-gray-900 dark:text-white"
        />
        {question.assets && (
          <img
            src={question.assets}
            alt="Illustration"
            className="mt-3 max-h-48 w-full rounded-lg object-contain"
          />
        )}
      </div>

      {/* Assertions */}
      <div className="space-y-3">
        {question.assertions.map((assertion, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedAnswer === assertion;
          let btnStyle =
            'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10';

          if (isSelected && feedback === 'correct') {
            btnStyle =
              'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-500/10 scale-[1.01]';
          } else if (isSelected && feedback === 'wrong') {
            btnStyle =
              'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-500/10 animate-shake';
          } else if (isSelected) {
            btnStyle =
              'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              disabled={submitting || !!feedback}
              className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${btnStyle}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                  isSelected && feedback === 'correct'
                    ? 'bg-green-500 text-white'
                    : isSelected && feedback === 'wrong'
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-brand-500/20 dark:group-hover:text-brand-400'
                }`}
              >
                {isSelected && feedback === 'correct' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isSelected && feedback === 'wrong' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  letter
                )}
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                <MathRenderer content={assertion} autoFormat />
              </span>
            </button>
          );
        })}
      </div>

      {/* Loader discret */}
      {submitting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 animate-fadeIn">
          <Loader2 className="h-4 w-4 animate-spin" />
          Vérification...
        </div>
      )}
    </div>
  );
};

export default GameEngine;