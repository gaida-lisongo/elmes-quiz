"use client";

import React from "react";
import { PencilIcon, TrashBinIcon } from "@/icons";
import type { ActualiteData } from "@/app/actions/equipe.actions";

interface ActualiteCardProps {
  actualite: ActualiteData;
  showActions?: boolean;
  onEdit?: (actualite: ActualiteData) => void;
  onDelete?: (actualiteId: string) => void;
  onRead?: (actualite: ActualiteData) => void;
}

export default function ActualiteCard({
  actualite,
  showActions = false,
  onEdit,
  onDelete,
  onRead,
}: ActualiteCardProps) {
  return (
    <div
      onClick={() => onRead?.(actualite)}
      className={`relative h-64 w-72 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 group dark:border-gray-700 ${onRead ? "cursor-pointer" : ""}`}
    >
      {/* Image de fond avec overlay */}
      {actualite.image ? (
        <img
          src={actualite.image}
          alt={actualite.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Boutons d'action (edit/delete) */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit?.(actualite); }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-brand-600 transition-colors"
            title="Modifier"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete?.(actualite._id); }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-error-600 transition-colors"
            title="Supprimer"
          >
            <TrashBinIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-base font-semibold text-white line-clamp-1">
          {actualite.title}
        </h4>
        {actualite.subTitle && (
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">
            {actualite.subTitle}
          </p>
        )}
        {actualite.content && actualite.content.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            {actualite.content.length} section{actualite.content.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}