"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { updateActualite } from "@/app/actions/equipe.actions";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import { CheckCircleIcon, CloseIcon } from "@/icons";
import { useLoader } from "@/context/LoaderContext";
import type { ActualiteData } from "@/app/actions/equipe.actions";

interface EditActualiteModalProps {
  actualite: ActualiteData;
  onClose: () => void;
}

const CONTENT_SECTIONS = [
  { key: "objectif", label: "Objectif / Activité", placeholder: "Décrivez l'objectif ou l'activité..." },
  { key: "description", label: "Description", placeholder: "Donnez plus de détails..." },
  { key: "conclusion", label: "Conclusion", placeholder: "Quelle est la conclusion ?" },
];

function parseContent(content: string[]): Record<string, string> {
  const result: Record<string, string> = { objectif: "", description: "", conclusion: "" };
  for (const line of content) {
    for (const section of CONTENT_SECTIONS) {
      if (line.startsWith(`${section.label}: `)) {
        result[section.key] = line.replace(`${section.label}: `, "");
        break;
      }
    }
  }
  return result;
}

export default function EditActualiteModal({ actualite, onClose }: EditActualiteModalProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(actualite.title);
  const [subTitle, setSubTitle] = useState(actualite.subTitle || "");
  const [image, setImage] = useState(actualite.image || "");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  const parsedContent = parseContent(actualite.content || []);
  const [contentSections, setContentSections] = useState<Record<string, string>>(parsedContent);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) { setImageError("L'image est trop volumineuse (max 5 Mo)."); return; }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) { setImageError("Format non supporté."); return; }

    setImageError("");
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (result.success && result.url) {
        setImage(result.url);
      } else {
        setImageError(result.error || "Échec de l'upload.");
      }
    } catch {
      setImageError("Erreur réseau.");
    } finally {
      setImageUploading(false);
    }
  };

  const updateContentSection = (key: string, value: string) => {
    setContentSections((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    showLoader('Modification de l\'actualité...');
    try {
      const contentParts: string[] = [];
      for (const section of CONTENT_SECTIONS) {
        const val = contentSections[section.key]?.trim();
        if (val) contentParts.push(`${section.label}: ${val}`);
      }

      const result = await updateActualite({
        actualiteId: actualite._id,
        title: title.trim(),
        subTitle: subTitle.trim(),
        image,
        content: contentParts,
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
      hideLoader();
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg w-full p-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        Modifier l&apos;actualité
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-xs text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titre <span className="text-error-500">*</span>
          </label>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sous-titre
          </label>
          <Input type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image
          </label>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <FileInput onChange={handleImageUpload} />
              {imageUploading && <p className="mt-1 text-xs text-gray-500">Upload en cours...</p>}
              {imageError && <p className="mt-1 text-xs text-error-500">{imageError}</p>}
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

        {CONTENT_SECTIONS.map((section) => (
          <div key={section.key}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {section.label}
            </label>
            <TextArea
              placeholder={section.placeholder}
              rows={2}
              value={contentSections[section.key]}
              onChange={(val) => updateContentSection(section.key, val)}
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} size="sm">Annuler</Button>
          <Button
            onClick={handleSubmit}
            endIcon={<CheckCircleIcon className="h-4 w-4" />}
            size="sm"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}