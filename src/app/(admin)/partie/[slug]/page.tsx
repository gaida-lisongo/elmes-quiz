import { Metadata } from "next";
import Link from "next/link";
import connectToDb from "@/app/lib/utils/db";
import Categorie from "@/app/lib/models/Categorie";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Partie - ${slug} | Genie Quiz`,
    description: `Lancez une partie dans la catégorie ${slug}.`,
  };
}

export default async function PartieSlugPage({ params }: Props) {
  const { slug } = await params;

  await connectToDb();
  const cat = await Categorie.findOne({ slug }).lean();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
          Partie — {cat?.designation ?? slug}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Lancez une partie de quiz dans la catégorie <strong>{cat?.designation ?? slug}</strong>.
        </p>
        <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white">
          Page en cours de développement
        </span>
      </div>
    </div>
  );
}