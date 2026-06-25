'use server';

import connectToDb from '../lib/utils/db';
import Player from '../lib/models/Player';
import User from '../lib/models/User';

export interface AgentMetrics {
  /** Chiffre d'affaires total = somme des montants des recharges SUCCES */
  revenue: number;
  /** Nombre total de joueurs inscrits sur la plateforme */
  totalPlayers: number;
}

/**
 * Retourne les métriques pour les comptes ADMIN / MOD :
 * - Chiffre d'affaires (somme des recharges SUCCES)
 * - Nombre total de joueurs
 */
export async function getAgentMetrics(): Promise<AgentMetrics> {
  await connectToDb();

  // 1. Chiffre d'affaires : somme des montants de toutes les recharges SUCCES
  const [revenueResult] = await Player.aggregate([
    { $unwind: '$recharges' },
    { $match: { 'recharges.status': 'SUCCES' } },
    { $group: { _id: null, total: { $sum: '$recharges.amount' } } },
  ]);
  const revenue = revenueResult?.total ?? 0;

  // 2. Nombre total de joueurs (users de rôle PLAYER)
  const totalPlayers = await User.countDocuments({ role: 'PLAYER' });

  return { revenue, totalPlayers };
}