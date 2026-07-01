"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import PlayerSelect from "./PlayerSelect";
import { createEquipe } from "@/app/actions/equipe.actions";
import type { PlayerSearchResult } from "@/app/actions/equipe.actions";
import type { CategorieOutput } from "@/app/actions/categorie.actions";
import { getAllCategories } from "@/app/actions/categorie.actions";
import { uploadToCloudinary as uploadFile } from "@/app/actions/cloudinary.actions";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/icons";
import { useLoader } from "@/context/LoaderContext";

interface CreateEquipeFormProps {
  onSuccess?: () => void;
}

export default function CreateEquipeForm({ onSuccess }: CreateEquipeFormProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Étape 1 : Description
  const [designation, setDesignation] = useState("");
  const [categories, setCategories] = useState<CategorieOutput[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [objectif, setObjectif] = useState("");
  const [logo, setLogo] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");

  // Étape 2 : Invitations
  const [invitedMembers, setInvitedMembers] = useState<PlayerSearchResult[]>([]);

  // Charger les catégories au montage
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

    // Validation côté client
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setLogoError("L'image est trop volumineuse (max 5 Mo).");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    setLogoError("");
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);
      if (result.success && result.url) {
        setLogo(result.url);
      } else {
        setLogoError(result.error || "Échec de l'upload du logo. Vérifiez votre connexion et réessayez.");
      }
    } catch {
      setLogoError("Erreur réseau lors de l'upload. Vérifiez votre connexion internet.");
    } finally {
      setLogoUploading(false);
    }
  };

  const canGoNext =
    step === 1 &&
    designation.trim().length >= 3 &&
    selectedCategories.length > 0 &&
    objectif.trim().length >= 10;

  const handleSubmit = async () => {
    setError("");
    showLoader("Création de l'équipe...");
    try {
      // Construire la description : catégories + objectif
      const descriptionParts: string[] = [];
      if (selectedCategories.length > 0) {
        descriptionParts.push(`Catégories: ${selectedCategories.join("; ")}`);
      }
      if (objectif.trim()) {
        descriptionParts.push(`Objectif: ${objectif.trim()}`);
      }

      const result = await createEquipe({
        designation: designation.trim(),
        description: descriptionParts,
        logo,
        membres: invitedMembers.map((m) => m.playerId),
      });
      if (result.success) {
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || "Erreur lors de la création de l'équipe.");
      }
    } catch {
      setError("Erreur serveur.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      {/* Indicateur d'étapes */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step >= s
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {step > s ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                s
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {s === 1 ? "Description" : "Invitations"}
            </span>
            {s < 2 && (
              <div className="mx-2 h-px w-8 bg-gray-300 dark:bg-gray-600" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Étape 1 : Description */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Décrivez votre équipe
          </h3>

          {/* Désignation */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom de l&apos;équipe <span className="text-error-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Ex: Les Génies du Quiz"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
            {designation.length > 0 && designation.length < 3 && (
              <p className="mt-1 text-xs text-error-500">Minimum 3 caractères.</p>
            )}
          </div>

          {/* Logo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Logo de l&apos;équipe
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <FileInput onChange={handleLogoUpload} />
                {logoUploading && (
                  <p className="mt-1 text-xs text-gray-500">Upload en cours...</p>
                )}
                {logoError && (
                  <p className="mt-1 text-xs text-error-500">{logoError}</p>
                )}
              </div>
              {logo && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quelles sont vos catégories ? <span className="text-error-500">*</span>
            </label>
            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Sélectionnez une ou plusieurs catégories qui représentent votre équipe.
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.designation);
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => toggleCategory(cat.designation)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {isSelected && <CheckCircleIcon className="h-3.5 w-3.5" />}
                    {cat.designation}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length > 0 && (
              <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2 dark:border-brand-500/20 dark:bg-brand-500/5">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Sélectionnées :</span>{" "}
                  {selectedCategories.join(" ; ")}
                </p>
              </div>
            )}
            {selectedCategories.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">Aucune catégorie sélectionnée.</p>
            )}
          </div>

          {/* Objectif */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quel est votre objectif sur la plateforme ?{" "}
              <span className="text-error-500">*</span>
            </label>
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Décrivez ce que votre équipe souhaite accomplir (minimum 10 caractères).
            </p>
            <TextArea
              placeholder="Ex: Nous voulons devenir la meilleure équipe de quiz en culture générale et remporter les compétitions inter-écoles..."
              rows={4}
              value={objectif}
              onChange={setObjectif}
            />
            {objectif.length > 0 && objectif.length < 10 && (
              <p className="mt-1 text-xs text-error-500">
                Minimum 10 caractères ({objectif.length}/10).
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!canGoNext}
              endIcon={<ArrowRightIcon className="h-4 w-4" />}
            >
              Étape suivante
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2 : Invitations */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Invitez des membres
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recherchez des joueurs par pseudo ou téléphone. Maximum 4 membres
            (5 avec vous, le capitaine). Seuls les joueurs de niveau
            Intermédiaire (2) ou Avancé (3) peuvent être invités.
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Membres invités ({invitedMembers.length}/4)
            </label>
            <PlayerSelect
              selected={invitedMembers}
              onChange={setInvitedMembers}
              max={4}
            />
          </div>

          {/* Récapitulatif */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
              Récapitulatif de votre équipe
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-gray-800 dark:text-white/90 min-w-[80px]">
                  Nom :
                </span>
                <span>{designation}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-gray-800 dark:text-white/90 min-w-[80px]">
                  Catégories :
                </span>
                <span>{selectedCategories.join(" ; ")}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-gray-800 dark:text-white/90 min-w-[80px]">
                  Objectif :
                </span>
                <span className="line-clamp-2">{objectif}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 font-medium text-gray-800 dark:text-white/90 min-w-[80px]">
                  Membres :
                </span>
                <span>
                  {invitedMembers.length > 0
                    ? invitedMembers.map((m) => m.pseudo).join(", ")
                    : "Aucun invité"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              startIcon={<ChevronLeftIcon className="h-4 w-4" />}
            >
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              endIcon={<CheckCircleIcon className="h-4 w-4" />}
            >
              Créer l&apos;équipe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}