"use client";

import React from "react";
import { CloseIcon } from "@/icons";
import type { ActualiteData } from "@/app/actions/equipe.actions";

interface ArticleReaderProps {
  actualite: ActualiteData;
  onClose: () => void;
}

/**
 * Parse le contenu d'une actualité en sections nommées.
 * Les sections sont stockées sous forme "Label: valeur".
 */
function parseSections(content: string[]): { label: string; text: string }[] {
  return content.map((line) => {
    const colonIdx = line.indexOf(": ");
    if (colonIdx > 0) {
      return {
        label: line.slice(0, colonIdx),
        text: line.slice(colonIdx + 2),
      };
    }
    return { label: "", text: line };
  });
}

export default function ArticleReader({ actualite, onClose }: ArticleReaderProps) {
  const sections = parseSections(actualite.content || []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {/* Bannière image */}
      <div className="relative h-48 sm:h-56">
        {actualite.image ? (
          <img
            src={actualite.image}
            alt={actualite.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Bouton fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 transition-colors"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {/* Titre + sous-titre sur l'image */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-xl font-bold text-white">{actualite.title}</h2>
          {actualite.subTitle && (
            <p className="mt-1 text-sm text-gray-200">{actualite.subTitle}</p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 lg:p-6">
        {sections.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucun contenu détaillé pour cette actualité.
          </p>
        )}

        {sections.map((section, i) => (
          <div key={i} className={i > 0 ? "mt-5" : ""}>
            {section.label && (
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
                {section.label}
              </h3>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}