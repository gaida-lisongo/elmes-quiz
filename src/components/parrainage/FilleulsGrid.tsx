"use client";

import React, { useState, useMemo } from "react";
import FilleulCard from "./FilleulCard";
import type { FilleulData } from "@/app/actions/parrainage.actions";

interface FilleulsGridProps {
  filleuls: FilleulData[];
  totalFilleuls: number;
  totalPartiesGagnees: number;
}

type TabKey = "all" | "actifs" | "inactifs";

export default function FilleulsGrid({ filleuls, totalFilleuls, totalPartiesGagnees }: FilleulsGridProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string; count: number }[] = useMemo(() => {
    const actifs = filleuls.filter((f) => f.rechargesReussies > 0).length;
    const inactifs = filleuls.filter((f) => f.rechargesReussies === 0).length;
    return [
      { key: "all", label: "Tous", count: totalFilleuls },
      { key: "actifs", label: "Actifs", count: actifs },
      { key: "inactifs", label: "Sans recharge", count: inactifs },
    ];
  }, [filleuls, totalFilleuls]);

  const filtered = useMemo(() => {
    let result = filleuls;

    // Filtre par onglet
    if (activeTab === "actifs") {
      result = result.filter((f) => f.rechargesReussies > 0);
    } else if (activeTab === "inactifs") {
      result = result.filter((f) => f.rechargesReussies === 0);
    }

    // Filtre par recherche
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.pseudo.toLowerCase().includes(q) ||
          f.telephone.includes(q) ||
          f.school.toLowerCase().includes(q),
      );
    }

    return result;
  }, [filleuls, activeTab, search]);

  return (
    <div className="space-y-5">
      {/* ── Métriques globales ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total filleuls</p>
          <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {totalFilleuls}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Parties gagnées grâce au parrainage</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            +{totalPartiesGagnees}
          </p>
        </div>
      </div>

      {/* ── Barre de recherche ── */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un filleul par pseudo, téléphone ou école..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pl-10 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ── Grille des filleuls (4 par ligne) ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search.trim()
              ? "Aucun filleul ne correspond à votre recherche."
              : "Vous n'avez pas encore de filleuls. Partagez votre lien de parrainage !"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((f) => (
            <FilleulCard key={f.playerId} filleul={f} />
          ))}
        </div>
      )}
    </div>
  );
}