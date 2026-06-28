import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCompetitionBySlug } from "@/app/actions/competition.actions";
import { getEnrollementAmount } from "@/app/actions/enrollement.actions";
import { getSession } from "@/lib/utils/auth";
import { getMyEquipe } from "@/app/actions/equipe.actions";
import CompetitionEnrollmentClient from "./CompetitionEnrollmentClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicCompetitionBySlug(slug);
  const competition = result.success ? result.data : undefined;

  return {
    title: competition ? competition.designation : "Compétition",
    description: competition?.description || "ELMES-QUIZ — Inscrivez votre équipe à cette compétition.",
  };
}

export default async function CompetitionEnrollmentPage({ params }: PageProps) {
  const { slug } = await params;
  const [competitionResult, amountResult, session, equipeResult] = await Promise.all([
    getPublicCompetitionBySlug(slug),
    getEnrollementAmount(),
    getSession(),
    getMyEquipe(),
  ]);

  if (!competitionResult.success || !competitionResult.data) {
    notFound();
  }

  const competition = competitionResult.data;
  const enrollementAmount = amountResult.success ? amountResult.amount : 13500;
  const isAuthenticated = !!session && session.role === "PLAYER";
  const equipe = equipeResult.success ? (equipeResult.data ?? null) : null;

  return (
    <CompetitionEnrollmentClient
      competition={competition}
      enrollementAmount={enrollementAmount}
      isAuthenticated={isAuthenticated}
      equipe={equipe}
    />
  );
}
