'use server';

import connectToDb from '@/app/lib/utils/db';
import Player from '@/app/lib/models/Player';
import { getSession } from '@/lib/utils/auth';
import { revalidatePath } from 'next/cache';

/**
 * Ajoute des parties bonus à un joueur (réservé aux MOD/ADMIN)
 */
export async function addBonusParties(
  playerUserId: string,
  bonusCount: number
): Promise<{ success: boolean; error?: string; newParties?: number }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Non authentifié.' };
  if (session.role !== 'ADMIN' && session.role !== 'MOD') {
    return { success: false, error: 'Réservé aux agents.' };
  }

  if (!bonusCount || bonusCount < 1) {
    return { success: false, error: 'Le nombre de parties bonus doit être supérieur à 0.' };
  }

  await connectToDb();

  try {
    const player = await Player.findOne({ userId: playerUserId });
    if (!player) {
      return { success: false, error: 'Joueur introuvable.' };
    }

    player.parties += bonusCount;
    await player.save();

    revalidatePath('/', 'layout');

    return {
      success: true,
      newParties: player.parties,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de l\'ajout de bonus.' };
  }
}
