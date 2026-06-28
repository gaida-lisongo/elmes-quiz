"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Input from "@/components/form/input/InputField";
import { searchPlayers } from "@/app/actions/equipe.actions";
import type { PlayerSearchResult } from "@/app/actions/equipe.actions";
import { UserCircleIcon, CloseLineIcon } from "@/icons";

interface PlayerSelectProps {
  selected: PlayerSearchResult[];
  onChange: (selected: PlayerSearchResult[]) => void;
  max?: number;
  excludeIds?: string[];
  placeholder?: string;
}

export default function PlayerSelect({
  selected,
  onChange,
  max = 4,
  excludeIds = [],
  placeholder = "Rechercher un joueur...",
}: PlayerSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Utiliser des refs pour éviter de recréer doSearch à chaque render
  const selectedRef = useRef(selected);
  const excludeIdsRef = useRef(excludeIds);
  selectedRef.current = selected;
  excludeIdsRef.current = excludeIds;

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchPlayers(q);
      if (res.success && res.data) {
        const sel = selectedRef.current;
        const excl = excludeIdsRef.current;
        const filtered = res.data.filter(
          (p) =>
            !sel.some((s) => s.playerId === p.playerId) &&
            !excl.includes(p.playerId)
        );
        setResults(filtered);
        setShowDropdown(true);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []); // stable — pas de dépendances

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Nettoyer le debounce au démontage
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = (player: PlayerSearchResult) => {
    if (selected.length >= max) return;
    onChange([...selected, player]);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemove = (playerId: string) => {
    onChange(selected.filter((s) => s.playerId !== playerId));
  };

  const remaining = max - selected.length;

  return (
    <div ref={containerRef} className="relative">
      {/* Input de recherche */}
      <Input
        type="text"
        placeholder={`${placeholder} (${remaining} restant${remaining > 1 ? "s" : ""})`}
        value={query}
        onChange={handleInputChange}
        disabled={selected.length >= max}
        className="w-full"
      />

      {/* Dropdown des résultats */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Recherche...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Aucun joueur trouvé.
            </div>
          )}
          {!loading &&
            results.map((player) => (
              <button
                key={player.playerId}
                type="button"
                onClick={() => handleSelect(player)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.pseudo}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {player.pseudo}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {player.school} · Niv. {player.level}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Liste des joueurs sélectionnés */}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((player) => (
            <span
              key={player.playerId}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
            >
              {player.pseudo}
              <button
                type="button"
                onClick={() => handleRemove(player.playerId)}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-200 dark:hover:bg-brand-500/30 transition-colors"
              >
                <CloseLineIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}