'use client';

import React from 'react';
import { AgentData, PERMISSION_LABELS } from '@/types/agent';
import Badge from '@/components/ui/badge/Badge';
import Image from 'next/image';
import Link from 'next/link';

interface AgentCardProps {
  agent: AgentData;
}

const permissionColor = (perm: string) => {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    categories: 'primary',
    parties: 'info',
    recharges: 'success',
    joueurs: 'warning',
  };
  return colors[perm] || 'info';
};

export default function AgentCard({ agent }: AgentCardProps) {
  const user = agent.userId;
  const totalRetraits = agent.retraits.reduce((sum, r) => sum + r.amount, 0);
  const retraitsEnAttente = agent.retraits.filter(r => r.status === 'EN_ATTENTE').length;
  const permissionsCount = agent.permissions.length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* En-tête avec avatar et infos */}
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full">
          {user.photo ? (
            <Image
              src={user.photo}
              alt={user.pseudo}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-100 text-lg font-bold text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">
              {user.pseudo.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-800 dark:text-white/90">
            {user.pseudo}
          </h3>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            {user.telephone}
          </p>
          {user.email && (
            <p className="truncate text-xs text-gray-400 dark:text-gray-500">
              {user.email}
            </p>
          )}
        </div>
        <Badge
          size="sm"
          color={user.role === 'ADMIN' ? 'success' : user.role === 'MOD' ? 'primary' : 'info'}
        >
          {user.role}
        </Badge>
      </div>

      {/* Badges des permissions */}
      {agent.permissions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.permissions.map((perm) => (
            <Badge key={perm} size="sm" color={permissionColor(perm)} variant="light">
              {PERMISSION_LABELS[perm] || perm}
            </Badge>
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Permissions</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {permissionsCount}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Retraits</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {totalRetraits.toLocaleString()} FC
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">En attente</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-800 dark:text-white/90">
            {retraitsEnAttente}
          </p>
        </div>
      </div>

      {/* Bouton Voir détails */}
      <div className="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-white/[0.05]">
        <Link
          href={`/autorisations/${agent._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Voir détails
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 5L15.5 12L8.5 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}