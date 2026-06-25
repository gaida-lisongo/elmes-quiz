"use server";

import connectToDb from "@/app/lib/utils/db";
import Player from "@/app/lib/models/Player";
import Agent from "@/app/lib/models/Agent";
import User from "@/app/lib/models/User";
import { getSession } from "@/lib/utils/auth";
import {
  initiateCollection,
  initiatePayout,
  checkStatus,
} from "@/services/payment.service";

// ── Recharge Joueur ────────────────────────────────────────────────

/**
 * Initie une collecte Mobile Money pour un joueur et enregistre la recharge
 * dans son document Player avec le statut EN_ATTENTE.
 *
 * @param playerId - ID MongoDB du document Player
 * @param phone    - Numéro Mobile Money du joueur (format international, ex: 243XXXXXXXXX)
 * @param targetLevel - Niveau visé (1 | 2 | 3)
 * @param amount   - Montant en CDF
 */
export async function rechargePlayerAction(
  playerId: string,
  phone: string,
  targetLevel: number,
  amount: number,
) {
  try {
    if (!playerId || !phone || !amount || !targetLevel) {
      return {
        success: false,
        error: "Tous les champs sont obligatoires : joueur, téléphone, montant et niveau.",
      };
    }

    if (![1, 2, 3].includes(targetLevel)) {
      return {
        success: false,
        error: "Le niveau cible doit être 1, 2 ou 3.",
      };
    }

    await connectToDb();

    // 1. Vérifier que le joueur existe
    const player = await Player.findById(playerId);
    if (!player) {
      return { success: false, error: "Joueur introuvable." };
    }

    // 2. Générer une référence unique locale
    const reference = `REQ-REC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 3. Initier la collecte via FlexPay
    const collection = await initiateCollection({
      phone,
      amount,
      reference,
    });

    console.log("Recharge Response :", collection)

    if (!collection.success || !collection.orderNumber) {
      return {
        success: false,
        error: collection.error || "Échec de l'initiation de la collecte.",
        providerMessage: collection.message,
      };
    }

    const orderNumber = collection.orderNumber;

    // 4. Enregistrer le sous-document de recharge dans Player
    player.recharges.push({
      amount,
      providerTxId: orderNumber,
      status: "EN_ATTENTE",
      targetLevel,
      createdAt: new Date(),
    });

    await player.save();

    return {
      success: true,
      orderNumber,
      message: "Collecte initiée. En attente de confirmation.",
    };
  } catch (error: any) {
    console.error("[rechargePlayerAction]", error);
    return {
      success: false,
      error: error.message || "Erreur serveur lors de la recharge.",
    };
  }
}

// ── Vérifier le statut d'une recharge ──────────────────────────────

/**
 * Vérifie le statut d'une recharge auprès du microservice.
 * Si le statut est SUCCES, crédite le solde de l'utilisateur.
 *
 * @param playerId   - ID MongoDB du document Player
 * @param rechargeIndex - Index de la recharge dans le tableau recharges[]
 */
export async function checkRechargeStatusAction(
  playerId: string,
  rechargeIndex: number,
) {
  try {
    await connectToDb();

    const player = await Player.findById(playerId);
    if (!player) {
      return { success: false, error: "Joueur introuvable." };
    }

    const recharge = player.recharges[rechargeIndex];
    if (!recharge) {
      return { success: false, error: "Recharge introuvable." };
    }

    if (recharge.status !== "EN_ATTENTE") {
      return {
        success: true,
        status: recharge.status,
        message: "Cette recharge a déjà été traitée.",
      };
    }

    // Appeler le microservice
    const statusCheck = await checkStatus(recharge.providerTxId);
    console.log("[Checking Recharge]", statusCheck)
    if (!statusCheck.success) {
      return {
        success: false,
        error: statusCheck.error || "Impossible de vérifier le statut.",
      };
    }

    const newStatus = statusCheck.status || "ECHEC";

    // Mettre à jour le statut local dans le sous-document
    player.recharges[rechargeIndex].status = newStatus;

    // Si la collecte est confirmée → créditer les parties du joueur
    if (newStatus === "SUCCES") {
      // Montant / 200 = nombre de parties gagnées
      let partiesGagnees = Math.floor(recharge.amount / 200);
      // ELONGA (targetLevel 3) : 50 parties + 10 de bonus = 60 parties
      if (recharge.targetLevel === 3) {
        partiesGagnees += 10;
      }
      player.parties += partiesGagnees;
    }

    await player.save();

    return {
      success: true,
      status: newStatus,
      message:
        newStatus === "SUCCES"
          ? `Paiement confirmé ! ${recharge.amount} FC crédités sur votre solde.`
          : newStatus === "ECHEC"
          ? "Le paiement a échoué."
          : "Toujours en attente.",
    };
  } catch (error: any) {
    console.error("[checkRechargeStatusAction]", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la vérification.",
    };
  }
}

// ── Récupérer les recharges du joueur connecté ────────────────────

/**
 * Retourne la liste des recharges du joueur connecté avec les infos utilisateur.
 */
export async function getMyRechargesAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non connecté." };
    }

    await connectToDb();

    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "Utilisateur introuvable." };
    }

    const player = await Player.findOne({ userId: session.userId });
    if (!player) {
      return { success: false, error: "Profil joueur introuvable." };
    }

    return {
      success: true,
      data: {
        playerId: player._id.toString(),
        userId: user._id.toString(),
        telephone: user.telephone,
        pseudo: user.pseudo,
        solde: user.solde,
        parties: player.parties,
        level: player.level,
        recharges: player.recharges.map((r, index) => ({
          index,
          amount: r.amount,
          providerTxId: r.providerTxId,
          status: r.status,
          targetLevel: r.targetLevel,
          createdAt: r.createdAt,
        })),
      },
    };
  } catch (error: any) {
    console.error("[getMyRechargesAction]", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération.",
    };
  }
}

// ── Retrait Agent ──────────────────────────────────────────────────

/**
 * Initie un paiement Mobile Money vers un agent et enregistre le retrait
 * dans son document Agent avec le statut EN_ATTENTE.
 *
 * @param agentId - ID MongoDB du document Agent
 * @param phone   - Numéro Mobile Money de l'agent (format international)
 * @param amount  - Montant à retirer en CDF
 */
export async function payoutAgentAction(
  agentId: string,
  phone: string,
  amount: number,
) {
  try {
    if (!agentId || !phone || !amount) {
      return {
        success: false,
        error: "Tous les champs sont obligatoires : agent, téléphone et montant.",
      };
    }

    await connectToDb();

    // 1. Vérifier que l'agent existe
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return { success: false, error: "Agent introuvable." };
    }

    // 2. Générer une référence unique locale
    const reference = `REQ-OUT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 3. Initier le paiement via FlexPay
    const payout = await initiatePayout({
      phone,
      amount,
      reference,
    });

    if (!payout.success || !payout.orderNumber) {
      return {
        success: false,
        error: payout.error || "Échec de l'initiation du paiement.",
        providerMessage: payout.message,
      };
    }

    const orderNumber = payout.orderNumber;

    // 4. Enregistrer le sous-document de retrait dans Agent
    agent.retraits.push({
      amount,
      providerTxId: orderNumber,
      status: "EN_ATTENTE",
      createdAt: new Date(),
    });

    await agent.save();

    return {
      success: true,
      orderNumber,
      message: "Paiement initié. En attente de confirmation.",
    };
  } catch (error: any) {
    console.error("[payoutAgentAction]", error);
    return {
      success: false,
      error: error.message || "Erreur serveur lors du retrait.",
    };
  }
}

