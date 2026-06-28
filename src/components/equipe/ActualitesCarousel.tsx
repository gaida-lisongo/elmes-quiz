"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ActualiteCard from "./ActualiteCard";
import AddActualiteModal from "./AddActualiteModal";
import EditActualiteModal from "./EditActualiteModal";
import ArticleReader from "./ArticleReader";
import { deleteActualite } from "@/app/actions/equipe.actions";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import type { ActualiteData, EquipeData } from "@/app/actions/equipe.actions";

interface ActualitesCarouselProps {
  actualites: ActualiteData[];
  equipe: EquipeData;
  isChefOrSecretaire: boolean;
}

export default function ActualitesCarousel({
  actualites,
  equipe,
  isChefOrSecretaire,
}: ActualitesCarouselProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingActualite, setEditingActualite] = useState<ActualiteData | null>(null);
  const [readingActualite, setReadingActualite] = useState<ActualiteData | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [actualites]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleDelete = async (actualiteId: string) => {
    if (!confirm("Supprimer cette actualité ? Cette action est irréversible.")) return;
    const result = await deleteActualite(actualiteId);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Actualités de l&apos;équipe
          </h3>
          <div className="flex items-center gap-2">
            {isChefOrSecretaire && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Ajouter
              </button>
            )}
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carrousel horizontal */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {actualites.length === 0 && (
            <div className="flex w-full items-center justify-center py-12 text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune actualité pour le moment.
                </p>
                {isChefOrSecretaire && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Publier la première actualité
                  </button>
                )}
              </div>
            </div>
          )}
          {actualites.map((actu) => (
            <ActualiteCard
              key={actu._id}
              actualite={actu}
              showActions={isChefOrSecretaire}
              onEdit={setEditingActualite}
              onDelete={handleDelete}
              onRead={setReadingActualite}
            />
          ))}
        </div>
      </div>

      {/* Modal d'ajout d'actualité */}
      {showAddModal && (
        <AddActualiteModal
          equipeId={equipe._id}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal d'édition d'actualité */}
      {editingActualite && (
        <EditActualiteModal
          actualite={editingActualite}
          onClose={() => setEditingActualite(null)}
        />
      )}

      {/* Lecteur d'article (rendu conditionnel) */}
      {readingActualite && (
        <div className="mt-6">
          <ArticleReader
            actualite={readingActualite}
            onClose={() => setReadingActualite(null)}
          />
        </div>
      )}
    </>
  );
}