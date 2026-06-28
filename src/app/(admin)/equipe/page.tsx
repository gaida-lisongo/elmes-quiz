import { Metadata } from "next";
import { getMyEquipe } from "@/app/actions/equipe.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CreateEquipeForm from "@/components/equipe/CreateEquipeForm";
import EquipeBanner from "@/components/equipe/EquipeBanner";
import ActualitesCarousel from "@/components/equipe/ActualitesCarousel";
import EquipeTabs from "@/components/equipe/EquipeTabs";

export const metadata: Metadata = {
  title: "Mon Équipe",
  description:
    "ELMES-QUIZ — Gérez votre équipe, publiez des actualités et participez aux compétitions.",
};

export default async function EquipePage() {
  const result = await getMyEquipe();

  // Erreur serveur
  if (!result.success) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Mon Équipe" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-error-500">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const equipe = result.data;

  // Pas d'équipe → formulaire de création
  if (!equipe) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Mon Équipe" />
        <CreateEquipeForm />
      </div>
    );
  }

  // Équipe existante → dashboard équipe
  const isChef = equipe.isChef;
  const isChefOrSecretaire = equipe.isChef || equipe.isSecretaire;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Mon Équipe" />

      {/* Bannière */}
      <EquipeBanner equipe={equipe} />

      {/* Carrousel d'actualités */}
      <ActualitesCarousel
        actualites={equipe.actualites}
        equipe={equipe}
        isChefOrSecretaire={isChefOrSecretaire}
      />

      {/* Tabs : Membres / Compétitions */}
      <EquipeTabs equipe={equipe} isChef={isChef} />
    </div>
  );
}