// ── Retrait partagé (Player / Agent) ─────────────────────────────

/**
 * Initie un retrait Mobile Money.
 * - Joueur : déduit son solde User après confirmation
 * - Agent  : enregistre dans Agent.retraits[] (commission)
 */
export async function requestRetraitAction(phone: string, amount: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non connecté." };

    if (!phone || !amount || amount <= 0) {
      return { success: false, error: "Téléphone et montant requis." };
    }

    await connectToDb();
    const user = await User.findById(session.userId);
    if (!user) return { success: false, error: "Utilisateur introuvable." };

    // Vérifier le solde
    if (user.solde < amount) {
      return { success: false, error: "Solde insuffisant." };
    }

    const reference = `WTH-${user.role}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const payout = await initiatePayout({ phone, amount, reference });
    if (!payout.success || !payout.orderNumber) {
      return { success: false, error: payout.error || "Échec de l'initiation du retrait." };
    }

    // Enregistrer selon le rôle
    if (user.role === 'PLAYER') {
      const player = await Player.findOne({ userId: session.userId });
      if (!player) return { success: false, error: "Profil joueur introuvable." };
      player.retraits.push({
        amount,
        providerTxId: payout.orderNumber,
        status: "EN_ATTENTE",
        createdAt: new Date(),
      });
      await player.save();
    } else {
      const agent = await Agent.findOne({ userId: session.userId });
      if (!agent) return { success: false, error: "Profil agent introuvable." };
      agent.retraits.push({
        amount,
        providerTxId: payout.orderNumber,
        status: "EN_ATTENTE",
        createdAt: new Date(),
      });
      await agent.save();
    }

    return { success: true, orderNumber: payout.orderNumber, message: "Retrait initié. En attente de confirmation." };
  } catch (error: any) {
    console.error("[requestRetraitAction]", error);
    return { success: false, error: error.message || "Erreur serveur." };
  }
}

/**
 * Vérifie le statut d'un retrait.
 * Si SUCCES → réduit le solde User.
 */
export async function checkRetraitStatusAction(retraitIndex: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non connecté." };

    await connectToDb();

    let retraitDoc: { amount: number; providerTxId: string; status: string; createdAt: Date } | null = null;

    if (session.role === 'PLAYER') {
      const player = await Player.findOne({ userId: session.userId });
      if (!player) return { success: false, error: "Joueur introuvable." };
      const retraits = player.retraits || [];
      const r = retraits[retraitIndex];
      if (!r) return { success: false, error: "Retrait introuvable." };
      if (r.status !== "EN_ATTENTE") return { success: true, status: r.status, message: "Déjà traité." };

      const statusCheck = await checkStatus(r.providerTxId);
      if (!statusCheck.success) return { success: false, error: statusCheck.error || "Impossible de vérifier." };

      const newStatus = statusCheck.status || "ECHEC";
      player.retraits[retraitIndex].status = newStatus;

      if (newStatus === "SUCCES") {
        const user = await User.findById(session.userId);
        if (user) { user.solde = Math.max(0, user.solde - r.amount); await user.save(); }
      }
      await player.save();
      retraitDoc = player.retraits[retraitIndex];
    } else {
      const agent = await Agent.findOne({ userId: session.userId });
      if (!agent) return { success: false, error: "Agent introuvable." };
      const retraits = agent.retraits || [];
      const r = retraits[retraitIndex];
      if (!r) return { success: false, error: "Retrait introuvable." };
      if (r.status !== "EN_ATTENTE") return { success: true, status: r.status, message: "Déjà traité." };

      const statusCheck = await checkStatus(r.providerTxId);
      if (!statusCheck.success) return { success: false, error: statusCheck.error || "Impossible de vérifier." };

      const newStatus = statusCheck.status || "ECHEC";
      agent.retraits[retraitIndex].status = newStatus;

      if (newStatus === "SUCCES") {
        const user = await User.findById(session.userId);
        if (user) { user.solde = Math.max(0, user.solde - r.amount); await user.save(); }
      }
      await agent.save();
      retraitDoc = agent.retraits[retraitIndex];
    }

    return {
      success: true,
      status: retraitDoc?.status,
      message: retraitDoc?.status === "SUCCES"
        ? `Retrait confirmé ! ${(retraitDoc?.amount || 0).toLocaleString("fr-FR")} FC déduits.`
        : retraitDoc?.status === "ECHEC" ? "Le retrait a échoué." : "En attente.",
    };
  } catch (error: any) {
    console.error("[checkRetraitStatusAction]", error);
    return { success: false, error: error.message || "Erreur." };
  }
}

/**
 * Récupère les infos + historique des retraits (Player ou Agent).
 */
export async function getMyRetraitsAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Non connecté." };

    await connectToDb();
    const user = await User.findById(session.userId);
    if (!user) return { success: false, error: "Utilisateur introuvable." };

    let retraits: any[] = [];

    if (session.role === 'PLAYER') {
      const player = await Player.findOne({ userId: session.userId });
      if (player) {
        retraits = (player.retraits || []).map((r, i) => ({ index: i, amount: r.amount, providerTxId: r.providerTxId, status: r.status, createdAt: r.createdAt }));
      }
    } else {
      const agent = await Agent.findOne({ userId: session.userId });
      if (agent) {
        retraits = (agent.retraits || []).map((r, i) => ({ index: i, amount: r.amount, providerTxId: r.providerTxId, status: r.status, createdAt: r.createdAt }));
      }
    }

    return { success: true, data: { solde: user.solde, pseudo: user.pseudo, telephone: user.telephone, role: user.role, retraits } };
  } catch (error: any) {
    console.error("[getMyRetraitsAction]", error);
    return { success: false, error: error.message || "Erreur." };
  }
}