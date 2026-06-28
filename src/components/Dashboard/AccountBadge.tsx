"use client";
import React from "react";
import Link from "next/link";
import { UserCircleIcon, ShootingStarIcon } from "@/icons";

interface AccountBadgeProps {
  pseudo: string;
  role: "PLAYER" | "MOD" | "ADMIN";
  solde?: number;
  level?: number;
  equipesCount?: number;
  /** Barre de progression teaser (optionnelle) */
  progressComponent?: React.ReactNode;
}

const LEVEL_LABELS: Record<number, string> = {
  0: "Débutant",
  1: "Intermédiaire",
  2: "Avancé",
  3: "Expert",
};

const LEVEL_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  1: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  2: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  3: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

const roleLabels: Record<string, string> = {
  PLAYER: "Élève",
  MOD: "Modérateur",
  ADMIN: "Administrateur",
};

const roleColors: Record<string, string> = {
  PLAYER: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  MOD: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  ADMIN: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

/** Détermine les actions disponibles selon le rôle et le niveau */
function getActions(
  role: string,
  level?: number
): { label: string; href: string; icon?: React.ReactNode }[] {
  if (role === "MOD") {
    return [
      {
        label: "Compétitions",
        href: "/agent/competitions",
        icon: <ShootingStarIcon className="w-4 h-4" />,
      },
    ];
  }
  if (role === "ADMIN") {
    return [
      {
        label: "Enrollements",
        href: "/enrollements",
        icon: <ShootingStarIcon className="w-4 h-4" />,
      },
    ];
  }
  if (role === "PLAYER") {
    if (level === 1) {
      return [{ label: "Parrainage", href: "/parrainage" }];
    }
    if (level === 2) {
      return [{ label: "Mes compétitions", href: "/competitions" }];
    }
    if (level === 3) {
      return [{ label: "Équipes", href: "/equipe" }];
    }
  }
  return [];
}

const AccountBadge: React.FC<AccountBadgeProps> = ({
  pseudo,
  role,
  solde,
  level,
  equipesCount,
  progressComponent,
}) => {
  const showLevel = role === "PLAYER" && level !== undefined;
  const badgeLabel = showLevel
    ? LEVEL_LABELS[level] ?? "Débutant"
    : roleLabels[role] || role;
  const badgeColor = showLevel
    ? LEVEL_COLORS[level] ?? LEVEL_COLORS[0]
    : roleColors[role];

  const actions = getActions(role, level);

  return (
    <div className="col-span-12">
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03] md:px-6 md:py-5">
        {/* Gauche : avatar + identité */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800">
            <UserCircleIcon className="text-gray-600 size-6 dark:text-gray-300" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {pseudo}
              </p>
              <span
                className={`inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${badgeColor}`}
              >
                {badgeLabel}
              </span>
            </div>
            {/* Agents → nombre d'équipes */}
            {(role === "MOD" || role === "ADMIN") && typeof equipesCount === "number" && (
              <>
                <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Équipes:{" "}
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {equipesCount}
                  </span>
                </p>
              </>
            )}
            {/* Joueur → solde */}
            {role === "PLAYER" && typeof solde === "number" && (
              <>
                <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Solde:{" "}
                  <span className="font-semibold text-gray-800 dark:text-white/90">
                    {solde.toLocaleString()} FC
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Droite : boutons d'action */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
              >
                {action.icon}
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Barre de progression teaser */}
      {progressComponent && (
        <div className="mt-0">{progressComponent}</div>
      )}
    </div>
  );
};

export default AccountBadge;