'use client';

import React from 'react';
import { Sparkles, Clock, XCircle, Ticket, Rocket, Loader2 } from 'lucide-react';

interface GameRulesProps {
  categorieName: string;
  partiesRestantes: number;
  onStart: () => void;
  loading: boolean;
}

const GameRules: React.FC<GameRulesProps> = ({
  categorieName,
  partiesRestantes,
  onStart,
  loading,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      {/* Icône ludique avec animation pulse */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10 animate-pulse-glow">
        <Sparkles className="h-10 w-10 text-brand-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white animate-slideUp">
        {categorieName}
      </h2>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 animate-slideUp" style={{ animationDelay: '0.1s' }}>
        Prêt à relever le défi ?
      </p>

      {/* Règles */}
      <div className="mb-8 w-full max-w-sm space-y-3">
        <div
          className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 animate-slideUp hover:scale-[1.02] transition-transform"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            3
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              3 questions
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Une série de 3 questions tirées au sort pour ton niveau.
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 animate-slideUp hover:scale-[1.02] transition-transform"
          style={{ animationDelay: '0.25s' }}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              15 secondes par question
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Réfléchis vite ! Le chrono ne pardonne pas.
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 animate-slideUp hover:scale-[1.02] transition-transform"
          style={{ animationDelay: '0.35s' }}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Élimination directe
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Une seule erreur et la partie s&apos;arrête. Pas de seconde chance !
            </p>
          </div>
        </div>
      </div>

      {/* Solde */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 animate-slideUp" style={{ animationDelay: '0.45s' }}>
        <Ticket className="h-4 w-4" />
        <span>
          Parties disponibles : <strong>{partiesRestantes}</strong>
        </span>
      </div>

      {/* Bouton */}
      <button
        onClick={onStart}
        disabled={loading || partiesRestantes <= 0}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 animate-slideUp"
        style={{ animationDelay: '0.55s' }}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Préparation...
          </>
        ) : (
          <>
            <Rocket className="h-5 w-5" />
            Commencer la partie
          </>
        )}
      </button>

      {partiesRestantes <= 0 && (
        <p className="mt-4 text-sm text-red-500 animate-fadeIn">
          Tu n&apos;as plus de parties. Recharge ton compte pour jouer.
        </p>
      )}
    </div>
  );
};

export default GameRules;