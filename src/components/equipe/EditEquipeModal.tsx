"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { updateEquipe } from "@/app/actions/equipe.actions";
import type { CategorieOutput } from "@/app/actions/categorie.actions";
import { getAllCategories } from "@/app/actions/categorie.actions";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import { CheckCircleIcon, CloseIcon } from "@/icons";
import type { EquipeData } from "@/app/actions/equipe.actions";

interface EditEquipeModalProps {
  equipe: EquipeData;
  onClose: () => void;
}

export default function EditEquipeModal({ equipe, onClose }: EditEquipeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [designation, setDesignation] = useState(equipe.designation);
  const [categories, setCategories] = useState<CategorieOutput[]>([]);

  // Parser la description existante
  const existingCategoriesStr = equipe.description.find((d) => d.startsWith("Catégories:"))?.replace("Catégories:", "").trim() || "";
  const existingObjectif = equipe.description.find((d) => d.startsWith("Objectif:"))?.replace("Objectif:", "").trim() || "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    existingCategoriesStr ? existingCategoriesStr.split(";").map((s) => s.trim()).filter(Boolean) : []
  );
  const [objectif, setObjectif] = useState(existingObjectif);
  const [logo, setLogo] = useState(equipe.logo || "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {});
  }, []);

  const toggleCategory = (designation: string) => {
    setSelectedCategories((prev) =>
      prev.includes(designation)
        ? prev.filter((c) => c !== designation)
        : [...prev, designation]
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { setLogoError("L'image est trop volumineuse (max 5 Mo)."); return; }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) { setLogoError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF."); return; }

    setLogoError("");
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (result.success && result.url) {
        setLogo(result.url);
      } else {
        setLogoError(result.error || "Échec de l'upload.");
      }
    } catch {
      setLogoError("Erreur réseau lors de l'upload.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (designation.trim().length < 3) {
      setError("Le nom doit avoir au moins 3 caractères.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const descriptionParts: string[] = [];
      if (selectedCategories.length > 0) {
        descriptionParts.push(`Catégories: ${selectedCategories.join("; ")}`);
      }
      if (objectif.trim()) {
        descriptionParts.push(`Objectif: ${objectif.trim()}`);
      }

      const result = await updateEquipe({
        designation: designation.trim(),
        description: descriptionParts,
        logo,
      });
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Erreur lors de la modification.");
      }
    } catch {
      setError("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg w-full p-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Modifier l&apos;équipe
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Désignation */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom de l&apos;équipe <span className="text-error-500">*</span>
          </label>
          <Input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
        </div>

        {/* Logo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Logo
          </label>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <FileInput onChange={handleLogoUpload} />
              {logoUploading && <p className="mt-1 text-xs text-gray-500">Upload en cours...</p>}
              {logoError && <p className="mt-1 text-xs text-error-500">{logoError}</p>}
            </div>
            {logo && (
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setLogo("")}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                >
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Catégories */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Catégories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.designation);
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat.designation)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {isSelected && <CheckCircleIcon className="h-3 w-3" />}
                  {cat.designation}
                </button>
              );
            })}
          </div>
        </div>

        {/* Objectif */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Objectif sur la plateforme
          </label>
          <TextArea
            placeholder="Décrivez l'objectif de votre équipe..."
            rows={3}
            value={objectif}
            onChange={setObjectif}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} size="sm">
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            endIcon={<CheckCircleIcon className="h-4 w-4" />}
            size="sm"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}