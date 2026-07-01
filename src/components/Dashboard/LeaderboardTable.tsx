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
import { addBonusParties } from "@/app/actions/bonus.actions";
import { Gift } from "lucide-react";

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
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData);
  const [searchedEntry, setSearchedEntry] = useState<LeaderboardEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bonusLoading, setBonusLoading] = useState<string | null>(null);
  const [bonusMsg, setBonusMsg] = useState<{ userId: string; text: string } | null>(null);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await getLeaderboard(undefined, undefined, p, 20);
      setEntries(result.top10);
      setTotalPages(result.totalPages);
      setPage(result.currentPage);
    } catch {
      // silence
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchedEntry(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getLeaderboard(searchQuery, undefined, 1, 20);
      setEntries(result.top10);
      setSearchedEntry(result.searchedEntry);
      setTotalPages(result.totalPages);
      setPage(1);
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
    setPage(1);
    await fetchPage(1);
  }, [fetchPage]);

  const handleBonus = useCallback(async (playerUserId: string, pseudo: string) => {
    setBonusLoading(playerUserId);
    setBonusMsg(null);
    try {
      const result = await addBonusParties(playerUserId, 3);
      if (result.success) {
        setBonusMsg({ userId: playerUserId, text: `+3 parties !` });
        // Mettre à jour l'affichage local
        setEntries((prev) =>
          prev.map((e) =>
            e.userId === playerUserId
              ? { ...e, parties: result.newParties ?? e.parties }
              : e
          )
        );
      } else {
        setBonusMsg({ userId: playerUserId, text: result.error || "Erreur" });
      }
    } catch {
      setBonusMsg({ userId: playerUserId, text: "Erreur" });
    } finally {
      setBonusLoading(null);
      setTimeout(() => setBonusMsg(null), 3000);
    }
  }, []);

  const displayEntries = searchedEntry ? [searchedEntry] : entries;

  const BonusCell = (entry: LeaderboardEntry) => {
    if (isPlayer) return null;
    const loadingThis = bonusLoading === entry.userId;
    const msg = bonusMsg?.userId === entry.userId ? bonusMsg.text : null;
    return (
      <TableCell className="py-3">
        <button
          onClick={() => handleBonus(entry.userId, entry.pseudo)}
          disabled={loadingThis}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-theme-xs font-medium text-brand-600 hover:bg-brand-100 disabled:opacity-50 transition-colors dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
          title="Ajouter 3 parties bonus"
        >
          {loadingThis ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent dark:border-brand-400" />
          ) : (
            <Gift className="h-3.5 w-3.5" />
          )}
          {msg || "+3"}
        </button>
      </TableCell>
    );
  };

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
              {!isPlayer && (
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-20">
                  Bonus
                </TableCell>
              )}
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

                  {/* Bonus (agent uniquement) */}
                  {!isPlayer && BonusCell(entry)}
                </TableRow>
              );
            })}

            {displayEntries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isPlayer ? 5 : 7}
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Aucun joueur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (agent uniquement) */}
      {!isPlayer && !searched && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            ← Précédent
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const startPage = Math.max(1, page - 2);
            const p = startPage + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => fetchPage(p)}
                disabled={loading}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-theme-sm font-medium transition-colors ${
                  p === page
                    ? "bg-brand-500 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Info pied de tableau */}
      {!searched && entries.length > 0 && (
        <p className="mt-3 text-center text-theme-xs text-gray-400 dark:text-gray-500">
          {isPlayer
            ? `Affichage des ${entries.length} meilleurs joueurs`
            : `Page ${page} / ${totalPages} — ${entries.length} joueurs`}
        </p>
      )}

      {/* Vue mobile allégée pour le Player (top 5 sans parties restantes/jouées des autres) */}
      {isPlayer && (
        <div className="lg:hidden space-y-3">
          {entries.slice(0, 5).map((entry) => {
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