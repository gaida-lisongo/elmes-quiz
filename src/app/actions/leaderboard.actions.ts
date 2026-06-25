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
  searchQuery?: string
): Promise<{ top10: LeaderboardEntry[]; searchedEntry: LeaderboardEntry | null }> {
  await connectToDb();

  // 1. Récupérer tous les joueurs avec leur User, triés par totalScore descendant
  const players = await Player.find({})
    .populate<{ userId: { _id: string; pseudo: string; telephone: string; photo?: string } }>(
      'userId',
      'pseudo telephone photo'
    )
    .sort({ 'metrics.totalScore': -1 })
    .lean();

  // 2. Construire le leaderboard complet
  const allEntries: LeaderboardEntry[] = players
    .filter((p) => p.userId && typeof p.userId === 'object')
    .map((p, index) => ({
      rank: index + 1,
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

  // 3. Top 10
  const top10 = allEntries.slice(0, 10);

  // 4. Recherche d'un joueur spécifique (par pseudo ou téléphone)
  let searchedEntry: LeaderboardEntry | null = null;
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim().toLowerCase();
    const found = allEntries.find(
      (e) =>
        e.pseudo.toLowerCase().includes(q) ||
        e.telephone.includes(q)
    );
    searchedEntry = found ?? null;
  }

  return { top10, searchedEntry };
}