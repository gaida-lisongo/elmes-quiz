"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getLeaderboard, type LeaderboardEntry } from "@/app/actions/leaderboard.actions";

/* ── Labels & couleurs des 4 niveaux ── */
const LEVEL_META: Record<number, { label: string; color: string }> = {
  0: { label: "Débutant", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  1: { label: "Intermédiaire", color: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  2: { label: "Avancé", color: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400" },
  3: { label: "Expert", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
};

/* ── Props ── */
interface LeaderboardTableProps {
  initialData: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry | null;
  isPlayer?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  initialData,
  currentUserEntry,
  isPlayer = false,
}) => {
  const [top10, setTop10] = useState<LeaderboardEntry[]>(initialData);
  const [searchedEntry, setSearchedEntry] = useState<LeaderboardEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchedEntry(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getLeaderboard(searchQuery);
      setTop10(result.top10);
      setSearchedEntry(result.searchedEntry);
      setSearched(true);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleClear = useCallback(async () => {
    setSearchQuery("");
    setSearchedEntry(null);
    setSearched(false);
    setLoading(true);
    try {
      const result = await getLeaderboard();
      setTop10(result.top10);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, []);

  const displayEntries = searchedEntry ? [searchedEntry] : top10;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            🏆 Leaderboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Classement des meilleurs joueurs
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Rechercher un joueur..."
              className="w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 pl-9 text-theme-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            {loading ? "..." : "Chercher"}
          </button>
          {searched && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Vue Player mobile : résumé du joueur connecté uniquement */}
      {isPlayer && currentUserEntry && (
        <div className="mb-4 lg:hidden rounded-xl border border-brand-200 dark:border-brand-500/20 bg-brand-50 dark:bg-brand-500/10 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Ma position
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                #{currentUserEntry.rank}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentUserEntry.totalScore.toLocaleString("fr-FR")} pts
              </p>
            </div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                LEVEL_META[currentUserEntry.level]?.color ?? LEVEL_META[0].color
              }`}
            >
              {LEVEL_META[currentUserEntry.level]?.label ?? "Débutant"}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="max-w-full overflow-x-auto hidden lg:block">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12">
                #
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Joueur
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Niveau
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Parties
              </TableCell>
              {!isPlayer && (
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Parties Jouées
                </TableCell>
              )}
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Score total
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayEntries.map((entry) => {
              const levelMeta = LEVEL_META[entry.level] ?? LEVEL_META[0];
              return (
                <TableRow key={entry.userId}>
                  {/* Rang */}
                  <TableCell className="py-3 text-theme-sm font-bold text-gray-800 dark:text-white/90">
                    #{entry.rank}
                  </TableCell>

                  {/* Joueur */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        {entry.photo ? (
                          <Image
                            src={entry.photo}
                            alt={entry.pseudo}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {entry.pseudo.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {entry.pseudo}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {entry.telephone}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Niveau */}
                  <TableCell className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${levelMeta.color}`}
                    >
                      {levelMeta.label}
                    </span>
                  </TableCell>

                  {/* Parties restantes */}
                  <TableCell className="py-3 text-theme-sm text-gray-700 dark:text-gray-300">
                    {entry.parties}
                  </TableCell>

                  {/* Parties Jouées (metrics) — masqué pour Player */}
                  {!isPlayer && (
                    <TableCell className="py-3 text-theme-sm text-gray-700 dark:text-gray-300">
                      {entry.partiesJouees}
                    </TableCell>
                  )}

                  {/* Score total */}
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                      {entry.totalScore.toLocaleString()} pts
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}

            {displayEntries.length === 0 && (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucun joueur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info pied de tableau */}
      {!searched && top10.length > 0 && (
        <p className="mt-3 text-center text-theme-xs text-gray-400 dark:text-gray-500">
          Affichage des {top10.length} meilleurs joueurs
        </p>
      )}

      {/* Vue mobile allégée pour le Player (top 5 sans parties restantes/jouées des autres) */}
      {isPlayer && (
        <div className="lg:hidden space-y-3">
          {top10.slice(0, 5).map((entry) => {
            const levelMeta = LEVEL_META[entry.level] ?? LEVEL_META[0];
            return (
              <div
                key={entry.userId}
                className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90 w-6">
                    #{entry.rank}
                  </span>
                  <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    {entry.photo ? (
                      <Image
                        src={entry.photo}
                        alt={entry.pseudo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {entry.pseudo.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                      {entry.pseudo}
                    </p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${levelMeta.color}`}>
                      {levelMeta.label}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                  {entry.totalScore.toLocaleString()} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;