import { Metadata } from "next";
import { getVentesRechargesAction } from "@/app/actions/payment.actions";
import VentesRechargesClient from "./VentesRechargesClient";

interface Props {
  params: Promise<{ slug: string }>;
}

const SLUG_TO_LEVEL: Record<string, number> = {
  elembo: 1,
  motuya: 2,
  elonga: 3,
};

const PACK_NAMES: Record<string, string> = {
  elembo: "ELEMBO",
  motuya: "MOTUYA",
  elonga: "ELONGA",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = PACK_NAMES[slug] ?? slug.toUpperCase();
  return {
    title: `Ventes ${name} | Genie Quiz`,
    description: `Suivez les ventes du pack ${name} sur Quiz Genie.`,
  };
}

export default async function VentesSlugPage({ params }: Props) {
  const { slug } = await params;

  const targetLevel = SLUG_TO_LEVEL[slug];
  const packName = PACK_NAMES[slug] ?? slug.toUpperCase();

  if (!targetLevel) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Pack inconnu
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Le pack &quot;{slug}&quot; n&apos;existe pas. Utilisez elembo, motuya ou elonga.
          </p>
        </div>
      </div>
    );
  }

  // Récupérer les données côté serveur
  const result = await getVentesRechargesAction(targetLevel);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <VentesRechargesClient
        initialData={result.success ? result.data! : null}
        initialError={result.success ? null : result.error || "Erreur de chargement."}
        targetLevel={targetLevel}
        packName={packName}
      />
    </div>
  );
}