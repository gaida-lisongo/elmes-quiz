"use server";

import connectToDb from "@/app/lib/utils/db";
import Player from "@/app/lib/models/Player";
import User from "@/app/lib/models/User";
import { getSession } from "@/lib/utils/auth";
import { generateReferralCode } from "@/app/lib/utils/referral";
import QRCode from "qrcode";
import { headers } from "next/headers";
import type { PipelineStage } from "mongoose";

// ── Types ─────────────────────────────────────────────────────────

export interface FilleulData {
  playerId: string;
  pseudo: string;
  telephone: string;
  school: string;
  level: number;
  rechargesReussies: number;
  partiesRapportees: number;
  derniereRecharge: Date | null;
}

export interface ParrainageData {
  code: string;
  referralUrl: string;
  qrCodeDataUrl: string;
  totalFilleuls: number;
  totalPartiesGagnees: number;
  filleuls: FilleulData[];
}

// ── Génération / Récupération du code de parrainage ─────────────

/**
 * Récupère ou génère le code de parrainage du joueur connecté.
 * Si le joueur n'a pas encore de code, un UUID est généré et sauvegardé.
 * Retourne le code, l'URL de parrainage et le QR code en data URL.
 */
export async function getOrGenerateReferralCodeAction(): Promise<{
  success: boolean;
  data?: { code: string; referralUrl: string; qrCodeDataUrl: string };
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non connecté." };

    await connectToDb();

    const player = await Player.findOne({ userId: session.userId });
    if (!player) return { success: false, error: "Profil joueur introuvable." };

    // Générer un code si absent (format lisible : XX-ABCD)
    if (!player.code || player.code === "") {
      const user = await User.findById(session.userId).select("pseudo");
      player.code = generateReferralCode(user?.pseudo || "XX");
      await player.save();
    }

    // Construire l'URL de parrainage
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const referralUrl = `${protocol}://${host}/signin?ref=${player.code}`;

    // Générer le QR code en data URL
    const qrCodeDataUrl = await QRCode.toDataURL(referralUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return {
      success: true,
      data: { code: player.code, referralUrl, qrCodeDataUrl },
    };
  } catch (error: any) {
    console.error("[getOrGenerateReferralCodeAction]", error);
    return { success: false, error: error.message || "Erreur serveur." };
  }
}

// ── Récupération des filleuls et métriques ───────────────────────

/**
 * Récupère tous les filleuls du joueur connecté avec leurs métriques.
 * Utilise une agrégation MongoDB pour joindre Player → User et calculer
 * le nombre de recharges réussies par filleul.
 */
export async function getParrainageDataAction(): Promise<{
  success: boolean;
  data?: ParrainageData;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non connecté." };

    await connectToDb();

    // 1. Récupérer le joueur connecté
    const player = await Player.findOne({ userId: session.userId });
    if (!player) return { success: false, error: "Profil joueur introuvable." };

    // 2. Générer le code si absent (format lisible : XX-ABCD)
    if (!player.code || player.code === "") {
      const user = await User.findById(session.userId).select("pseudo");
      player.code = generateReferralCode(user?.pseudo || "XX");
      await player.save();
    }

    // 3. Construire l'URL et le QR code
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const referralUrl = `${protocol}://${host}/signup?ref=${player.code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(referralUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // 4. Agrégation pour récupérer les filleuls avec leurs infos
    const pipeline: PipelineStage[] = [
      // Filtrer les joueurs dont le referedBy est le joueur connecté
      { $match: { referedBy: player._id } },
      // Lookup vers User pour récupérer pseudo, telephone
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      // Projection : calculer le nombre de recharges réussies
      {
        $project: {
          _id: 0,
          playerId: { $toString: "$_id" },
          pseudo: { $ifNull: ["$user.pseudo", "Inconnu"] },
          telephone: { $ifNull: ["$user.telephone", "N/A"] },
          school: "$school",
          level: "$level",
          rechargesReussies: {
            $size: {
              $filter: {
                input: "$recharges",
                as: "r",
                cond: { $eq: ["$$r.status", "SUCCES"] },
              },
            },
          },
          derniereRecharge: {
            $cond: {
              if: { $gt: [{ $size: "$recharges" }, 0] },
              then: { $max: "$recharges.createdAt" },
              else: null,
            },
          },
        },
      },
      // Trier par date de dernière recharge décroissante
      { $sort: { derniereRecharge: -1 as const } },
    ];

    const filleulsRaw = await Player.aggregate(pipeline);

    // Transformer : chaque recharge réussie = +3 parties pour le parrain
    const filleuls: FilleulData[] = filleulsRaw.map((f) => ({
      playerId: f.playerId,
      pseudo: f.pseudo,
      telephone: f.telephone,
      school: f.school,
      level: f.level,
      rechargesReussies: f.rechargesReussies || 0,
      partiesRapportees: (f.rechargesReussies || 0) * 3,
      derniereRecharge: f.derniereRecharge || null,
    }));

    // Calculer les métriques globales
    const totalFilleuls = filleuls.length;
    const totalPartiesGagnees = filleuls.reduce((sum, f) => sum + f.partiesRapportees, 0);

    return {
      success: true,
      data: {
        code: player.code,
        referralUrl,
        qrCodeDataUrl,
        totalFilleuls,
        totalPartiesGagnees,
        filleuls,
      },
    };
  } catch (error: any) {
    console.error("[getParrainageDataAction]", error);
    return { success: false, error: error.message || "Erreur serveur." };
  }
}

// ── Vérification d'un code de parrainage ─────────────────────────

/**
 * Vérifie si un code de parrainage existe et retourne le pseudo du parrain.
 * Utilisé côté serveur pour valider le paramètre `ref` dans l'URL d'inscription.
 */
export async function verifyReferralCodeAction(code: string): Promise<{
  success: boolean;
  data?: { parrainPseudo: string; parrainPlayerId: string };
  error?: string;
}> {
  try {
    if (!code || code.trim() === "") {
      return { success: false, error: "Code de parrainage invalide." };
    }

    await connectToDb();

    const parrain = await Player.findOne({ code: code.trim() }).populate<{ userId: { pseudo: string } }>({
      path: "userId",
      select: "pseudo",
    });

    if (!parrain) {
      return { success: false, error: "Code de parrainage introuvable." };
    }

    const userDoc = parrain.userId as unknown as { pseudo: string } | null;

    return {
      success: true,
      data: {
        parrainPseudo: userDoc?.pseudo || "Inconnu",
        parrainPlayerId: parrain._id.toString(),
      },
    };
  } catch (error: any) {
    console.error("[verifyReferralCodeAction]", error);
    return { success: false, error: error.message || "Erreur serveur." };
  }
}