'use client';

import React from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw, Home, TrendingUp } from 'lucide-react';
import type { SubmitAnswerResult } from '@/app/actions/partie.actions';

interface GameResultProps {
  result: SubmitAnswerResult;
  categorieSlug: string;
  onReplay: () => void;
  onBackToHub: () => void;
}

const GameResult: React.FC<GameResultProps> = ({
  result,
  onReplay,
  onBackToHub,
}) => {
  const won = result.won ?? false;
  const note = result.note ?? 0;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      {/* Icône résultat avec animation */}
      <div
        className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full animate-popIn ${
          won
            ? 'bg-green-100 dark:bg-green-500/10'
            : 'bg-red-100 dark:bg-red-500/10'
        }`}
      >
        {won ? (
          <CheckCircle className="h-12 w-12 text-green-500 animate-bounceIn" />
        ) : (
          <XCircle className="h-12 w-12 text-red-500 animate-bounceIn" />
        )}
      </div>

      {/* Verdict */}
      <h2
        className={`mb-2 text-2xl font-bold animate-slideUp ${
          won ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}
      >
        {won ? '🎉 Félicitations !' : '😞 Dommage !'}
      </h2>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        {won
          ? 'Tu as réussi les 3 questions. Quel champion !'
          : `Tu as échoué après ${note} bonne${note > 1 ? 's' : ''} réponse${note > 1 ? 's' : ''}.`}
      </p>

      {/* Stats */}
      <div className="mb-8 grid w-full max-w-xs grid-cols-2 gap-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {note} / 3
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Résultat</p>
          <p
            className={`text-xl font-bold ${
              won ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {won ? 'Gagné' : 'Perdu'}
          </p>
        </div>
      </div>

      {/* Changement de niveau */}
      {result.levelChanged && (
        <div className="mb-6 animate-bounceIn rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
            <TrendingUp className="h-4 w-4" />
            Tu es passé au niveau {result.newLevel} !
          </p>
        </div>
      )}

      {/* Scores globaux */}
      {result.totalScore !== undefined && (
        <div className="mb-8 space-y-1 text-sm text-gray-500 dark:text-gray-400 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <p className="flex items-center justify-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            Score total : <strong className="text-gray-800 dark:text-white">{result.totalScore}</strong>
          </p>
          <p>
            Meilleur score :{' '}
            <strong className="text-gray-800 dark:text-white">{result.meilleurScore}</strong>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs animate-slideUp" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={onReplay}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Rejouer
        </button>
        <button
          onClick={onBackToHub}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Home className="h-4 w-4" />
          Retour au Hub
        </button>
      </div>
    </div>
  );
};

export default GameResult;