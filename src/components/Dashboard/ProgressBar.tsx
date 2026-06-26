"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface ProgressData {
  /** Niveau actuel du joueur (0, 1, 2, 3) */
  level: number;
  /** Rôle de l'utilisateur */
  role: "PLAYER" | "MOD" | "ADMIN";
  /** Score total actuel */
  currentScore: number;
  /** Score cible pour ce palier */
  targetScore: number;
  /** Pourcentage de progression (0-100) */
  progressPercent: number;
  /** Nombre d'équipes sur la plateforme (pour niveau 2+) */
  equipesCount: number;
  /** Cible d'équipes pour débloquer les compétitions */
  equipesTarget: number;
  /** Label affiché sous la barre */
  teaserLabel: string;
  /** Ce que débloque la progression */
  unlockLabel: string;
  /** Icône ou emoji associé */
  icon: string;
}

// ═══════════════════════════════════════════════════════════════
// Constantes
// ═══════════════════════════════════════════════════════════════

const LEVEL_0_TARGET = 75; // 25 parties × 3 pts
const LEVEL_1_TARGET = 90; // pts supplémentaires
const EQUIPES_TARGET = 10;

// ═══════════════════════════════════════════════════════════════
// Composant
// ═══════════════════════════════════════════════════════════════

interface ProgressBarProps {
  /** Données initiales calculées côté serveur */
  initialData: ProgressData;
  /** ID utilisateur pour le SSE */
  userId?: string;
}

export default function ProgressBar({ initialData, userId }: ProgressBarProps) {
  const [data, setData] = useState<ProgressData>(initialData);
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ── Animation de la barre au montage + à chaque update ──
  useEffect(() => {
    // Reset animation state for smooth rerender
    setAnimatedWidth(0);
    const timer = setTimeout(() => {
      setAnimatedWidth(Math.min(100, Math.max(0, data.progressPercent)));
    }, 100);
    return () => clearTimeout(timer);
  }, [data.progressPercent]);

  // ── SSE : EventSource avec auto-reconnect ──
  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const es = new EventSource("/api/progress/events");
      eventSourceRef.current = es;

      es.addEventListener("progress", (event: MessageEvent) => {
        try {
          const fresh: ProgressData = JSON.parse(event.data);
          if (fresh && fresh.level !== undefined) {
            setData(fresh);
          }
        } catch {
          // malformed payload, ignore
        }
      });

      es.addEventListener("heartbeat", () => {
        // keeps connection alive on Vercel, no action needed
      });

      es.addEventListener("error", () => {
        // EventSource auto-reconnects, but if it's a hard close, reconnect manually
        es.close();
        eventSourceRef.current = null;
        setTimeout(connect, 3000);
      });
    };

    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [userId]);

  // ── Reload on the global "progress:refresh" event (fired by triggerProgressRefresh) ──
  const refreshViaSSE = useCallback(() => {
    // Just close & reconnect SSE to get fresh data immediately
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (userId) {
      const es = new EventSource("/api/progress/events");
      eventSourceRef.current = es;
      es.addEventListener("progress", (event: MessageEvent) => {
        try {
          const fresh: ProgressData = JSON.parse(event.data);
          if (fresh && fresh.level !== undefined) setData(fresh);
        } catch { /* ignore */ }
      });
    }
  }, [userId]);

  useEffect(() => {
    const handler = () => refreshViaSSE();
    window.addEventListener("progress:refresh", handler);
    return () => window.removeEventListener("progress:refresh", handler);
  }, [refreshViaSSE]);

  // ── Calculs d'affichage ──
  const clampedPercent = Math.min(100, Math.max(0, data.progressPercent));
  const remaining =
    data.level <= 1
      ? Math.max(0, data.targetScore - data.currentScore)
      : Math.max(0, data.equipesTarget - data.equipesCount);

  // Couleur de la barre selon le niveau
  const barColor =
    data.level === 0
      ? "bg-gradient-to-r from-blue-400 to-blue-600"
      : data.level === 1
        ? "bg-gradient-to-r from-purple-400 to-purple-600"
        : "bg-gradient-to-r from-amber-400 to-amber-600";

  const bgBarColor =
    data.level === 0
      ? "bg-blue-100 dark:bg-blue-500/15"
      : data.level === 1
        ? "bg-purple-100 dark:bg-purple-500/15"
        : "bg-amber-100 dark:bg-amber-500/15";

  const textColor =
    data.level === 0
      ? "text-blue-700 dark:text-blue-400"
      : data.level === 1
        ? "text-purple-700 dark:text-purple-400"
        : "text-amber-700 dark:text-amber-400";

  const iconBg =
    data.level === 0
      ? "bg-blue-50 dark:bg-blue-500/10"
      : data.level === 1
        ? "bg-purple-50 dark:bg-purple-500/10"
        : "bg-amber-50 dark:bg-amber-500/10";

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/40">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg} text-lg`}
        >
          {data.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
            {data.teaserLabel}
          </p>
          <p className={`text-xs font-medium ${textColor}`}>
            {data.unlockLabel}
          </p>
        </div>
        <span className={`text-sm font-bold ${textColor} whitespace-nowrap`}>
          {Math.round(clampedPercent)}%
        </span>
      </div>

      {/* Barre de progression */}
      <div
        className={`w-full h-3 rounded-full overflow-hidden ${bgBarColor}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${animatedWidth}%` }}
        />
      </div>

      {/* Détail restant */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {data.level <= 1
          ? `Encore ${remaining} pts — soit ${Math.ceil(remaining / 3)} parties gagnées`
          : `Encore ${remaining} équipe${remaining > 1 ? "s" : ""} à créer sur la plateforme`}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Fonction utilitaire pour rafraîchir après un événement
// (à appeler après un win ou une création d'équipe)
// ═══════════════════════════════════════════════════════════════

export function triggerProgressRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("progress:refresh"));
  }
}