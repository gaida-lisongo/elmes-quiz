import { Metadata } from "next";
import { ShootingStarIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Équipes | Genie Quiz",
  description: "Gérez vos équipes et participez aux compétitions.",
};

export default function EquipesPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShootingStarIcon className="w-14 h-14 text-brand-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
          Équipes
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Rejoignez ou créez une équipe pour participer aux compétitions
          et défier les autres joueurs.
        </p>
        <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white">
          Page en cours de développement
        </span>
      </div>
    </div>
  );
}