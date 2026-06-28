"use client";

import React from "react";
import type { ActualiteData } from "@/app/actions/equipe.actions";

interface ActualiteCardProps {
  actualite: ActualiteData;
}

export default function ActualiteCard({ actualite }: ActualiteCardProps) {
  return (
    <div className="relative h-64 w-72 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
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