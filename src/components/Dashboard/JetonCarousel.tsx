"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";

interface JetonCardData {
  slug: string;
  name: string;
  image: string;
  description: string;
  price: string;
  games: string;
}

const JETONS: JetonCardData[] = [
  {
    slug: "elembo",
    name: "ELEMBO",
    image: "/images/jetons/elembo.png",
    description:
      "Pack découverte — 15 parties pour débuter l'aventure Quiz Genie.",
    price: "1 000 FC",
    games: "15 parties",
  },
  {
    slug: "motuya",
    name: "MOTUYA",
    image: "/images/jetons/motuya.png",
    description:
      "Pack intermédiaire — 25 parties pour approfondir vos connaissances.",
    price: "1 500 FC",
    games: "25 parties",
  },
  {
    slug: "elonga",
    name: "ELONGA",
    image: "/images/jetons/elonga.png",
    description:
      "Pack expert — 60 parties (dont 10 offertes) pour les champions.",
    price: "3 000 FC",
    games: "60 parties (50+10)",
  },
];

const JetonCarousel: React.FC = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 2;
  const maxStartIndex = Math.max(0, JETONS.length - visibleCount);
  const visible = JETONS.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            💎 Ventes de Jetons
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Suivez les packs de jetons disponibles sur la plateforme
          </p>
        </div>
        {JETONS.length > visibleCount && (
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

      {/* Cards — 2 colonnes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((jeton) => (
          <div
            key={jeton.slug}
            className="flex flex-row rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/[0.02]"
          >
            {/* 1/3 — Image */}
            <div className="relative w-1/3 min-h-[130px] overflow-hidden rounded-lg">
              <Image
                src={jeton.image}
                alt={jeton.name}
                fill
                className="object-contain p-2"
              />
            </div>

            {/* 2/3 — Contenu */}
            <div className="flex flex-col justify-between w-2/3 pl-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white/90">
                  {jeton.name}
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {jeton.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-semibold text-brand-500">
                    {jeton.price}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {jeton.games}
                  </span>
                </div>
              </div>
              <Link
                href={`/ventes/${jeton.slug}`}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              >
                Voir les ventes
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      {JETONS.length > visibleCount && (
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

export default JetonCarousel;