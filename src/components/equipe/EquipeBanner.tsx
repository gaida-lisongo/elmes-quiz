"use client";

import React, { useState } from "react";
import { ShootingStarIcon, GroupIcon, DollarLineIcon, PencilIcon } from "@/icons";
import EditEquipeModal from "./EditEquipeModal";
import type { EquipeData } from "@/app/actions/equipe.actions";

interface EquipeBannerProps {
  equipe: EquipeData;
  isChef: boolean;
}

export default function EquipeBanner({ equipe, isChef }: EquipeBannerProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Gauche : Logo + Infos */}
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              {equipe.logo ? (
                <img
                  src={equipe.logo}
                  alt={equipe.designation}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GroupIcon className="h-8 w-8 text-brand-500" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {equipe.designation}
                </h1>
                {isChef && (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                    title="Modifier l'équipe"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                )}
              </div>
              <div className="mt-1 space-y-1">
                {equipe.description.map((desc, i) => (
                  <p
                    key={i}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {desc}
                  </p>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                  <GroupIcon className="h-3 w-3" />
                  {equipe.membres.length} membre{equipe.membres.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Droite : Métriques */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <ShootingStarIcon className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Compétitions</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {equipe.metriques.competitions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <ShootingStarIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Victoires</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {equipe.metriques.matchsWin}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <DollarLineIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Solde</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {equipe.metriques.soldeUsd} USD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditEquipeModal equipe={equipe} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}