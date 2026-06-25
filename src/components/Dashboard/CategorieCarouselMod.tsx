"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import type { CategorieOutput } from "@/app/actions/categorie.actions";

/* ── Modale de création/édition de catégorie ── */
interface CategorieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CategorieOutput | null;
}

function CategorieFormModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: CategorieFormModalProps) {
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Synchroniser les champs quand editData change (ouverture edition)
  useEffect(() => {
    if (isOpen) {
      setDesignation(editData?.designation ?? "");
      setDescription(editData?.description ?? "");
      setError("");
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation.trim()) {
      setError("La désignation est obligatoire.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { createCategorie, updateCategorie } = await import(
        "@/app/actions/categorie.actions"
      );

      const result = editData
        ? await updateCategorie(editData._id, {
            designation: designation.trim(),
            description: description.trim() || undefined,
          })
        : await createCategorie({
            designation: designation.trim(),
            description: description.trim() || undefined,
          });

      if (!result.success) {
        setError(result.error || "Une erreur est survenue.");
        return;
      }

      setDesignation("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg" showCloseButton>
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Modifier la catégorie" : "Ajouter une catégorie"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Désignation</Label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Ex: Mathématiques, Culture Générale..."
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <div>
            <Label>Description (optionnelle)</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève description de la catégorie..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button disabled={loading}>
              {loading ? "Enregistrement..." : editData ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ── Props du carrousel MOD ── */
interface CategorieCarouselModProps {
  categories: CategorieOutput[];
  onRefresh?: () => void;
}

const CategorieCarouselMod: React.FC<CategorieCarouselModProps> = ({
  categories: initialCategories,
  onRefresh,
}) => {
  const [categories, setCategories] = useState(initialCategories);
  const [startIndex, setStartIndex] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<CategorieOutput | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visibleCount = 3;
  const maxStartIndex = Math.max(0, categories.length - visibleCount);
  const visible = categories.slice(startIndex, startIndex + visibleCount);

  const refresh = async () => {
    const { getAllCategoriesAdmin } = await import(
      "@/app/actions/categorie.actions"
    );
    const fresh = await getAllCategoriesAdmin();
    setCategories(fresh);
    onRefresh?.();
  };

  /* ── Ouvrir modale création ── */
  const openCreate = () => {
    setEditCat(null);
    setFormOpen(true);
  };

  /* ── Ouvrir modale édition ── */
  const openEdit = (cat: CategorieOutput) => {
    setEditCat(cat);
    setFormOpen(true);
  };

  /* ── Supprimer ── */
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { deleteCategorie } = await import(
        "@/app/actions/categorie.actions"
      );
      await deleteCategorie(deleteId);
      setDeleteId(null);
      await refresh();
    } catch {
      // silence
    } finally {
      setDeleting(false);
    }
  };

  /* ── Toggle status ── */
  const toggleStatus = async (cat: CategorieOutput) => {
    try {
      const { updateCategorie } = await import(
        "@/app/actions/categorie.actions"
      );
      await updateCategorie(cat._id, { status: !cat.status });
      await refresh();
    } catch {
      // silence
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              📂 Gestion des Catégories
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Créez, modifiez ou supprimez les catégories de questions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {categories.length > visibleCount && (
              <>
                <button
                  onClick={() => setStartIndex((p) => Math.max(0, p - 1))}
                  disabled={startIndex === 0}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStartIndex((p) => Math.min(maxStartIndex, p + 1))}
                  disabled={startIndex >= maxStartIndex}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Cards */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Aucune catégorie pour le moment</p>
            <button
              onClick={openCreate}
              className="mt-2 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              + Créer la première catégorie
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((cat) => (
              <div
                key={cat._id}
                className="relative group h-44 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                {/* Background overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(/images/categorie.jpg)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Contenu */}
                <div className="relative z-10 flex flex-col justify-end h-full p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white drop-shadow-sm">
                      {cat.designation}
                    </h4>
                    {/* Status indicator */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cat.status
                          ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  {cat.description && (
                    <p className="mt-1 text-xs text-gray-200 line-clamp-1">
                      {cat.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href={`/questions/${cat.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200 transition-colors"
                    >
                      Voir questions →
                    </Link>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat._id)}
                        className="p-1 rounded-md bg-white/20 hover:bg-red-400/30 transition-colors"
                        title="Supprimer"
                      >
                        <TrashBinIcon className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => toggleStatus(cat)}
                        className={`p-1 rounded-md transition-colors ${
                          cat.status
                            ? "bg-white/20 hover:bg-amber-400/30"
                            : "bg-green-400/30 hover:bg-green-400/50"
                        }`}
                        title={cat.status ? "Désactiver" : "Activer"}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {cat.status ? "OFF" : "ON"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dots */}
        {categories.length > visibleCount && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {Array.from({ length: maxStartIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setStartIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === startIndex
                    ? "bg-primary-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modale création/édition */}
      <CategorieFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCat(null);
        }}
        onSuccess={refresh}
        editData={editCat}
      />

      {/* Modale confirmation suppression */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        className="max-w-sm"
        showCloseButton
      >
        <div className="p-6 text-center">
          <TrashBinIcon className="w-10 h-10 mx-auto mb-3 text-error-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Confirmer la suppression
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Cette action est irréversible. Voulez-vous vraiment supprimer cette
            catégorie ?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CategorieCarouselMod;