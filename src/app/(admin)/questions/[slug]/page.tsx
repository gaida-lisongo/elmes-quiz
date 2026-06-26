import { Metadata } from "next";
import connectToDb from "@/app/lib/utils/db";
import Categorie from "@/app/lib/models/Categorie";
import { redirect } from "next/navigation";
import QuestionsClient from "./QuestionsClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Questions - ${slug}`,
    description: `ELMES-QUIZ — Gérez les questions de la catégorie ${slug}. Ajoutez, modifiez et organisez vos quiz éducatifs.`,
  };
}

export default async function QuestionsSlugPage({ params }: Props) {
  const { slug } = await params;

  await connectToDb();
  const cat = await Categorie.findOne({ slug }).lean();

  if (!cat) {
    redirect("/");
  }

  return (
    <QuestionsClient
      categorieId={cat._id.toString()}
      designation={cat.designation}
      slug={cat.slug}
    />
  );
}