"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";

export interface CarouselCardItem {
  id: string | number;
  image: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: "success" | "warning" | "error" | "primary" | "info";
}

interface CarouselCardsProps {
  title?: string;
  cards: CarouselCardItem[];
  visibleCount?: number;
}

const CarouselCards: React.FC<CarouselCardsProps> = ({
  title = "Highlights",
  cards,
  visibleCount = 3,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const maxStartIndex = Math.max(0, cards.length - visibleCount);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const visibleCards = cards.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {cards.length > visibleCount && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={startIndex === 0}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex >= maxStartIndex}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.02]"
          >
            {/* Image */}
            <div className="relative w-full h-36 overflow-hidden rounded-lg mb-3">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {card.title}
                </h4>
                {card.badge && (
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                      card.badgeColor === "success"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                        : card.badgeColor === "warning"
                        ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500"
                        : card.badgeColor === "error"
                        ? "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                        : "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-500"
                    }`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {cards.length > visibleCount && (
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

export default CarouselCards;