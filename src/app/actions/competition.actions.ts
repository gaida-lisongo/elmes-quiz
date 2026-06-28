'use server';

import connectToDb from '../lib/utils/db';
import Competition from '../lib/models/Competition';
import Categorie from '../lib/models/Categorie';
import { getSession } from '@/lib/utils/auth';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export interface CompetitionOutput {
  _id: string;
  designation: string;
  description?: string;
  cagnotte: number;
  categories: string[];
  parties: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  image?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Générer un slug unique ── */
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ── Récupérer toutes les compétitions (pour modérateur/admin) ── */
export async function getAllCompetitions(): Promise<{ success: boolean; data?: CompetitionOutput[]; error?: string }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();
  try {
    const competitions = await Competition.find({})
      .populate('categories', 'designation slug')
      .sort({ createdAt: -1 })
      .lean();

    const data: CompetitionOutput[] = competitions.map((c) => ({
      _id: c._id.toString(),
      designation: c.designation,
      description: c.description,
      cagnotte: c.cagnotte,
      categories: c.categories.map((cat: any) => cat._id.toString()),
      parties: c.parties,
      status: c.status,
      image: c.image,
      slug: c.slug,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la récupération.' };
  }
}

/* ── Récupérer une compétition par slug ── */
export async function getCompetitionBySlug(slug: string): Promise<{ success: boolean; data?: CompetitionOutput; error?: string }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  return getPublicCompetitionBySlug(slug);
}

/* ── Récupérer une compétition par slug (public, sans auth) ── */
export async function getPublicCompetitionBySlug(slug: string): Promise<{ success: boolean; data?: CompetitionOutput; error?: string }> {
  await connectToDb();
  try {
    const competition = await Competition.findOne({ slug })
      .populate('categories', 'designation slug')
      .lean();

    if (!competition) {
      return { success: false, error: 'Compétition non trouvée.' };
    }

    const data: CompetitionOutput = {
      _id: competition._id.toString(),
      designation: competition.designation,
      description: competition.description,
      cagnotte: competition.cagnotte,
      categories: competition.categories.map((cat: any) => cat._id.toString()),
      parties: competition.parties,
      status: competition.status,
      image: competition.image,
      slug: competition.slug,
      createdAt: competition.createdAt.toISOString(),
      updatedAt: competition.updatedAt.toISOString(),
    };

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la récupération.' };
  }
}

/* ── Créer une compétition ── */
export async function createCompetition(formData: {
  designation: string;
  description?: string;
  cagnotte: number;
  categories: string[];
  parties: number;
  image?: string;
}): Promise<{ success: boolean; error?: string; data?: CompetitionOutput }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();

  const designation = formData.designation.trim();
  if (!designation) {
    return { success: false, error: 'La désignation est obligatoire.' };
  }
  if (formData.cagnotte < 0) {
    return { success: false, error: 'La cagnotte doit être positive.' };
  }
  if (formData.parties <= 0) {
    return { success: false, error: 'Le nombre de parties doit être supérieur à 0.' };
  }

  let slug = slugify(designation);
  // Vérifier l'unicité du slug
  const existing = await Competition.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  try {
    const competition = await Competition.create({
      designation,
      description: formData.description?.trim() || '',
      cagnotte: formData.cagnotte,
      categories: formData.categories.map(id => new mongoose.Types.ObjectId(id)),
      parties: formData.parties,
      image: formData.image || '',
      slug,
      status: 'ACTIVE',
    });

    revalidatePath('/agent/manage-competitions');
    return {
      success: true,
      data: {
        _id: competition._id.toString(),
        designation: competition.designation,
        description: competition.description,
        cagnotte: competition.cagnotte,
        categories: formData.categories,
        parties: competition.parties,
        status: competition.status,
        image: competition.image,
        slug: competition.slug,
        createdAt: competition.createdAt.toISOString(),
        updatedAt: competition.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la création.' };
  }
}

/* ── Modifier une compétition ── */
export async function updateCompetition(
  id: string,
  formData: {
    designation?: string;
    description?: string;
    cagnotte?: number;
    categories?: string[];
    parties?: number;
    status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
    image?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();

  const update: Record<string, any> = {};
  if (formData.designation !== undefined) {
    const designation = formData.designation.trim();
    if (!designation) return { success: false, error: 'La désignation ne peut pas être vide.' };
    update.designation = designation;
    update.slug = slugify(designation);
  }
  if (formData.description !== undefined) update.description = formData.description.trim();
  if (formData.cagnotte !== undefined) {
    if (formData.cagnotte < 0) return { success: false, error: 'La cagnotte doit être positive.' };
    update.cagnotte = formData.cagnotte;
  }
  if (formData.categories !== undefined) {
    update.categories = formData.categories.map(id => new mongoose.Types.ObjectId(id));
  }
  if (formData.parties !== undefined) {
    if (formData.parties <= 0) return { success: false, error: 'Le nombre de parties doit être supérieur à 0.' };
    update.parties = formData.parties;
  }
  if (formData.status !== undefined) update.status = formData.status;
  if (formData.image !== undefined) update.image = formData.image;

  try {
    await Competition.findByIdAndUpdate(id, update);
    revalidatePath('/agent/manage-competitions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la modification.' };
  }
}

/* ── Supprimer une compétition ── */
export async function deleteCompetition(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();

  try {
    await Competition.findByIdAndDelete(id);
    revalidatePath('/agent/manage-competitions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erreur lors de la suppression.' };
  }
}