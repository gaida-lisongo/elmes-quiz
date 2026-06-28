"use client";

import React from "react";
import type { FilleulData } from "@/app/actions/parrainage.actions";

const LEVEL_LABELS: Record<number, string> = {
  0: "Débutant",
  1: "Intermédiaire",
  2: "Avancé",
  3: "Expert",
};

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  1: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  2: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  3: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

interface FilleulCardProps {
  filleul: FilleulData;
}

export default function FilleulCard({ filleul }: FilleulCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-white/[0.03]">
      {/* En-tête : pseudo + niveau */}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {filleul.pseudo}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {filleul.telephone}
          </p>
        </div>
        <span
          className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLORS[filleul.level] || LEVEL_COLORS[0]}`}
        >
          {LEVEL_LABELS[filleul.level] || "Débutant"}
        </span>
      </div>

      {/* École */}
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        🏫 {filleul.school}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2.5 dark:bg-brand-500/10">
        <div className="text-center">
          <p className="text-lg font-bold text-brand-600 dark:text-brand-400">
            {filleul.rechargesReussies}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Recharges</p>
        </div>
        <div className="h-8 w-px bg-brand-200 dark:bg-brand-800" />
        <div className="text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            +{filleul.partiesRapportees}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Parties reçues</p>
        </div>
      </div>

      {/* Dernière recharge */}
      {filleul.derniereRecharge && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Dernière recharge :{" "}
          {new Date(filleul.derniereRecharge).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}