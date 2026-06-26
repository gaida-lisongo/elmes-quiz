import { NextResponse } from "next/server";
import { getProgressData } from "@/app/actions/progress.actions";

/**
 * GET /api/progress
 *
 * Endpoint de polling pour la barre de progression.
 * Appelé toutes les 10 secondes par le composant ProgressBar.
 *
 * Pas besoin d'authentification supplémentaire : getProgressData()
 * lit le cookie de session côté serveur.
 */
export async function GET() {
  try {
    const data = await getProgressData();

    if (!data) {
      return NextResponse.json(
        { error: "Non authentifié ou profil introuvable" },
        { status: 401 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[API /progress] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}