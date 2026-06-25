import { Metadata } from "next";
import Link from "next/link";
import { ShootingStarIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Compétitions | Genie Quiz",
  description: "Gérez les compétitions sur la plateforme Quiz Genie.",
};

export default function CompetitionsPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShootingStarIcon className="w-14 h-14 text-brand-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
          Compétitions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Gérez les compétitions organisées sur la plateforme. Créez, modifiez
          et suivez les tournois entre les joueurs.
        </p>
        <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white">
          Page en cours de développement
        </span>
      </div>
    </div>
  );
}