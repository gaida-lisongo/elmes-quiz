"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { getCurrentUserDetailed } from "@/app/actions/auth.actions";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import {
  updateProfileIdentity,
  updateProfilePassword,
  updateProfilePhoto,
} from "@/app/actions/profile.actions";

interface UserProfile {
  _id: string;
  pseudo: string;
  telephone: string;
  email: string | null;
  photo: string | null;
  solde: number;
  role: string;
  profile: {
    type: string;
    level?: number;
    school?: string;
    metrics?: {
      totalScore: number;
      partiesJouees: number;
      MeilleurScore: number;
    };
    permissions?: string[];
    retraits?: any[];
    tickets?: any[];
  } | null;
}

export default function ProfileClient() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // États du formulaire Identité
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");

  // États du formulaire Mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // États de soumission et feedback
  const [identityLoading, setIdentityLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [identityMessage, setIdentityMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [photoMessage, setPhotoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals
  const identityModal = useModal();
  const passwordModal = useModal();

  // Chargement initial des données
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCurrentUserDetailed();
      if (data) {
        setUser(data as unknown as UserProfile);
        setPseudo(data.pseudo || "");
        setEmail(data.email || "");
        if (data.role === "PLAYER" && (data as any).profile?.school) {
          setSchool((data as any).profile.school);
        }
      }
    } catch (err) {
      console.error("Erreur chargement profil", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Upload photo / Cloudinary
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    setPhotoMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResult = await uploadToCloudinary(formData);
      if (!uploadResult.success || !uploadResult.url) {
        setPhotoMessage({
          type: "error",
          text: uploadResult.error || "Échec de l'upload de l'image.",
        });
        return;
      }

      const updateResult = await updateProfilePhoto(uploadResult.url);
      if (updateResult.success) {
        setPhotoMessage({ type: "success", text: "Photo mise à jour !" });
        // Mettre à jour l'état local pour voir la nouvelle image immédiatement
        setUser((prev) =>
          prev ? { ...prev, photo: uploadResult.url } : prev
        );
      } else {
        setPhotoMessage({
          type: "error",
          text: updateResult.error || "Échec de la mise à jour de la photo.",
        });
      }
    } catch (err: any) {
      setPhotoMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setPhotoLoading(false);
    }
  };

  // Soumission formulaire Identité
  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityLoading(true);
    setIdentityMessage(null);

    try {
      const formData = new FormData();
      formData.set("pseudo", pseudo);
      formData.set("email", email);
      if (user?.role === "PLAYER") {
        formData.set("school", school);
      }

      const result = await updateProfileIdentity(formData);
      if (result.success) {
        setIdentityMessage({ type: "success", text: result.message || "Profil mis à jour." });
        // Mettre à jour l'état local
        setUser((prev) =>
          prev ? { ...prev, pseudo, email: email || null } : prev
        );
        // Fermer la modale après un court délai
        setTimeout(() => {
          identityModal.closeModal();
          setIdentityMessage(null);
        }, 1500);
      } else {
        setIdentityMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
      }
    } catch (err: any) {
      setIdentityMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setIdentityLoading(false);
    }
  };

  // Soumission formulaire Mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    try {
      const formData = new FormData();
      formData.set("oldPassword", oldPassword);
      formData.set("newPassword", newPassword);
      formData.set("confirmPassword", confirmPassword);

      const result = await updateProfilePassword(formData);
      if (result.success) {
        setPasswordMessage({ type: "success", text: result.message || "Mot de passe mis à jour." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          passwordModal.closeModal();
          setPasswordMessage(null);
        }, 1500);
      } else {
        setPasswordMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
      }
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Obtenir les initiales
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">
          Impossible de charger le profil. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  // Couleur basée sur le rôle
  const roleLabel =
    user.role === "PLAYER"
      ? "Élève"
      : user.role === "MOD"
      ? "Modérateur"
      : "Administrateur";

  const schoolName =
    user.role === "PLAYER" && (user as any).profile?.school
      ? (user as any).profile.school
      : null;

  return (
    <div className="space-y-6">
      {/* ===== CARTE PHOTO + IDENTITÉ ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Avatar / Photo */}
            <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              {user.photo ? (
                <Image
                  width={80}
                  height={80}
                  src={user.photo}
                  alt={user.pseudo}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-lg font-semibold text-white bg-brand-500">
                  {getInitials(user.pseudo)}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="order-3 xl:order-2">
              <h4 className="mb-1 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.pseudo}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {roleLabel}
                </p>
                {schoolName && (
                  <>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {schoolName}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Upload photo button */}
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
                {photoLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Upload...
                  </span>
                ) : (
                  <>
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9 2.25C9.41421 2.25 9.75 2.58579 9.75 3V8.25H15C15.4142 8.25 15.75 8.58579 15.75 9C15.75 9.41421 15.4142 9.75 15 9.75H9.75V15C9.75 15.4142 9.41421 15.75 9 15.75C8.58579 15.75 8.25 15.4142 8.25 15V9.75H3C2.58579 9.75 2.25 9.41421 2.25 9C2.25 8.58579 2.58579 8.25 3 8.25H8.25V3C8.25 2.58579 8.58579 2.25 9 2.25Z"
                        fill=""
                      />
                    </svg>
                    Photo
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={photoLoading}
                />
              </label>
            </div>
          </div>
        </div>
        {photoMessage && (
          <div
            className={`mt-3 text-center text-sm ${
              photoMessage.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {photoMessage.text}
          </div>
        )}
      </div>

      {/* ===== INFORMATIONS PERSONNELLES ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Informations personnelles
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Pseudo
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.pseudo}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Téléphone
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.telephone}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.email || "—"}
                </p>
              </div>

              {user.role === "PLAYER" && schoolName && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    École
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {schoolName}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Solde
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.solde} FC
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={identityModal.openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Modifier
          </button>
        </div>
      </div>

      {/* ===== CHANGER LE MOT DE PASSE ===== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Mot de passe
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mettez à jour votre mot de passe de connexion.
            </p>
          </div>

          <button
            onClick={passwordModal.openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Changer
          </button>
        </div>
      </div>

      {/* ===== MODALE: MODIFIER IDENTITÉ ===== */}
      <Modal
        isOpen={identityModal.isOpen}
        onClose={identityModal.closeModal}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier les informations
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour votre profil.
            </p>
          </div>

          <form onSubmit={handleIdentitySubmit} className="flex flex-col">
            <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="pseudo">Pseudo</Label>
                  <Input
                    id="pseudo"
                    name="pseudo"
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Votre pseudo"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    type="text"
                    value={user.telephone}
                    disabled
                    hint="Le numéro de téléphone ne peut pas être modifié."
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                  />
                </div>

                {user.role === "PLAYER" && (
                  <div className="col-span-2 lg:col-span-1">
                    <Label htmlFor="school">École</Label>
                    <Input
                      id="school"
                      name="school"
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="Nom de votre école"
                    />
                  </div>
                )}
              </div>

              {identityMessage && (
                <div
                  className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                    identityMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {identityMessage.text}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={identityModal.closeModal}
                disabled={identityLoading}
              >
                Annuler
              </Button>
              <Button size="sm" type="submit" disabled={identityLoading}>
                {identityLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ===== MODALE: CHANGER MOT DE PASSE ===== */}
      <Modal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.closeModal}
        className="max-w-[500px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Changer le mot de passe
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Utilisez un mot de passe sécurisé d&apos;au moins 4 caractères.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {passwordMessage && (
                <div
                  className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={passwordModal.closeModal}
                disabled={passwordLoading}
              >
                Annuler
              </Button>
              <Button size="sm" type="submit" disabled={passwordLoading}>
                {passwordLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Mise à jour...
                  </span>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}