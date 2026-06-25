import { Metadata } from "next";
import RetraitsClient from "./RetraitsClient";

export const metadata: Metadata = {
  title: "Retraits | Genie Quiz",
  description: "Retirez votre solde Mobile Money - Gérez vos retraits.",
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