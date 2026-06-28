"use client";

import React from "react";
import { UserCircleIcon, CheckCircleIcon, CloseLineIcon, TrashBinIcon } from "@/icons";
import type { MembreData } from "@/app/actions/equipe.actions";

interface MembreCardProps {
  membre: MembreData;
  isChef: boolean;
  isCurrentUserChef: boolean;
  onToggleSecretaire?: (playerId: string) => void;
  onRemove?: (playerId: string) => void;
}

export default function MembreCard({
  membre,
  isChef,
  isCurrentUserChef,
  onToggleSecretaire,
  onRemove,
}: MembreCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {membre.photo ? (
          <img
            src={membre.photo}
            alt={membre.pseudo}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
            {membre.pseudo}
          </p>
          {isChef && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Capitaine
            </span>
          )}
          {membre.isSecretary && !isChef && (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
              Secrétaire
            </span>
          )}
          {!membre.status && (
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400">
              En attente
            </span>
          )}
        </div>
        {membre.telephone && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {membre.telephone}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isCurrentUserChef && !isChef && membre.status && (
          <button
            type="button"
            onClick={() => onToggleSecretaire?.(membre.playerId)}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              membre.isSecretary
                ? "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/15 dark:text-purple-400"
            }`}
            title={membre.isSecretary ? "Retirer le rôle de secrétaire" : "Nommer secrétaire"}
          >
            {membre.isSecretary ? (
              <>
                <CloseLineIcon className="h-3 w-3" />
                Rétrograder
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-3 w-3" />
                Secrétaire
              </>
            )}
          </button>
        )}
        {isCurrentUserChef && !isChef && (
          <button
            type="button"
            onClick={() => onRemove?.(membre.playerId)}
            className="inline-flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-medium text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors"
            title="Retirer le membre"
          >
            <TrashBinIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}