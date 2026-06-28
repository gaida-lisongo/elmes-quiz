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
  PlusIcon,
  CloseLineIcon,
} from "@/icons";

interface AddActualiteModalProps {
  equipeId: string;
  onClose: () => void;
}

export default function AddActualiteModal({ equipeId, onClose }: AddActualiteModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Étape 1 : Titre, sous-titre, image
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [image, setImage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Étape 2 : Sections de contenu
  const [contentSections, setContentSections] = useState<string[]>([""]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (result.success && result.url) {
        setImage(result.url);
      } else {
        setError(result.error || "Échec de l'upload.");
      }
    } catch {
      setError("Erreur lors de l'upload.");
    } finally {
      setImageUploading(false);
    }
  };

  const addContentSection = () => {
    setContentSections([...contentSections, ""]);
  };

  const removeContentSection = (index: number) => {
    if (contentSections.length <= 1) return;
    setContentSections(contentSections.filter((_, i) => i !== index));
  };

  const updateContentSection = (index: number, value: string) => {
    const updated = [...contentSections];
    updated[index] = value;
    setContentSections(updated);
  };

  const canGoNext = step === 1 && title.trim().length >= 2;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await addActualite({
        title: title.trim(),
        subTitle: subTitle.trim(),
        image,
        content: contentSections.filter((s) => s.trim()),
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
      setLoading(false);
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
              </div>
              {image && (
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sections de contenu
            </label>
            <div className="space-y-2">
              {contentSections.map((section, index) => (
                <div key={index} className="flex gap-2">
                  <TextArea
                    placeholder={`Section ${index + 1}...`}
                    rows={2}
                    value={section}
                    onChange={(val) => updateContentSection(index, val)}
                    className="flex-1"
                  />
                  {contentSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContentSection(index)}
                      className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                    >
                      <CloseLineIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addContentSection}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Ajouter une section
            </button>
          </div>

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
              disabled={loading}
              endIcon={<CheckCircleIcon className="h-4 w-4" />}
              size="sm"
            >
              {loading ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}