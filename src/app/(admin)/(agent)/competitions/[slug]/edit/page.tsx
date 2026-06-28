import { Metadata } from "next";
import { getCompetitionBySlug } from "@/app/actions/competition.actions";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditCompetitionForm from "./EditCompetitionForm";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Éditer la compétition",
  description:
    "ELMES-QUIZ — Modifier les détails de la compétition.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCompetitionPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getCompetitionBySlug(slug);

  if (!result.success) {
    notFound();
  }

  const competition = result.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb 
        pageTitle={`Éditer : ${competition.designation}`}
        links={[
          { label: "Compétitions", href: "/agent/competitions" },
          { label: competition.designation, href: `/agent/competitions/${slug}` },
          { label: "Éditer", href: `/agent/competitions/${slug}/edit` },
        ]}
      />
      <EditCompetitionForm competition={competition} />
    </div>
  );
}