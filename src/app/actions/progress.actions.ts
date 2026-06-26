"use server";

import connectToDb from "@/app/lib/utils/db";
import Player from "@/app/lib/models/Player";
import Equipe from "@/app/lib/models/Equipe";
import { getSession } from "@/lib/utils/auth";

// ═══════════════════════════════════════════════════════════════
// Constantes
// ═══════════════════════════════════════════════════════════════

const LEVEL_0_TARGET = 75; // 25 parties × 3 pts → débloque parrainage
const LEVEL_1_TARGET = 90; // pts supplémentaires → débloque équipes
const EQUIPES_TARGET = 10;

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ProgressData {
  level: number;
  role: "PLAYER" | "MOD" | "ADMIN";
  currentScore: number;
  targetScore: number;
  progressPercent: number;
  equipesCount: number;
  equipesTarget: number;
  teaserLabel: string;
  unlockLabel: string;
  icon: string;
}

// ═══════════════════════════════════════════════════════════════
// Action principale
// ═══════════════════════════════════════════════════════════════

export async function getProgressData(): Promise<ProgressData | null> {
  const session = await getSession();
  if (!session) return null;

  await connectToDb();

  // Toujours récupérer le nombre d'équipes (utile pour niveau 2+)
  const equipesCount = await Equipe.countDocuments({});

  // ── Cas Agent (MOD / ADMIN) : barre de progression des équipes ──
  if (session.role === "MOD" || session.role === "ADMIN") {
    const progressPercent = Math.min(100, (equipesCount / EQUIPES_TARGET) * 100);

    return {
      level: 2, // considéré comme "niveau 2+" pour l'affichage
      role: session.role,
      currentScore: 0,
      targetScore: 0,
      progressPercent,
      equipesCount,
      equipesTarget: EQUIPES_TARGET,
      teaserLabel: "Fonctionnalité à venir : Compétitions",
      unlockLabel: `${equipesCount}/${EQUIPES_TARGET} équipes créées`,
      icon: "🏆",
    };
  }

  // ── Cas PLAYER ──
  const player = await Player.findOne({ userId: session.userId });
  if (!player) return null;

  const totalScore = player.metrics?.totalScore ?? 0;
  const level = player.level ?? 0;

  // Niveau 0 → progression vers parrainage (75 pts)
  if (level === 0) {
    const progressPercent = Math.min(100, (totalScore / LEVEL_0_TARGET) * 100);

    return {
      level: 0,
      role: "PLAYER",
      currentScore: totalScore,
      targetScore: LEVEL_0_TARGET,
      progressPercent,
      equipesCount,
      equipesTarget: EQUIPES_TARGET,
      teaserLabel: "Progression vers le Parrainage",
      unlockLabel: "Débloquez le parrainage à 75 pts",
      icon: "🎁",
    };
  }

  // Niveau 1 → progression vers équipes (90 pts depuis le niveau 1)
  if (level === 1) {
    const progressPercent = Math.min(100, (totalScore / LEVEL_1_TARGET) * 100);

    return {
      level: 1,
      role: "PLAYER",
      currentScore: totalScore,
      targetScore: LEVEL_1_TARGET,
      progressPercent,
      equipesCount,
      equipesTarget: EQUIPES_TARGET,
      teaserLabel: "Progression vers les Équipes",
      unlockLabel: "Débloquez les équipes à 90 pts",
      icon: "👥",
    };
  }

  // Niveau 2+ → progression vers compétitions (10 équipes)
  const progressPercent = Math.min(100, (equipesCount / EQUIPES_TARGET) * 100);

  return {
    level,
    role: "PLAYER",
    currentScore: totalScore,
    targetScore: 0,
    progressPercent,
    equipesCount,
    equipesTarget: EQUIPES_TARGET,
    teaserLabel: "Fonctionnalité à venir : Compétitions",
    unlockLabel: `${equipesCount}/${EQUIPES_TARGET} équipes créées`,
    icon: "🏆",
  };
}