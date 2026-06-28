'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CompetitionOutput } from '@/app/actions/competition.actions';
import { ShootingStarIcon, GroupIcon, DollarLineIcon, CalenderIcon } from '@/icons';

interface CompetitionCardProps {
  competition: CompetitionOutput;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400',
  INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  COMPLETED: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  COMPLETED: 'Terminée',
};

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const formattedDate = new Date(competition.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Image de la compétition */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {competition.image ? (
          <Image
            src={competition.image}
            alt={competition.designation}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShootingStarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Badge de statut */}
        <div className="absolute right-3 top-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[competition.status]}`}
          >
            {statusLabels[competition.status]}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          {competition.designation}
        </h3>
        {competition.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {competition.description}
          </p>
        )}

        {/* Métriques */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <DollarLineIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cagnotte</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {competition.cagnotte.toLocaleString()} FC
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
              <GroupIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Parties</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {competition.parties}
              </p>
            </div>
          </div>
        </div>

        {/* Catégories */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Catégories
          </p>
          <div className="flex flex-wrap gap-1">
            {competition.categories.length > 0 ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {competition.categories.length} catégorie(s)
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Aucune catégorie
              </span>
            )}
          </div>
        </div>

        {/* Date et actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <CalenderIcon className="h-3 w-3" />
            <span>Créée le {formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/agent/competitions/${competition.slug}`}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
            >
              Voir
            </Link>
            <Link
              href={`/agent/competitions/${competition.slug}/edit`}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Éditer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}