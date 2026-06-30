import { Metadata } from "next";
import { redirect } from "next/navigation";
import connectToDb from "@/app/lib/utils/db";
import Categorie from "@/app/lib/models/Categorie";
import Quiz from "@/app/lib/models/Quiz";
import Player from "@/app/lib/models/Player";
import { getSession } from "@/lib/utils/auth";
import PartieGameClient from "@/components/partie/PartieGameClient";
import type { QuestionClient } from "@/app/actions/partie.actions";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Partie - ${slug}`,
    description: `ELMES-QUIZ — Lancez une partie de quiz dans la catégorie ${slug}. Testez vos connaissances et gagnez des points.`,
  };
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export default async function PartieSlugPage({ params }: Props) {
  const { slug } = await params;

  const session = await getSession();
  if (!session) redirect("/signin");
  if (session.role !== "PLAYER") redirect("/");

  await connectToDb();

  const cat = await Categorie.findOne({ slug, status: true }).lean();
  if (!cat) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Catégorie introuvable
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cette catégorie n&apos;existe pas ou a été désactivée.
          </p>
        </div>
      </div>
    );
  }

  const player = await Player.findOne({ userId: session.userId }).lean();
  const partiesRestantes = player?.parties ?? 0;
  const playerLevel = player?.level ?? 0;

  // ── Tirage des questions côté serveur ──
  const pool = await Quiz.find({
    categorieId: cat._id,
    level: playerLevel,
    status: true,
  }).lean();

  if (pool.length < 3) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            Pas assez de questions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seulement {pool.length} question(s) disponible(s) pour le niveau {playerLevel} dans cette catégorie.
          </p>
        </div>
      </div>
    );
  }

  const selected = pickRandom(pool, 3);

  const questions: QuestionClient[] = selected.map((q) => ({
    quizId: q._id.toString(),
    enonce: q.enonce,
    assertions: q.assertions,
    type: q.type as "QCM" | "VRAI_FAUX",
    assets: q.assets,
  }));

  const quizIds = selected.map((q) => q._id.toString());

  return (
    <PartieGameClient
      categorieId={cat._id.toString()}
      categorieName={cat.designation}
      categorieSlug={slug}
      partiesRestantes={partiesRestantes}
      playerLevel={playerLevel}
      questions={questions}
      quizIds={quizIds}
    />
  );
}