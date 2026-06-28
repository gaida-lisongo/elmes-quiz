"use client";

import React, { useState } from "react";
import MembreCard from "./MembreCard";
import PlayerSelect from "./PlayerSelect";
import { inviteMembre, toggleSecretaire } from "@/app/actions/equipe.actions";
import { useRouter } from "next/navigation";
import { PlusIcon, ShootingStarIcon, GroupIcon } from "@/icons";
import type { EquipeData, PlayerSearchResult } from "@/app/actions/equipe.actions";

interface EquipeTabsProps {
  equipe: EquipeData;
  isChef: boolean;
}

type TabKey = "membres" | "competitions";

export default function EquipeTabs({ equipe, isChef }: EquipeTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("membres");
  const [showInvite, setShowInvite] = useState(false);
  const [invitedPlayers, setInvitedPlayers] = useState<PlayerSearchResult[]>([]);
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  const membresAcceptes = equipe.membres.filter((m) => m.status);
  const membresEnAttente = equipe.membres.filter((m) => !m.status);
  const canInvite = isChef && membresAcceptes.length < 5;

  const handleInvite = async () => {
    if (invitedPlayers.length === 0) return;
    setInviteError("");
    setInviting(true);
    try {
      for (const player of invitedPlayers) {
        const result = await inviteMembre(player.playerId);
        if (!result.success) {
          setInviteError(result.error || "Erreur d'invitation.");
          break;
        }
      }
      setInvitedPlayers([]);
      setShowInvite(false);
      router.refresh();
    } catch {
      setInviteError("Erreur serveur.");
    } finally {
      setInviting(false);
    }
  };

  const handleToggleSecretaire = async (playerId: string) => {
    const result = await toggleSecretaire(playerId);
    if (result.success) {
      router.refresh();
    }
  };

  const tabs = [
    {
      key: "membres" as TabKey,
      label: "Membres",
      icon: <GroupIcon className="h-4 w-4" />,
      count: equipe.membres.length,
    },
    {
      key: "competitions" as TabKey,
      label: "Compétitions",
      icon: <ShootingStarIcon className="h-4 w-4" />,
      count: equipe.metriques.competitions,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      {/* Tabs */}
      <div className="mb-5 flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white/90"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                activeTab === tab.key
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Contenu Membres */}
      {activeTab === "membres" && (
        <div className="space-y-4">
          {/* En-tête avec bouton inviter */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {membresAcceptes.length} membre{membresAcceptes.length > 1 ? "s" : ""} actif
              {membresAcceptes.length > 1 ? "s" : ""}
              {membresEnAttente.length > 0 &&
                ` · ${membresEnAttente.length} en attente`}
            </p>
            {canInvite && !showInvite && (
              <button
                type="button"
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Inviter un membre
              </button>
            )}
          </div>

          {/* Zone d'invitation */}
          {showInvite && canInvite && (
            <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Inviter un joueur
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvite(false);
                    setInvitedPlayers([]);
                    setInviteError("");
                  }}
                  className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Annuler
                </button>
              </div>
              <PlayerSelect
                selected={invitedPlayers}
                onChange={setInvitedPlayers}
                max={5 - membresAcceptes.length}
                excludeIds={equipe.membres.map((m) => m.playerId)}
              />
              {inviteError && (
                <p className="mt-2 text-xs text-error-500">{inviteError}</p>
              )}
              {invitedPlayers.length > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleInvite}
                    disabled={inviting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
                  >
                    {inviting ? "Invitation..." : `Inviter (${invitedPlayers.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Liste des membres */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {equipe.membres.map((membre) => (
              <MembreCard
                key={membre.playerId}
                membre={membre}
                isChef={membre.playerId === equipe.chefId}
                isCurrentUserChef={isChef}
                onToggleSecretaire={handleToggleSecretaire}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contenu Compétitions */}
      {activeTab === "competitions" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShootingStarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h4 className="text-base font-medium text-gray-800 dark:text-white/90 mb-1">
            Compétitions à venir
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Les compétitions auxquelles votre équipe pourra s&apos;inscrire
            apparaîtront ici. Cette fonctionnalité sera disponible prochainement.
          </p>
        </div>
      )}
    </div>
  );
}