'use server';

import connectToDb from '../lib/utils/db';
import Player from '../lib/models/Player';
import User from '../lib/models/User';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudo: string;
  telephone: string;
  photo?: string;
  level: number;
  parties: number;
  partiesJouees: number;
  totalScore: number;
  meilleurScore: number;
}

export async function getLeaderboard(
  searchQuery?: string,
  currentUserId?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  top10: LeaderboardEntry[];
  searchedEntry: LeaderboardEntry | null;
  currentUserEntry?: LeaderboardEntry | null;
  totalPages: number;
  currentPage: number;
  totalPlayers: number;
}> {
  await connectToDb();

  const skip = (page - 1) * pageSize;
  const totalPlayers = await Player.countDocuments({});

  // 1. Récupérer tous les joueurs avec leur User, triés par totalScore descendant
  const players = await Player.find({})
    .populate<{ userId: { _id: string; pseudo: string; telephone: string; photo?: string } }>(
      'userId',
      'pseudo telephone photo'
    )
    .sort({ 'metrics.totalScore': -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  // Calculer le rang réel basé sur le score (skip + index + 1)
  const allEntries: LeaderboardEntry[] = players
    .filter((p) => p.userId && typeof p.userId === 'object')
    .map((p, index) => ({
      rank: skip + index + 1,
      userId: (p.userId as any)._id.toString(),
      pseudo: (p.userId as any).pseudo,
      telephone: (p.userId as any).telephone,
      photo: (p.userId as any).photo,
      level: p.level,
      parties: p.parties || 0,
      partiesJouees: p.metrics?.partiesJouees ?? 0,
      totalScore: p.metrics?.totalScore ?? 0,
      meilleurScore: p.metrics?.MeilleurScore ?? 0,
    }));

  // 3. Top 10 — si page 1 on utilise les premiers, sinon on garde les résultats paginés comme page courante
  const top10 = page === 1 ? allEntries.slice(0, Math.min(10, allEntries.length)) : allEntries;

  // 4. Recherche d'un joueur spécifique (par pseudo ou téléphone) — recherche globale
  let searchedEntry: LeaderboardEntry | null = null;
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim().toLowerCase();
    // Chercher dans la page courante d'abord
    const found = allEntries.find(
      (e) =>
        e.pseudo.toLowerCase().includes(q) ||
        e.telephone.includes(q)
    );
    searchedEntry = found ?? null;
  }

  // 5. Entrée du joueur connecté (pour vue mobile Player)
  const currentUserEntry = currentUserId
    ? allEntries.find((e) => e.userId === currentUserId) ?? null
    : undefined;

  return {
    top10,
    searchedEntry,
    currentUserEntry,
    totalPages: Math.ceil(totalPlayers / pageSize),
    currentPage: page,
    totalPlayers,
  };
}