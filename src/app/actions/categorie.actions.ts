'use server';

import connectToDb from '../lib/utils/db';
import Categorie from '../lib/models/Categorie';
import { getSession } from '@/lib/utils/auth';
import { revalidatePath } from 'next/cache';

export interface CategorieOutput {
  _id: string;
  designation: string;
  description?: string;
  image?: string;
  slug: string;
  status: boolean;
}

/* ── Récupérer toutes les catégories actives ── */
export async function getAllCategories(): Promise<CategorieOutput[]> {
  await connectToDb();
  const cats = await Categorie.find({ status: true })
    .sort({ designation: 1 })
    .lean();
  return cats.map((c) => ({
    _id: c._id.toString(),
    designation: c.designation,
    description: c.description,
    image: c.image,
    slug: c.slug,
    status: c.status,
  }));
}

/* ── Récupérer toutes les catégories (y compris inactives) ── */
export async function getAllCategoriesAdmin(): Promise<CategorieOutput[]> {
  await connectToDb();
  const cats = await Categorie.find({})
    .sort({ designation: 1 })
    .lean();
  return cats.map((c) => ({
    _id: c._id.toString(),
    designation: c.designation,
    description: c.description,
    image: c.image,
    slug: c.slug,
    status: c.status,
  }));
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

/* ── Créer une catégorie (MOD ou ADMIN) ── */
export async function createCategorie(formData: {
  designation: string;
  description?: string;
}): Promise<{ success: boolean; error?: string; data?: CategorieOutput }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();

  const designation = formData.designation.trim();
  if (!designation) {
    return { success: false, error: 'La désignation est obligatoire.' };
  }

  let slug = slugify(designation);
  // Vérifier l'unicité du slug
  const existing = await Categorie.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  try {
    const cat = await Categorie.create({
      designation,
      description: formData.description?.trim() || '',
      slug,
      status: true,
    });

    revalidatePath('/');
    return {
      success: true,
      data: {
        _id: cat._id.toString(),
        designation: cat.designation,
        description: cat.description,
        image: cat.image,
        slug: cat.slug,
        status: cat.status,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la création." };
  }
}

/* ── Modifier une catégorie (MOD ou ADMIN) ── */
export async function updateCategorie(
  id: string,
  formData: { designation?: string; description?: string; status?: boolean }
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
  if (formData.status !== undefined) update.status = formData.status;

  try {
    await Categorie.findByIdAndUpdate(id, update);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la modification." };
  }
}

/* ── Supprimer une catégorie (MOD ou ADMIN) ── */
export async function deleteCategorie(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session || session.role === 'PLAYER') {
    return { success: false, error: 'Accès refusé.' };
  }

  await connectToDb();

  try {
    await Categorie.findByIdAndDelete(id);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de la suppression." };
  }
}