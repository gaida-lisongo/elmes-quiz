'use server';

import connectToDb from '../lib/utils/db';
import Equipe from '../lib/models/Equipe';

/**
 * Retourne le nombre total d'équipes créées sur la plateforme.
 */
export async function getEquipesCount(): Promise<number> {
  await connectToDb();
  return Equipe.countDocuments({});
}