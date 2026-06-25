"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import type { CategorieOutput } from "@/app/actions/categorie.actions";

interface CategorieCarouselPlayerProps {
  categories: CategorieOutput[];
}

const CategorieCarouselPlayer: React.FC<CategorieCarouselPlayerProps> = ({
  categories,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const maxStartIndex = Math.max(0, categories.length - visibleCount);
  const visible = categories.slice(startIndex, startIndex + visibleCount);

  if (categories.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            📚 Catégories
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Choisis une catégorie et lance une partie
          </p>
        </div>
        {categories.length > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStartIndex((p) => Math.max(0, p - 1))}
              disabled={startIndex === 0}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStartIndex((p) => Math.min(maxStartIndex, p + 1))}
              disabled={startIndex >= maxStartIndex}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((cat) => (
          <Link
            key={cat._id}
            href={`/partie/${cat.slug}`}
            className="relative group block h-44 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
          >
            {/* Background image avec overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(/images/categorie.jpg)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 group-hover:via-black/50 transition-all" />

            {/* Contenu */}
            <div className="relative z-10 flex flex-col justify-end h-full p-4">
              <h4 className="text-base font-bold text-white drop-shadow-sm">
                {cat.designation}
              </h4>
              {cat.description && (
                <p className="mt-1 text-xs text-gray-200 line-clamp-1">
                  {cat.description}
                </p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-300 group-hover:text-brand-200 transition-colors">
                Jouer →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Dots */}
      {categories.length > visibleCount && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: maxStartIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStartIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === startIndex
                  ? "bg-primary-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorieCarouselPlayer;