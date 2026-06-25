"use client";
import React from "react";
import { UserCircleIcon } from "@/icons";

interface AccountBadgeProps {
  pseudo: string;
  role: "PLAYER" | "MOD" | "ADMIN";
  solde?: number;
}

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

const AccountBadge: React.FC<AccountBadgeProps> = ({ pseudo, role, solde }) => {
  return (
    <div className="col-span-12">
      <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-white/[0.03] md:px-6 md:py-5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800">
          <UserCircleIcon className="text-gray-600 size-6 dark:text-gray-300" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {pseudo}
            </p>
            <span
              className={`inline-block mt-0.5 rounded-full px-2.5 py-0.5 text-theme-xs font-medium ${roleColors[role]}`}
            >
              {roleLabels[role] || role}
            </span>
          </div>
          {typeof solde === "number" && (
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
          )}
          {typeof solde === "number" && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Solde:{" "}
              <span className="font-semibold text-gray-800 dark:text-white/90">
                {solde.toLocaleString()} FCFA
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountBadge;