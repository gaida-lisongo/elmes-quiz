import { Metadata } from "next";
import { getParrainageDataAction } from "@/app/actions/parrainage.actions";
import ReferralBanner from "@/components/parrainage/ReferralBanner";
import FilleulsGrid from "@/components/parrainage/FilleulsGrid";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Parrainage",
  description:
    "ELMES-QUIZ — Parrainez vos amis et gagnez des parties bonus à chaque recharge de vos filleuls. Plus vous parrainez, plus vous gagnez !",
};

export default async function ParrainagePage() {
  const result = await getParrainageDataAction();

  if (!result.success || !result.data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Parrainage
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {result.error || "Une erreur est survenue lors du chargement des données."}
          </p>
        </div>
      </div>
    );
  }

  const { code, referralUrl, qrCodeDataUrl, totalFilleuls, totalPartiesGagnees, filleuls } =
    result.data;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Parrainage" />

      {/* ── Bannière de parrainage (lien + QR code) ── */}
      <ReferralBanner code={code} referralUrl={referralUrl} qrCodeDataUrl={qrCodeDataUrl} />

      {/* ── Contenu principal : métriques + grille des filleuls ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Vos filleuls
        </h3>
        <FilleulsGrid
          filleuls={filleuls}
          totalFilleuls={totalFilleuls}
          totalPartiesGagnees={totalPartiesGagnees}
        />
      </div>
    </div>
  );
}