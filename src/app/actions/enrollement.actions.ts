'use server';

import connectToDb from '@/app/lib/utils/db';
import Enrollement from '@/app/lib/models/Enrollement';
import Competition from '@/app/lib/models/Competition';
import Equipe from '@/app/lib/models/Equipe';
import Player from '@/app/lib/models/Player';
import User from '@/app/lib/models/User';
import { getSession } from '@/lib/utils/auth';
import { initiateCollection, checkStatus } from '@/services/payment.service';

const ENROLEMENT_AMOUNT = Number(process.env.ENROLEMENT_AMOUNT) || 13500;

function generateOrderNumber(): string {
  return `ENR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function getPlayerId(userId: string): Promise<string | null> {
  const player = await Player.findOne({ userId }).select('_id').lean();
  return player ? player._id.toString() : null;
}

/**
 * Récupère le montant d'inscription aux compétitions.
 */
export async function getEnrollementAmount(): Promise<{ success: boolean; amount: number }> {
  return { success: true, amount: ENROLEMENT_AMOUNT };
}

/**
 * Initie l'inscription d'une équipe à une compétition.
 * - Vérifie que l'utilisateur est connecté et est un joueur.
 * - Vérifie que le joueur est chef d'une équipe.
 * - Vérifie que l'équipe n'est pas déjà inscrite.
 * - Initie le paiement Mobile Money via FlexPay.
 * - Crée un Enrollement en statut PENDING avec une transaction PENDING.
 */
export async function initiateEnrollementAction(competitionId: string, phone: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };
    if (session.role !== 'PLAYER') return { success: false, error: 'Seuls les joueurs peuvent inscrire une équipe.' };

    if (!competitionId || !phone) {
      return { success: false, error: 'Compétition et téléphone requis.' };
    }

    await connectToDb();

    const playerId = await getPlayerId(session.userId);
    if (!playerId) return { success: false, error: 'Profil joueur introuvable.' };

    const user = await User.findById(session.userId).lean();
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    const competition = await Competition.findById(competitionId).lean();
    if (!competition) return { success: false, error: 'Compétition introuvable.' };
    if (competition.status !== 'ACTIVE') {
      return { success: false, error: 'Cette compétition n\'est pas ouverte aux inscriptions.' };
    }

    const equipe = await Equipe.findOne({ chefId: playerId }).lean();
    if (!equipe) {
      return { success: false, error: 'Vous devez être chef d\'une équipe pour inscrire votre équipe.' };
    }

    const existing = await Enrollement.findOne({ equipeId: equipe._id, competitionId: competition._id }).lean();
    if (existing) {
      return { success: false, error: 'Votre équipe est déjà inscrite à cette compétition.' };
    }

    const orderNumber = generateOrderNumber();
    const reference = `ENR-REF-${Date.now()}`;

    const collection = await initiateCollection({
      phone,
      amount: ENROLEMENT_AMOUNT,
      reference,
    });

    if (!collection.success || !collection.orderNumber) {
      return { success: false, error: collection.error || 'Échec de l\'initiation du paiement.' };
    }

    const enrollement = await Enrollement.create({
      equipeId: equipe._id,
      competitionId: competition._id,
      orderNumber,
      status: 'PENDING',
      parties: 0,
      transactions: [
        {
          membre: playerId,
          montant: ENROLEMENT_AMOUNT,
          status: 'PENDING',
          orderNumber: collection.orderNumber,
          phone,
          createdAt: new Date(),
        },
      ],
    });

    return {
      success: true,
      enrollementId: enrollement._id.toString(),
      orderNumber: collection.orderNumber,
      message: 'Paiement initié. Veuillez valider la transaction sur votre téléphone.',
    };
  } catch (error: any) {
    console.error('[initiateEnrollementAction]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

/**
 * Vérifie le statut du paiement d'une inscription.
 * Si le paiement est confirmé, passe l'inscription en CONFIRMED.
 */
export async function checkEnrollementStatusAction(enrollementId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const enrollement = await Enrollement.findById(enrollementId);
    if (!enrollement) return { success: false, error: 'Inscription introuvable.' };

    const transaction = enrollement.transactions[enrollement.transactions.length - 1];
    if (!transaction) return { success: false, error: 'Aucune transaction trouvée.' };

    if (transaction.status !== 'PENDING') {
      return {
        success: true,
        status: transaction.status === 'PAID' ? 'CONFIRMED' : enrollement.status,
        message: 'Cette transaction a déjà été traitée.',
      };
    }

    const statusCheck = await checkStatus(transaction.orderNumber);
    if (!statusCheck.success) {
      return { success: false, error: statusCheck.error || 'Impossible de vérifier le statut.' };
    }

    const mappedStatus = statusCheck.status === 'SUCCES' ? 'PAID' : statusCheck.status === 'ECHEC' ? 'FAILED' : 'PENDING';
    transaction.status = mappedStatus;

    if (mappedStatus === 'PAID') {
      enrollement.status = 'CONFIRMED';
      await Equipe.findByIdAndUpdate(enrollement.equipeId, {
        $inc: { 'metriques.competitions': 1 },
      });
    }

    await enrollement.save();

    return {
      success: true,
      status: enrollement.status,
      message: mappedStatus === 'PAID'
        ? 'Paiement confirmé ! Votre équipe est inscrite.'
        : mappedStatus === 'FAILED'
        ? 'Le paiement a échoué.'
        : 'Paiement toujours en attente.',
    };
  } catch (error: any) {
    console.error('[checkEnrollementStatusAction]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}
