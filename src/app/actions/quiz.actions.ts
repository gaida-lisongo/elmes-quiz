'use server';

import connectToDb from '@/app/lib/utils/db';
import Quiz from '@/app/lib/models/Quiz';

export interface QuizOutput {
  _id: string;
  categorieId: string;
  enonce: string;
  assertions: string[];
  reponse: string;
  assets?: string;
  level: 0 | 1 | 2 | 3;
  status: boolean;
  type: 'QCM' | 'VRAI_FAUX';
  createdAt: Date;
}

/* ── Récupérer les questions d'une catégorie, filtrées par niveau ── */
export async function getQuestions(
  categorieId: string,
  level?: number
): Promise<QuizOutput[]> {
  await connectToDb();
  const filter: Record<string, any> = { categorieId };
  if (level !== undefined && level !== -1) filter.level = level;

  const docs = await Quiz.find(filter)
    .sort({ level: 1, createdAt: -1 })
    .lean();
  return docs.map((d) => ({
    _id: d._id.toString(),
    categorieId: d.categorieId.toString(),
    enonce: d.enonce,
    assertions: d.assertions,
    reponse: d.reponse,
    assets: d.assets,
    level: d.level,
    status: d.status,
    type: d.type,
    createdAt: d.createdAt,
  }));
}

/* ── Créer une question ── */
export async function createQuestion(data: {
  categorieId: string;
  enonce: string;
  assertions: string[];
  reponse: string;
  assets?: string;
  level: 0 | 1 | 2 | 3;
  type: 'QCM' | 'VRAI_FAUX';
}): Promise<{ success: boolean; error?: string }> {
  await connectToDb();
  try {
    await Quiz.create(data);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur création" };
  }
}

/* ── Modifier une question ── */
export async function updateQuestion(
  id: string,
  data: Partial<{
    enonce: string;
    assertions: string[];
    reponse: string;
    assets: string;
    level: 0 | 1 | 2 | 3;
    type: 'QCM' | 'VRAI_FAUX';
    status: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  await connectToDb();
  try {
    await Quiz.findByIdAndUpdate(id, data);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur modification" };
  }
}

/* ── Supprimer une question ── */
export async function deleteQuestion(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await connectToDb();
  try {
    await Quiz.findByIdAndDelete(id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur suppression" };
  }
}

/* ── Suppression en masse ── */
export async function bulkDeleteQuestions(
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  await connectToDb();
  try {
    await Quiz.deleteMany({ _id: { $in: ids } });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur suppression" };
  }
}

/* ── Activer / désactiver en masse ── */
export async function bulkToggleStatus(
  ids: string[],
  status: boolean
): Promise<{ success: boolean; error?: string }> {
  await connectToDb();
  try {
    await Quiz.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur mise à jour" };
  }
}

/* ── Importer depuis un CSV ── */
export async function importQuizCsv(data: {
  categorieId: string;
  level: 0 | 1 | 2 | 3;
  csvContent: string;
}): Promise<{ success: boolean; count?: number; errors?: string[] }> {
  await connectToDb();

  const lines = data.csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const errors: string[] = [];
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Format attendu: enoncé,a1,a2,a3,a4,réponse,type
    const parts = line.split(',');
    if (parts.length < 4) {
      errors.push(`Ligne ${i + 1}: format invalide (séparez par des virgules)`);
      continue;
    }

    const enonce = parts[0].trim();
    // assertions: on prend les parties 1 à 4, on filtre les vides
    const assertions = parts.slice(1, 5).map((a) => a.trim()).filter(Boolean);
    const reponse = parts[5]?.trim() ?? '';
    const typeRaw = parts[6]?.trim().toUpperCase();
    const type = typeRaw === 'VRAI_FAUX' ? 'VRAI_FAUX' : 'QCM';

    if (!enonce || assertions.length < 2 || !reponse) {
      errors.push(`Ligne ${i + 1}: données incomplètes`);
      continue;
    }

    try {
      await Quiz.create({
        categorieId: data.categorieId,
        enonce,
        assertions,
        reponse,
        level: data.level,
        type,
        status: true,
      });
      count++;
    } catch (err: any) {
      errors.push(`Ligne ${i + 1}: ${err.message}`);
    }
  }

  return { success: errors.length === 0, count, errors: errors.length > 0 ? errors : undefined };
}

/* ── Exporter des questions en CSV ── */
export async function exportQuestionsCsv(
  ids: string[]
): Promise<{ success: boolean; csv?: string; error?: string }> {
  await connectToDb();
  try {
    const docs = await Quiz.find({ _id: { $in: ids } }).lean();
    const header = 'énoncé,assertion1,assertion2,assertion3,assertion4,réponse,type';
    const rows = docs.map(
      (d) =>
        `${d.enonce},${d.assertions.join(',')},${d.reponse},${d.type}`
    );
    return { success: true, csv: [header, ...rows].join('\n') };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}