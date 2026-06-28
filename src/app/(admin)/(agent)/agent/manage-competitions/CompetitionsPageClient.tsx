'use client';

import React, { useState } from 'react';
import CompetitionCard from '@/components/competition/CompetitionCard';
import CreateCompetitionModal from '@/components/competition/CreateCompetitionModal';
import Button from '@/components/ui/button/Button';
import { CompetitionOutput } from '@/app/actions/competition.actions';

interface CompetitionsPageClientProps {
  competitions: CompetitionOutput[];
}

export default function CompetitionsPageClient({ competitions }: CompetitionsPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCompetitions = competitions.filter((comp) =>
    comp.designation.toLowerCase().includes(search.toLowerCase()) ||
    comp.description?.toLowerCase().includes(search.toLowerCase()) ||
    comp.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barre d'outils : recherche + création */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une compétition..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          startIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Nouvelle compétition
        </Button>
      </div>

      {/* Liste des compétitions */}
      {filteredCompetitions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Aucune compétition trouvée
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {search
              ? 'Aucune compétition ne correspond à votre recherche.'
              : 'Commencez par créer votre première compétition.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCompetitions.map((competition) => (
            <CompetitionCard key={competition._id} competition={competition} />
          ))}
        </div>
      )}

      {/* Modal de création */}
      <CreateCompetitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}