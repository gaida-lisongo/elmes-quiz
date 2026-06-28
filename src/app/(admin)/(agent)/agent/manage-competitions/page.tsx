import { Metadata } from "next";
import { getAllCompetitions } from "@/app/actions/competition.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompetitionsPageClient from "./CompetitionsPageClient";

export const metadata: Metadata = {
  title: "Gestion des compétitions",
  description:
    "ELMES-QUIZ — Gérez les compétitions de jeu pour les équipes.",
};

export default async function ManageCompetitionsPage() {
  const result = await getAllCompetitions();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Gestion des compétitions" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-error-500">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const competitions = result.data || [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Gestion des compétitions" />
      <CompetitionsPageClient competitions={competitions} />
    </div>
  );
}