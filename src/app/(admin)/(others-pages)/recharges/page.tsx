import { Metadata } from "next";
import RechargesClient from "./RechargesClient";

export const metadata: Metadata = {
  title: "Recharges | Genie Quiz",
  description: "Page de rechargement Mobile Money - Créditez votre solde et débloquez des niveux.",
};

export default function RechargesPage() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <RechargesClient />
      </div>
    </div>
  );
}