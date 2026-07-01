"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { addActualite } from "@/app/actions/equipe.actions";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/icons";
import { useLoader } from "@/context/LoaderContext";

interface AddActualiteModalProps {
  equipeId: string;
  onClose: () => void;
}

const CONTENT_SECTIONS = [
  { key: "objectif", label: "Objectif / Activité", placeholder: "Décrivez l'objectif ou l'activité de cette actualité..." },
  { key: "description", label: "Description", placeholder: "Donnez plus de détails sur ce qui s'est passé..." },
  { key: "conclusion", label: "Conclusion", placeholder: "Quelle est la conclusion ou le résultat ?" },
];

export default function AddActualiteModal({ equipeId, onClose }: AddActualiteModalProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Étape 1 : Titre, sous-titre, image
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Étape 2 : Sections de contenu nommées
  const [contentSections, setContentSections] = useState<Record<string, string>>({
    objectif: "",
    description: "",
    conclusion: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setImageError("L'image est trop volumineuse (max 5 Mo).");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    setImageError("");
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (result.success && result.url) {
        setImage(result.url);
      } else {
        setImageError(result.error || "Échec de l'upload. Vérifiez votre connexion et réessayez.");
      }
    } catch {
      setImageError("Erreur réseau lors de l'upload. Vérifiez votre connexion internet.");
    } finally {
      setImageUploading(false);
    }
  };

  const updateContentSection = (key: string, value: string) => {
    setContentSections((prev) => ({ ...prev, [key]: value }));
  };

  const canGoNext = step === 1 && title.trim().length >= 2;

  const handleSubmit = async () => {
    setError("");
    showLoader('Publication de l\'actualité...');
    try {
      // Construire le contenu avec les labels de section
      const contentParts: string[] = [];
      for (const section of CONTENT_SECTIONS) {
        const val = contentSections[section.key]?.trim();
        if (val) {
          contentParts.push(`${section.label}: ${val}`);
        }
      }

      const result = await addActualite({
        title: title.trim(),
        subTitle: subTitle.trim(),
        image,
        content: contentParts,
      });
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Erreur lors de l'ajout.");
      }
    } catch {
      setError("Erreur serveur.");
    } finally {
      hideLoader();
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg w-full p-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Nouvelle actualité
      </h2>

      {/* Indicateur d'étapes */}
      <div className="mb-6 flex items-center justify-center gap-4">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step >= s
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {step > s ? <CheckCircleIcon className="h-4 w-4" /> : s}
            </div>
            <span
              className={`text-xs font-medium ${
                step >= s
                  ? "text-gray-800 dark:text-white/90"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {s === 1 ? "Infos" : "Contenu"}
            </span>
            {s < 2 && <div className="mx-1 h-px w-6 bg-gray-300 dark:bg-gray-600" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Étape 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre <span className="text-error-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Titre de l'actualité"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sous-titre
            </label>
            <Input
              type="text"
              placeholder="Sous-titre (optionnel)"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <FileInput onChange={handleImageUpload} />
                {imageUploading && (
                  <p className="mt-1 text-xs text-gray-500">Upload en cours...</p>
                )}
                {imageError && (
                  <p className="mt-1 text-xs text-error-500">{imageError}</p>
                )}
              </div>
              {image && (
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                  >
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setStep(2)}
              disabled={!canGoNext}
              endIcon={<ArrowRightIcon className="h-4 w-4" />}
              size="sm"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Étape 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Remplissez les sections ci-dessous pour structurer votre actualité.
          </p>
          {CONTENT_SECTIONS.map((section) => (
            <div key={section.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {section.label}
              </label>
              <TextArea
                placeholder={section.placeholder}
                rows={3}
                value={contentSections[section.key]}
                onChange={(val) => updateContentSection(section.key, val)}
              />
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              startIcon={<ChevronLeftIcon className="h-4 w-4" />}
              size="sm"
            >
              Retour
            </Button>
            <Button
              onClick={handleSubmit}
              endIcon={<CheckCircleIcon className="h-4 w-4" />}
              size="sm"
            >
              Publier
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}