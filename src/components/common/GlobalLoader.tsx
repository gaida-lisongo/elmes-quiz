"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  isLoading,
  message = "Chargement...",
}) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 animate-fadeIn"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Cercle principal avec icône */}
      <div className="relative">
        {/* Anneau externe */}
        <div className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-700" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-500 animate-spin-slow" />

        {/* Anneau intermédiaire */}
        <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-b-success-500 border-l-success-500 animate-spin-reverse" />

        {/* Cœur pulsant */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 animate-pulse-glow">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="mt-6 text-sm font-medium text-gray-700 dark:text-gray-200 animate-pulse">
        {message}
      </p>

      {/* Points de progression */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce-dot [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce-dot [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce-dot [animation-delay:300ms]" />
      </div>
    </div>
  );
};
