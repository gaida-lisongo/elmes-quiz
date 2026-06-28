import { Metadata } from "next";
import { getMyEquipe, getMyInvitations } from "@/app/actions/equipe.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EquipeBanner from "@/components/equipe/EquipeBanner";
import ActualitesCarousel from "@/components/equipe/ActualitesCarousel";
import EquipeTabs from "@/components/equipe/EquipeTabs";
import InvitationsList from "@/components/equipe/InvitationsList";
import { ShootingStarIcon } from "@/icons";

export const metadata: Metadata = {
  title: "Compétitions",
  description:
    "ELMES-QUIZ — Découvrez les compétitions à venir et rejoignez une équipe pour y participer.",
};

export default async function CompetitionsPage() {
  const [equipeResult, invitationsResult] = await Promise.all([
    getMyEquipe(),
    getMyInvitations(),
  ]);

  // Erreur serveur
  if (!equipeResult.success) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Compétitions" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-error-500">{equipeResult.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const equipe = equipeResult.data;
  const invitations = invitationsResult.success ? invitationsResult.data || [] : [];

  // Cas 1 : Le joueur a déjà une équipe → dashboard équipe (lecture seule si pas chef/secrétaire)
  if (equipe) {
    const isChef = equipe.isChef;
    const isChefOrSecretaire = equipe.isChef || equipe.isSecretaire;

    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Compétitions" />
        <EquipeBanner equipe={equipe} isChef={isChef} />
        <ActualitesCarousel
          actualites={equipe.actualites}
          equipe={equipe}
          isChefOrSecretaire={isChefOrSecretaire}
        />
        <EquipeTabs equipe={equipe} isChef={isChef} />
      </div>
    );
  }

  // Cas 2 : Pas d'équipe mais des invitations en attente
  if (invitations.length > 0) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Compétitions" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Invitations en attente
          </h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Vous avez {invitations.length} invitation{invitations.length > 1 ? "s" : ""} en attente.
            Choisissez l&apos;équipe que vous souhaitez rejoindre pour participer aux compétitions.
          </p>
          <InvitationsList invitations={invitations} />
        </div>
      </div>
    );
  }

  // Cas 3 : Ni équipe ni invitation → message
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Compétitions" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShootingStarIcon className="w-14 h-14 text-brand-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Compétitions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Pour participer aux compétitions, vous devez faire partie d&apos;une équipe.
            Créez votre propre équipe ou attendez qu&apos;un capitaine vous invite.
          </p>
          <a
            href="/equipe"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Créer mon équipe
          </a>
        </div>
      </div>
    </div>
  );
}