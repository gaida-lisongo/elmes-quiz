'use server';

import connectToDb from '@/app/lib/utils/db';
import Quiz from '@/app/lib/models/Quiz';
import Partie from '@/app/lib/models/Partie';
import Player from '@/app/lib/models/Player';
import { getSession } from '@/lib/utils/auth';
import mongoose from 'mongoose';

// ── Constantes ──

const QUESTION_DELAY_MS = 15_000; // 15 secondes par question

// ── Types exportés ──

export interface QuestionClient {
  quizId: string;
  enonce: string;
  assertions: string[];
  type: 'QCM' | 'VRAI_FAUX';
  assets?: string;
}

export interface InitPartieResult {
  success: boolean;
  partieId?: string;
  questionExpiresAt?: number;
  error?: string;
}

export interface SubmitAnswerResult {
  correct: boolean;
  gameOver: boolean;
  isLastQuestion: boolean;
  timedOut?: boolean;
  note?: number;
  won?: boolean;
  newLevel?: number;
  levelChanged?: boolean;
  totalScore?: number;
  meilleurScore?: number;
  nextExpiresAt?: number;
  error?: string;
}

// ── Seuils de promotion ──

const LEVEL_THRESHOLDS = [
  { level: 1, minScore: 75 },
  { level: 2, minScore: 180 },
  { level: 3, minScore: 345 },
] as const;

function computeLevel(totalScore: number): number {
  let newLevel = 0;
  for (const t of LEVEL_THRESHOLDS) {
    if (totalScore > t.minScore) newLevel = t.level;
  }
  return newLevel;
}

// ── Tirage aléatoire (Fisher-Yates partiel) ──

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// ═══════════════════════════════════════════════════════════════
// 0. RAFRAÎCHIR LES QUESTIONS (appelé au clic sur "Rejouer")
// ═══════════════════════════════════════════════════════════════

export async function refreshQuestions(
  categorieId: string
): Promise<{ success: boolean; questions?: QuestionClient[]; quizIds?: string[]; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Non authentifié.' };
  if (session.role !== 'PLAYER') return { success: false, error: 'Réservé aux joueurs.' };

  await connectToDb();

  const player = await Player.findOne({ userId: session.userId });
  if (!player) return { success: false, error: 'Profil joueur introuvable.' };

  const pool = await Quiz.find({
    categorieId,
    level: player.level,
    status: true,
  }).lean();

  if (pool.length < 3) {
    return {
      success: false,
      error: `Pas assez de questions niveau ${player.level} (${pool.length} dispo, 3 requises).`,
    };
  }

  const selected = pickRandom(pool, 3);

  const questions: QuestionClient[] = selected.map((q) => ({
    quizId: q._id.toString(),
    enonce: q.enonce,
    assertions: q.assertions,
    type: q.type as 'QCM' | 'VRAI_FAUX',
    assets: q.assets,
  }));

  const quizIds = selected.map((q) => q._id.toString());

  return { success: true, questions, quizIds };
}

// ═══════════════════════════════════════════════════════════════
// 1. INITIALISER UNE PARTIE
//    Les questions sont déjà tirées côté serveur (page.tsx).
//    Ici on ne fait que créer le document Partie + débiter.
// ═══════════════════════════════════════════════════════════════

