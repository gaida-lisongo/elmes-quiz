import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "ELMES-QUIZ — Inscrivez-vous gratuitement et recevez 10 parties offertes. Apprenez, jouez et gagnez de l'argent avec vos connaissances.",
};

export default async function SignUp({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  return <SignUpForm refSlug={ref} />;
}
