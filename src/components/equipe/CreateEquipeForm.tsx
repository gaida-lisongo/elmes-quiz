"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import PlayerSelect from "./PlayerSelect";
import { createEquipe } from "@/app/actions/equipe.actions";
import type { PlayerSearchResult } from "@/app/actions/equipe.actions";
import { uploadToCloudinary as uploadFile } from "@/app/actions/cloudinary.actions";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  CloseLineIcon,
} from "@/icons";

interface CreateEquipeFormProps {
  onSuccess?: () => void;
}

export default function CreateEquipeForm({ onSuccess }: CreateEquipeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Étape 1 : Description
  const [designation, setDesignation] = useState("");
  const [descriptionSections, setDescriptionSections] = useState<string[]>([""]);
  const [logo, setLogo] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  // Étape 2 : Invitations
  const [invitedMembers, setInvitedMembers] = useState<PlayerSearchResult[]>([]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFile(formData);
      if (result.success && result.url) {
        setLogo(result.url);
      } else {
        setError(result.error || "Échec de l'upload du logo.");
      }
    } catch {
      setError("Erreur lors de l'upload du logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const addDescriptionSection = () => {
    setDescriptionSections([...descriptionSections, ""]);
  };

  const removeDescriptionSection = (index: number) => {
    if (descriptionSections.length <= 1) return;
    setDescriptionSections(descriptionSections.filter((_, i) => i !== index));
  };

  const updateDescriptionSection = (index: number, value: string) => {
    const updated = [...descriptionSections];
    updated[index] = value;
    setDescriptionSections(updated);
  };

  const canGoNext =
    step === 1 &&
    designation.trim().length >= 3 &&
    descriptionSections.some((s) => s.trim().length > 0);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await createEquipe({
        designation: designation.trim(),
        description: descriptionSections.filter((s) => s.trim()),
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
      setLoading(false);
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
        <div className="space-y-5">
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
              </div>
              {logo && (
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sections description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-error-500">*</span>
            </label>
            <div className="space-y-3">
              {descriptionSections.map((section, index) => (
                <div key={index} className="flex gap-2">
                  <TextArea
                    placeholder={`Section ${index + 1} — Décrivez votre équipe...`}
                    rows={2}
                    value={section}
                    onChange={(val) => updateDescriptionSection(index, val)}
                    className="flex-1"
                  />
                  {descriptionSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDescriptionSection(index)}
                      className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                    >
                      <CloseLineIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDescriptionSection}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter une section
            </button>
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
            (5 avec vous, le capitaine). Les invitations devront être acceptées
            par les joueurs.
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
            <h4 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
              Récapitulatif
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <strong>Nom :</strong> {designation}
              </li>
              <li>
                <strong>Description :</strong>{" "}
                {descriptionSections.filter(Boolean).length} section(s)
              </li>
              <li>
                <strong>Membres invités :</strong>{" "}
                {invitedMembers.length > 0
                  ? invitedMembers.map((m) => m.pseudo).join(", ")
                  : "Aucun"}
              </li>
            </ul>
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
              disabled={loading}
              endIcon={<CheckCircleIcon className="h-4 w-4" />}
            >
              {loading ? "Création..." : "Créer l'équipe"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}