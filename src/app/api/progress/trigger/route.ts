import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/progress/trigger
 *
 * Webhook appelé après:
 * - Victoire d'un joueur (partie gagnée)
 * - Création d'une équipe
 *
 * Revalide le cache RSC du dashboard pour que la
 * prochaine navigation ait les données fraîches.
 *
 * Sur Vercel serverless, le SSE (polling DB toutes les 5s)
 * rattrape les changements automatiquement.
 */
export async function POST() {
  try {
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/progress/trigger]", err);
    return NextResponse.json({ ok: false, error: "Revalidation failed" }, { status: 500 });
  }
}