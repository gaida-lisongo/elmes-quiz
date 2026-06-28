"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/app/actions/equipe.actions";
import type { InvitationData, ActualiteData } from "@/app/actions/equipe.actions";
import ArticleReader from "./ArticleReader";
import { GroupIcon, ShootingStarIcon, DollarLineIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon } from "@/icons";

interface InvitationsListProps {
  invitations: InvitationData[];
}

export default function InvitationsList({ invitations }: InvitationsListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [readingActualite, setReadingActualite] = useState<{actualite: ActualiteData, equipeId: string} | null>(null);

  const handleAccept = async (equipeId: string) => {
    setError("");
    setAccepting(equipeId);
    try {
      const result = await acceptInvitation(equipeId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Erreur lors de l'acceptation.");
      }
    } catch {
      setError("Erreur serveur.");
    } finally {
      setAccepting(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleReadActualite = (actualite: ActualiteData, equipeId: string) => {
    setReadingActualite({ actualite, equipeId });
  };

  const handleCloseReader = () => {
    setReadingActualite(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {invitations.map((inv) => {
        const isExpanded = expandedId === inv.equipeId;
        return (
          <div
            key={inv.equipeId}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-white/[0.03]"
          >
            {/* En-tête */}
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {inv.logo ? (
                  <img src={inv.logo} alt={inv.designation} className="h-full w-full object-cover" />
                ) : (
                  <GroupIcon className="h-7 w-7 text-brand-500" />
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  {inv.designation}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Capitaine : {inv.chefPseudo} · {inv.membresCount} membre{inv.membresCount > 1 ? "s" : ""}
                </p>
                {/* Métriques rapides */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    <ShootingStarIcon className="h-3 w-3" />
                    {inv.metriques.competitions} compét.
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
                    <ShootingStarIcon className="h-3 w-3" />
                    {inv.metriques.matchsWin} victoires
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    <DollarLineIcon className="h-3 w-3" />
                    {inv.metriques.soldeUsd} USD
                  </span>
                </div>
              </div>

              {/* Bouton accepter */}
              <button
                type="button"
                onClick={() => handleAccept(inv.equipeId)}
                disabled={accepting === inv.equipeId}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {accepting === inv.equipeId ? "..." : "Rejoindre"}
              </button>
            </div>

            {/* Bouton voir détails */}
            <button
              type="button"
              onClick={() => toggleExpand(inv.equipeId)}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-3.5 w-3.5" /> Masquer les détails
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-3.5 w-3.5" /> Voir les détails
                </>
              )}
            </button>

            {/* Détails expandable */}
            {isExpanded && (
              <div className="mt-3 space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </h4>
                  <div className="space-y-1">
                    {inv.description.map((desc, i) => {
                      const isObjectif = desc.startsWith("Objectif:");
                      const text = isObjectif ? desc.replace("Objectif:", "").trim() : desc;
                      return (
                        <p
                          key={i}
                          className={`text-xs text-gray-500 dark:text-gray-400 ${isObjectif ? "whitespace-pre-wrap" : ""}`}
                        >
                          {isObjectif ? (
                            <>
                              <span className="font-medium text-gray-600 dark:text-gray-300">Objectif :</span>{" "}
                              {text}
                            </>
                          ) : (
                            desc
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>

                {/* Actualités */}
                {inv.actualites.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Dernières actualités ({inv.actualites.length})
                    </h4>
                    
                    {readingActualite && readingActualite.equipeId === inv.equipeId ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleCloseReader}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <ChevronLeftIcon className="h-3 w-3" />
                          Retour aux actualités
                        </button>
                        <ArticleReader
                          actualite={readingActualite.actualite}
                          onClose={handleCloseReader}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                        {inv.actualites.slice(0, 5).map((actu) => (
                          <button
                            key={actu._id}
                            type="button"
                            onClick={() => handleReadActualite(actu, inv.equipeId)}
                            className="relative h-28 w-44 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 text-left"
                          >
                            {actu.image ? (
                              <img src={actu.image} alt={actu.title} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-2">
                              <p className="text-xs font-medium text-white line-clamp-1">{actu.title}</p>
                              {actu.subTitle && (
                                <p className="text-[10px] text-gray-300 line-clamp-1">{actu.subTitle}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}