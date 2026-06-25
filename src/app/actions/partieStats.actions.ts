'use server';

import connectToDb from '../lib/utils/db';
import Partie from '../lib/models/Partie';
import Categorie from '../lib/models/Categorie';
import { getSession } from '@/lib/utils/auth';

export interface CategorieStat {
  categorieId: string;
  designation: string;
  total: number;
  won: number;   // note === 3
  lost: number;  // note === 0
}

/**
 * Récupère les statistiques de parties groupées par catégorie.
 * Pour MOD/ADMIN → toutes les parties
 * Pour PLAYER → seulement ses parties
 */
export async function getPartiesStats(): Promise<CategorieStat[]> {
  const session = await getSession();
  if (!session) return [];

  await connectToDb();

  // 1. Récupérer toutes les catégories actives
  const categories = await Categorie.find({ status: true }).lean();

  // 2. Construire le filtre playerId si PLAYER
  let playerFilter: Record<string, any> = {};
  if (session.role === 'PLAYER') {
    const Player = (await import('../lib/models/Player')).default;
    const player = await Player.findOne({ userId: session.userId }).select('_id').lean();
    if (!player) return [];
    playerFilter = { playerId: player._id };
  }

  // 3. Pour chaque catégorie, compter les parties (total, won, lost)
  const stats: CategorieStat[] = await Promise.all(
    categories.map(async (cat) => {
      const baseFilter = { ...playerFilter, categorieId: cat._id, status: 'TERMINE' as const };

      const [total, won, lost] = await Promise.all([
        Partie.countDocuments(baseFilter),
        Partie.countDocuments({ ...baseFilter, note: 3 }),
        Partie.countDocuments({ ...baseFilter, note: 0 }),
      ]);

      return {
        categorieId: cat._id.toString(),
        designation: cat.designation,
        total,
        won,
        lost,
      };
    })
  );

  // Ne retourner que les catégories qui ont au moins une partie
  return stats.filter((s) => s.total > 0);
}