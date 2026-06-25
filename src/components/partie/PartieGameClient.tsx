'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Ticket, TrendingUp } from 'lucide-react';
import GameRules from './GameRules';
import GameEngine from './GameEngine';
import GameResult from './GameResult';
import { initPartie, submitAnswer, refreshQuestions } from '@/app/actions/partie.actions';
import type { QuestionClient, SubmitAnswerResult } from '@/app/actions/partie.actions';

type Step = 'REGLEMENT' | 'JEU' | 'RESULTAT';

interface PartieGameClientProps {
  categorieId: string;
  categorieName: string;
  categorieDescription: string;
  categorieSlug: string;
  partiesRestantes: number;
  playerLevel: number;
  questions: QuestionClient[];
  quizIds: string[];
}

const PartieGameClient: React.FC<PartieGameClientProps> = ({
  categorieId,
  categorieName,
  categorieDescription,
  categorieSlug,
  partiesRestantes: initialParties,
  playerLevel,
  questions: initialQuestions,
  quizIds: initialQuizIds,
}) => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('REGLEMENT');
  const [loading, setLoading] = useState(false);
  const [partieId, setPartieId] = useState<string>('');
  const [questionExpiresAt, setQuestionExpiresAt] = useState<number>(0);
  const [gameResult, setGameResult] = useState<SubmitAnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [partiesRestantes, setPartiesRestantes] = useState(initialParties);
  const [questions, setQuestions] = useState<QuestionClient[]>(initialQuestions);
  const [quizIds, setQuizIds] = useState<string[]>(initialQuizIds);

  const handleStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await initPartie(categorieId, quizIds);
      if (!res.success || !res.partieId) {
        setError(res.error ?? 'Erreur inconnue.');
        return;
      }
      setPartieId(res.partieId);
      setQuestionExpiresAt(res.questionExpiresAt ?? Date.now() + 15000);
      setPartiesRestantes((p) => Math.max(0, p - 1));
      setStep('JEU');
    } catch {
      setError('Impossible de lancer la partie. Vérifie ta connexion.');
    } finally {
      setLoading(false);
    }
  }, [categorieId, quizIds]);

  const handleGameOver = useCallback((result: SubmitAnswerResult) => {
    setGameResult(result);
    setStep('RESULTAT');
  }, []);

  const handleReplay = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await refreshQuestions(categorieId);
      if (!res.success || !res.questions || !res.quizIds) {
        setError(res.error ?? 'Erreur lors du rechargement des questions.');
        return;
      }
      setQuestions(res.questions);
      setQuizIds(res.quizIds);
      setStep('REGLEMENT');
      setPartieId('');
      setQuestionExpiresAt(0);
      setGameResult(null);
    } catch {
      setError('Impossible de recharger les questions. Vérifie ta connexion.');
    } finally {
      setLoading(false);
    }
  }, [categorieId]);

  const handleBackToHub = useCallback(() => {
    router.push('/');
    router.refresh();
  }, [router]);

  // ── Colonne gauche : image overlay + infos catégorie ──
  const SidebarInfo = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900 h-full min-h-[300px] lg:min-h-full">
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/partie.jpg)' }}
      />
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6 lg:p-8">
        {/* Bouton retour */}
        <button
          onClick={handleBackToHub}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Niveau {playerLevel}
          </div>

          <h1 className="text-2xl font-bold text-white lg:text-3xl">
            {categorieName}
          </h1>

          {categorieDescription && (
            <p className="text-sm leading-relaxed text-gray-300">
              {categorieDescription}
            </p>
          )}

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
              <Ticket className="h-4 w-4 text-brand-400" />
              <span>{partiesRestantes} partie{partiesRestantes > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              <span>Niv. {playerLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Layout 2 colonnes sur desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Colonne gauche : image + infos (visible sur tous les écrans, 2/5 sur desktop) */}
        <div className="lg:col-span-2">
          <SidebarInfo />
        </div>

        {/* Colonne droite : jeu (3/5 sur desktop) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Erreur */}
            {error && (
              <div className="m-5 animate-shake rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                <p>{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            )}

            {step === 'REGLEMENT' && (
              <GameRules
                categorieName={categorieName}
                partiesRestantes={partiesRestantes}
                onStart={handleStart}
                loading={loading}
              />
            )}

            {step === 'JEU' && questions.length > 0 && (
              <GameEngine
                questions={questions}
                partieId={partieId}
                questionExpiresAt={questionExpiresAt}
                onSubmitAnswer={submitAnswer}
                onGameOver={handleGameOver}
              />
            )}

            {step === 'RESULTAT' && gameResult && (
              <GameResult
                result={gameResult}
                categorieSlug={categorieSlug}
                onReplay={handleReplay}
                onBackToHub={handleBackToHub}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartieGameClient;