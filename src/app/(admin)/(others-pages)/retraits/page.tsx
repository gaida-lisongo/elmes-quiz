import { Metadata } from "next";
import RetraitsClient from "./RetraitsClient";

export const metadata: Metadata = {
  title: "Retraits",
  description:
    "ELMES-QUIZ — Retirez vos gains par Mobile Money. Transférez l'argent gagné lors des compétitions directement sur votre téléphone.",
};

export default function RetraitsPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <RetraitsClient />
      </div>
    </div>
  );
}