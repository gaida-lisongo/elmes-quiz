'use server';

import connectToDb from '../lib/utils/db';
import Equipe from '../lib/models/Equipe';
import { getSession } from '@/lib/utils/auth';
import { revalidatePath } from 'next/cache';

/**
 * Retourne le nombre total d'équipes créées sur la plateforme.
 */
export async function getEquipesCount(): Promise<number> {
  await connectToDb();
  return Equipe.countDocuments({});
}

/**
 * Crée une nouvelle équipe.
 * Revalide le cache dashboard → le SSE pousse les nouvelles données de progression.
 */
export async function createEquipe(data: {
  designation: string;
  membres?: string[];
}): Promise<{ success: boolean; equipeId?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Non authentifié.' };

  await connectToDb();

  const equipe = await Equipe.create({
    chefId: session.userId,
    designation: data.designation,
    membres: data.membres ?? [],
  });

  // Webhook : revalide le cache dashboard → SSE envoie nouvelles données
  revalidatePath('/', 'layout');

  return { success: true, equipeId: equipe._id.toString() };
}