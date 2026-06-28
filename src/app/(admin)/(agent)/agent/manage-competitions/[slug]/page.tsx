import { Metadata } from "next";
import { getCompetitionBySlug } from "@/app/actions/competition.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CompetitionDetailClient from "./CompetitionDetailClient";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Détails de la compétition",
  description:
    "ELMES-QUIZ — Détails de la compétition, partage QR code et gestion.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CompetitionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getCompetitionBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const competition = result.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle={competition.designation as string}
      />
      <CompetitionDetailClient competition={competition} />
    </div>
  );
}