export async function initPartie(
  categorieId: string,
  quizIds: string[]
): Promise<InitPartieResult> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Non authentifié.' };
  if (session.role !== 'PLAYER')
    return { success: false, error: 'Réservé aux joueurs.' };

  await connectToDb();

  const player = await Player.findOne({ userId: session.userId });
  if (!player) return { success: false, error: 'Profil joueur introuvable.' };
  if (player.parties <= 0)
    return {
      success: false,
      error: 'Vous n\'avez plus de parties disponibles. Rechargez votre compte.',
    };

  // Débiter le joueur
  player.parties -= 1;
  player.metrics.partiesJouees += 1;
  await player.save();

  // Timestamp d'expiration de la 1ère question
  const questionExpiresAt = new Date(Date.now() + QUESTION_DELAY_MS);

  const partie = await Partie.create({
    playerId: player._id,
    categorieId,
    levelPlayed: player.level,
    reponses: [],
    note: 0,
    status: 'EN_COURS',
    questionExpiresAt,
  });

  return {
    success: true,
    partieId: partie._id.toString(),
    questionExpiresAt: questionExpiresAt.getTime(),
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. SOUMETTRE UNE RÉPONSE
//    Le client envoie answerIndex (0,1,2,3) — le serveur vérifie
//    quiz.assertions[answerIndex] === quiz.reponse
// ═══════════════════════════════════════════════════════════════

export async function submitAnswer(
  partieId: string,
  quizId: string,
  answerIndex: number | null // null = timeout
): Promise<SubmitAnswerResult> {
  const session = await getSession();
  if (!session)
    return { correct: false, gameOver: true, isLastQuestion: false, error: 'Non authentifié.' };

  await connectToDb();

  const partie = await Partie.findById(partieId);
  if (!partie)
    return { correct: false, gameOver: true, isLastQuestion: false, error: 'Partie introuvable.' };
  if (partie.status === 'TERMINE')
    return { correct: false, gameOver: true, isLastQuestion: false, error: 'Partie déjà terminée.' };

  // ── VÉRIFICATION TIMEOUT (seulement si pas de clic) ──
  const now = Date.now();
  const expired = partie.questionExpiresAt
    ? now > new Date(partie.questionExpiresAt).getTime()
    : false;

  if (answerIndex === null && expired) {
    partie.status = 'TERMINE';
    partie.note = partie.reponses.length;
    await partie.save();
    return {
      correct: false, gameOver: true, isLastQuestion: false,
      timedOut: true, note: partie.note, won: false,
    };
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz)
    return { correct: false, gameOver: true, isLastQuestion: false, error: 'Question introuvable.' };

  // ── Vérification par index ──
  const reponseDonnee = answerIndex !== null ? (quiz.assertions[answerIndex] ?? '') : '';
  const isCorrect = answerIndex !== null && quiz.assertions[answerIndex] === quiz.reponse;

  const currentIndex = partie.reponses.length;
  const isLastQuestion = currentIndex >= 2;

  partie.reponses.push({
    quizId: new mongoose.Types.ObjectId(quizId),
    reponseDonnee,
    estCorrecte: isCorrect,
  });

  // Cas 1 : Mauvaise réponse
  if (!isCorrect) {
    partie.status = 'TERMINE';
    partie.note = currentIndex;
    await partie.save();
    return { correct: false, gameOver: true, isLastQuestion: false, note: partie.note, won: false };
  }

  // Cas 2 : Victoire
  if (isLastQuestion) {
    partie.status = 'TERMINE';
    partie.note = 3;
    await partie.save();

    const player = await Player.findById(partie.playerId);
    if (player) {
      player.metrics.totalScore += 3;
      if (player.metrics.totalScore > player.metrics.MeilleurScore) {
        player.metrics.MeilleurScore = player.metrics.totalScore;
      }
      const oldLevel = player.level;
      const newLevel = computeLevel(player.metrics.totalScore);
      if (newLevel > oldLevel) player.level = newLevel as 0 | 1 | 2 | 3;
      await player.save();

      return {
        correct: true, gameOver: true, isLastQuestion: true,
        note: 3, won: true,
        newLevel: player.level, levelChanged: player.level > oldLevel,
        totalScore: player.metrics.totalScore, meilleurScore: player.metrics.MeilleurScore,
      };
    }
  }

  // Cas 3 : Continue
  const nextExpiresAt = new Date(Date.now() + QUESTION_DELAY_MS);
  partie.questionExpiresAt = nextExpiresAt;
  await partie.save();

  return { correct: true, gameOver: false, isLastQuestion: false, nextExpiresAt: nextExpiresAt.getTime() };
}