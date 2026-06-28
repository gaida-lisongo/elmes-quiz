"use client";

import React from "react";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "@/icons";
import type { ActualiteData } from "@/app/actions/equipe.actions";

interface ArticleReaderProps {
  actualite: ActualiteData;
  showActions?: boolean;
  onBack: () => void;
  onEdit?: (actualite: ActualiteData) => void;
  onDelete?: (actualiteId: string) => void;
}

export default function ArticleReader({ 
  actualite, 
  showActions = false, 
  onBack,
  onEdit,
  onDelete 
}: ArticleReaderProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Header avec bouton retour et actions */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Retour
        </button>
        
        {showActions && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(actualite)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              title="Modifier"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(actualite._id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-error-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-error-600 transition-colors"
              title="Supprimer"
            >
              <TrashBinIcon className="h-3.5 w-3.5" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Titre principal */}
      <div className="px-5 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {actualite.title}
        </h1>
        {actualite.subTitle && (
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {actualite.subTitle}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="relative h-64 sm:h-80">
        {actualite.image ? (
          <img
            src={actualite.image}
            alt={actualite.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-500 to-purple-600" />
        )}
      </div>

      {/* Contenu */}
      <div className="px-5 py-6">
        {actualite.content && actualite.content.length > 0 ? (
          <div className="space-y-4">
            {actualite.content.map((line, index) => (
              <p key={index} className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucun contenu détaillé pour cette actualité.
          </p>
        )}
      </div>
    </div>
  );
}