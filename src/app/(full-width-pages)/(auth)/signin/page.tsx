import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "ELMES-QUIZ — Connectez-vous à la plateforme de quiz éducatifs. Apprenez, jouez et gagnez de l'argent chaque weekend lors des compétitions.",
};

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <SignInForm refSlug={ref} />;
}
