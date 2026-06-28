'use server';

import connectToDb from '../lib/utils/db';
import Equipe from '../lib/models/Equipe';
import Player from '../lib/models/Player';
import User from '../lib/models/User';
import { getSession } from '@/lib/utils/auth';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

// ── Types ─────────────────────────────────────────────────────────

export interface MembreData {
  playerId: string;
  pseudo: string;
  telephone: string;
  photo: string | null;
  status: boolean;
  isSecretary: boolean;
}

export interface ActualiteData {
  _id: string;
  title: string;
  subTitle: string;
  image: string;
  content: string[];
}

export interface EquipeData {
  _id: string;
  designation: string;
  description: string[];
  logo: string;
  chefId: string;
  membres: MembreData[];
  actualites: ActualiteData[];
  metriques: {
    competitions: number;
    soldeUsd: number;
    matchsWin: number;
  };
  isChef: boolean;
  isSecretaire: boolean;
  createdAt: string;
}

export interface PlayerSearchResult {
  playerId: string;
  pseudo: string;
  telephone: string;
  photo: string | null;
  school: string;
  level: number;
}

export interface InvitationData {
  equipeId: string;
  designation: string;
  logo: string;
  description: string[];
  chefPseudo: string;
  membresCount: number;
  actualites: ActualiteData[];
  metriques: {
    competitions: number;
    soldeUsd: number;
    matchsWin: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────

async function getPlayerId(userId: string): Promise<string | null> {
  const player = await Player.findOne({ userId }).select('_id').lean();
  return player ? player._id.toString() : null;
}

// ── Récupérer l'équipe du joueur connecté ─────────────────────────

export async function getMyEquipe(): Promise<{
  success: boolean;
  data?: EquipeData | null;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const playerId = await getPlayerId(session.userId);
    if (!playerId) return { success: false, error: 'Profil joueur introuvable.' };

    // Chercher si le joueur est chef ou membre accepté d'une équipe
    const equipe = await Equipe.findOne({
      $or: [
        { chefId: playerId },
        { 'membres.player': playerId, 'membres.status': true },
      ],
    })
      .populate('chefId', 'userId')
      .populate('membres.player', 'userId')
      .lean();

    if (!equipe) return { success: true, data: null };

    // Récupérer les pseudos des membres
    const membrePlayerIds = equipe.membres.map((m: any) => m.player?._id?.toString() || m.player?.toString()).filter(Boolean);
    const chefPlayerId = equipe.chefId?._id?.toString() || equipe.chefId?.toString();

    const allPlayerIds = [...new Set([chefPlayerId, ...membrePlayerIds])].filter(Boolean);

    const players = await Player.find({ _id: { $in: allPlayerIds } })
      .populate('userId', 'pseudo telephone photo')
      .lean();

    const playerMap = new Map(players.map((p: any) => [p._id.toString(), p]));

    const mapMembre = (m: any): MembreData => {
      const pid = m.player?._id?.toString() || m.player?.toString();
      const p = playerMap.get(pid);
      return {
        playerId: pid,
        pseudo: p?.userId?.pseudo || 'Inconnu',
        telephone: p?.userId?.telephone || '',
        photo: p?.userId?.photo || null,
        status: m.status,
        isSecretary: m.isSecretary,
      };
    };

    const membres: MembreData[] = equipe.membres.map(mapMembre);

    // Ajouter le chef comme membre virtuel s'il n'est pas déjà dans la liste
    const chefPlayer = playerMap.get(chefPlayerId);
    const chefAlreadyInMembres = membres.some((m) => m.playerId === chefPlayerId);
    if (!chefAlreadyInMembres && chefPlayer) {
      membres.unshift({
        playerId: chefPlayerId,
        pseudo: chefPlayer?.userId?.pseudo || 'Capitaine',
        telephone: chefPlayer?.userId?.telephone || '',
        photo: chefPlayer?.userId?.photo || null,
        status: true,
        isSecretary: false,
      });
    }

    // Déterminer si le joueur connecté est chef ou secrétaire
    const isChef = chefPlayerId === playerId;
    const myMembreEntry = equipe.membres.find(
      (m: any) => (m.player?._id?.toString() || m.player?.toString()) === playerId
    );
    const isSecretaire = myMembreEntry?.isSecretary || false;

    return {
      success: true,
      data: {
        _id: equipe._id.toString(),
        designation: equipe.designation,
        description: equipe.description || [],
        logo: equipe.logo || '',
        chefId: chefPlayerId,
        membres,
        actualites: (equipe.actualites || []).map((a: any) => ({
          _id: a._id?.toString() || '',
          title: a.title || '',
          subTitle: a.subTitle || '',
          image: a.image || '',
          content: a.content || [],
        })),
        metriques: equipe.metriques || { competitions: 0, soldeUsd: 0, matchsWin: 0 },
        isChef,
        isSecretaire,
        createdAt: (equipe as any).createdAt?.toISOString() || '',
      },
    };
  } catch (error: any) {
    console.error('[getMyEquipe]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Créer une équipe ──────────────────────────────────────────────

export async function createEquipe(data: {
  designation: string;
  description: string[];
  logo: string;
  membres: string[]; // player IDs to invite
}): Promise<{ success: boolean; equipeId?: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };
    if (session.role !== 'PLAYER') return { success: false, error: 'Seuls les joueurs peuvent créer une équipe.' };

    await connectToDb();

    const playerId = await getPlayerId(session.userId);
    if (!playerId) return { success: false, error: 'Profil joueur introuvable.' };

    // Vérifier que le joueur n'a pas déjà une équipe
    const existing = await Equipe.findOne({
      $or: [
        { chefId: playerId },
        { 'membres.player': playerId, 'membres.status': true },
      ],
    });
    if (existing) return { success: false, error: 'Vous appartenez déjà à une équipe.' };

    // Maximum 4 membres invités (+ le chef = 5)
    if (data.membres.length > 4) {
      return { success: false, error: 'Maximum 4 membres invités (5 avec le capitaine).' };
    }

    // Vérifier qu'aucun des invités n'est déjà dans une équipe et qu'ils ont le bon niveau
    for (const mid of data.membres) {
      const alreadyInTeam = await Equipe.findOne({
        $or: [
          { chefId: mid },
          { 'membres.player': mid, 'membres.status': true },
        ],
      });
      if (alreadyInTeam) {
        return { success: false, error: `Un des joueurs invités appartient déjà à une équipe.` };
      }
      const invitedPlayer = await Player.findById(mid).select('level').lean();
      if (!invitedPlayer || ![2, 3].includes(invitedPlayer.level)) {
        return { success: false, error: 'Seuls les joueurs de niveau Intermédiaire (2) ou Avancé (3) peuvent être invités.' };
      }
    }

    const equipe = await Equipe.create({
      chefId: playerId,
      designation: data.designation.trim(),
      description: data.description.filter(Boolean),
      logo: data.logo || '',
      membres: data.membres.map((pid) => ({
        player: pid,
        status: false,
        isSecretary: false,
      })),
      actualites: [],
      metriques: { competitions: 0, soldeUsd: 0, matchsWin: 0 },
    });

    revalidatePath('/', 'layout');
    return { success: true, equipeId: equipe._id.toString() };
  } catch (error: any) {
    console.error('[createEquipe]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Rechercher des joueurs ────────────────────────────────────────

export async function searchPlayers(query: string): Promise<{
  success: boolean;
  data?: PlayerSearchResult[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }

    await connectToDb();

    const playerId = await getPlayerId(session.userId);

    // Rechercher par pseudo ou téléphone
    const users = await User.find({
      $and: [
        { role: 'PLAYER' },
        {
          $or: [
            { pseudo: { $regex: query.trim(), $options: 'i' } },
            { telephone: { $regex: query.trim(), $options: 'i' } },
          ],
        },
      ],
    })
      .select('pseudo telephone photo')
      .lean();

    const userIds = users.map((u: any) => u._id);

    const players = await Player.find({ userId: { $in: userIds }, level: { $in: [2, 3] } })
      .select('userId school level')
      .lean();

    // Exclure les joueurs qui ont déjà une équipe
    const playerIds = players.map((p: any) => p._id);
    const playersInTeam = await Equipe.find({
      $or: [
        { chefId: { $in: playerIds } },
        { 'membres.player': { $in: playerIds }, 'membres.status': true },
      ],
    }).select('chefId membres').lean();

    const excludedPlayerIds = new Set<string>();
    for (const eq of playersInTeam) {
      excludedPlayerIds.add(eq.chefId.toString());
      for (const m of eq.membres) {
        if (m.status) excludedPlayerIds.add(m.player.toString());
      }
    }

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    const results: PlayerSearchResult[] = players
      .filter((p: any) => p._id.toString() !== playerId) // exclure soi-même
      .filter((p: any) => !excludedPlayerIds.has(p._id.toString())) // exclure ceux déjà en équipe
      .map((p: any) => {
        const u = userMap.get(p.userId.toString());
        return {
          playerId: p._id.toString(),
          pseudo: u?.pseudo || 'Inconnu',
          telephone: u?.telephone || '',
          photo: u?.photo || null,
          school: p.school || '',
          level: p.level || 0,
        };
      });

    return { success: true, data: results };
  } catch (error: any) {
    console.error('[searchPlayers]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Ajouter un membre à l'équipe (invitation) ─────────────────────

export async function inviteMembre(playerIdToInvite: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({ chefId: myPlayerId });
    if (!equipe) return { success: false, error: 'Vous n\'êtes pas capitaine d\'une équipe.' };

    // Compter les membres (acceptés + en attente)
    const totalMembres = equipe.membres.length;
    if (totalMembres >= 4) {
      return { success: false, error: 'L\'équipe est déjà complète (4 membres max + le capitaine).' };
    }

    // Vérifier que le joueur n'est pas déjà dans l'équipe
    const alreadyIn = equipe.membres.some(
      (m: any) => m.player.toString() === playerIdToInvite
    );
    if (alreadyIn) return { success: false, error: 'Ce joueur est déjà invité ou membre.' };

    // Vérifier le niveau du joueur (seuls les niveaux 2 et 3 peuvent être invités)
    const playerToInvite = await Player.findById(playerIdToInvite).select('level').lean();
    if (!playerToInvite || ![2, 3].includes(playerToInvite.level)) {
      return { success: false, error: 'Seuls les joueurs de niveau Intermédiaire (2) ou Avancé (3) peuvent rejoindre une équipe.' };
    }

    // Vérifier que le joueur n'est pas dans une autre équipe
    const inOtherTeam = await Equipe.findOne({
      $or: [
        { chefId: playerIdToInvite },
        { 'membres.player': playerIdToInvite, 'membres.status': true },
      ],
    });
    if (inOtherTeam) return { success: false, error: 'Ce joueur appartient déjà à une équipe.' };

    equipe.membres.push({
      player: new mongoose.Types.ObjectId(playerIdToInvite),
      status: false,
      isSecretary: false,
    });
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[inviteMembre]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Nommer/retirer un secrétaire ──────────────────────────────────

export async function toggleSecretaire(membrePlayerId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({ chefId: myPlayerId });
    if (!equipe) return { success: false, error: 'Vous n\'êtes pas capitaine d\'une équipe.' };

    const membre = equipe.membres.find(
      (m: any) => m.player.toString() === membrePlayerId
    );
    if (!membre) return { success: false, error: 'Membre introuvable.' };

    membre.isSecretary = !membre.isSecretary;
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[toggleSecretaire]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Ajouter une actualité ─────────────────────────────────────────

export async function addActualite(data: {
  title: string;
  subTitle: string;
  image: string;
  content: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    // Le chef ou un secrétaire peut ajouter une actualité
    const equipe = await Equipe.findOne({
      $or: [
        { chefId: myPlayerId },
        { 'membres.player': myPlayerId, 'membres.isSecretary': true, 'membres.status': true },
      ],
    });
    if (!equipe) return { success: false, error: 'Vous n\'avez pas les droits pour ajouter une actualité.' };

    equipe.actualites.push({
      title: data.title.trim(),
      subTitle: data.subTitle.trim(),
      image: data.image || '',
      content: data.content.filter(Boolean),
    });
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[addActualite]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Accepter une invitation ───────────────────────────────────────

export async function acceptInvitation(equipeId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    // Vérifier que le joueur n'est pas déjà dans une équipe
    const alreadyInTeam = await Equipe.findOne({
      $or: [
        { chefId: myPlayerId },
        { 'membres.player': myPlayerId, 'membres.status': true },
      ],
    });
    if (alreadyInTeam) return { success: false, error: 'Vous appartenez déjà à une équipe.' };

    const equipe = await Equipe.findById(equipeId);
    if (!equipe) return { success: false, error: 'Équipe introuvable.' };

    const membre = equipe.membres.find(
      (m: any) => m.player.toString() === myPlayerId && !m.status
    );
    if (!membre) return { success: false, error: 'Aucune invitation trouvée.' };

    membre.status = true;
    await equipe.save();

    // Supprimer toutes les autres invitations du joueur
    await Equipe.updateMany(
      { 'membres.player': myPlayerId, 'membres.status': false, _id: { $ne: equipe._id } },
      { $pull: { membres: { player: myPlayerId, status: false } } }
    );

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[acceptInvitation]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Récupérer les invitations du joueur ───────────────────────────

export async function getMyInvitations(): Promise<{
  success: boolean;
  data?: InvitationData[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    // Trouver toutes les équipes où le joueur est invité (status: false)
    const equipes = await Equipe.find({
      'membres.player': myPlayerId,
      'membres.status': false,
    })
      .populate('chefId', 'userId')
      .lean();

    if (!equipes.length) return { success: true, data: [] };

    // Récupérer les pseudos des chefs
    const chefPlayerIds = equipes.map((e: any) => e.chefId?._id?.toString() || e.chefId?.toString()).filter(Boolean);
    const chefs = await Player.find({ _id: { $in: chefPlayerIds } })
      .populate('userId', 'pseudo')
      .lean();
    const chefMap = new Map(chefs.map((c: any) => [c._id.toString(), c]));

    const invitations: InvitationData[] = equipes.map((e: any) => {
      const chefId = e.chefId?._id?.toString() || e.chefId?.toString();
      const chef = chefMap.get(chefId);
      return {
        equipeId: e._id.toString(),
        designation: e.designation,
        logo: e.logo || '',
        description: e.description || [],
        chefPseudo: chef?.userId?.pseudo || 'Inconnu',
        membresCount: e.membres.filter((m: any) => m.status).length + 1, // +1 pour le chef
        actualites: (e.actualites || []).map((a: any) => ({
          _id: a._id?.toString() || '',
          title: a.title || '',
          subTitle: a.subTitle || '',
          image: a.image || '',
          content: a.content || [],
        })),
        metriques: e.metriques || { competitions: 0, soldeUsd: 0, matchsWin: 0 },
      };
    });

    return { success: true, data: invitations };
  } catch (error: any) {
    console.error('[getMyInvitations]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Récupérer le nombre total d'équipes ───────────────────────────

export async function getEquipesCount(): Promise<number> {
  await connectToDb();
  return Equipe.countDocuments({});
}

// ── Modifier l'équipe (chef uniquement) ───────────────────────────

export async function updateEquipe(data: {
  designation: string;
  description: string[];
  logo: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({ chefId: myPlayerId });
    if (!equipe) return { success: false, error: 'Vous n\'êtes pas capitaine d\'une équipe.' };

    if (data.designation.trim().length < 3) {
      return { success: false, error: 'Le nom de l\'équipe doit avoir au moins 3 caractères.' };
    }

    equipe.designation = data.designation.trim();
    equipe.description = data.description.filter(Boolean);
    equipe.logo = data.logo || '';
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[updateEquipe]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Supprimer l'équipe (chef uniquement) ──────────────────────────

export async function deleteEquipe(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({ chefId: myPlayerId });
    if (!equipe) return { success: false, error: 'Vous n\'êtes pas capitaine d\'une équipe.' };

    await Equipe.findByIdAndDelete(equipe._id);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteEquipe]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Supprimer un membre (chef uniquement) ─────────────────────────

export async function removeMembre(membrePlayerId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({ chefId: myPlayerId });
    if (!equipe) return { success: false, error: 'Vous n\'êtes pas capitaine d\'une équipe.' };

    // Empêcher de supprimer le chef
    if (membrePlayerId === myPlayerId) {
      return { success: false, error: 'Vous ne pouvez pas vous retirer vous-même. Supprimez l\'équipe.' };
    }

    const idx = equipe.membres.findIndex(
      (m: any) => m.player.toString() === membrePlayerId
    );
    if (idx === -1) return { success: false, error: 'Membre introuvable.' };

    equipe.membres.splice(idx, 1);
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[removeMembre]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Modifier une actualité ────────────────────────────────────────

export async function updateActualite(data: {
  actualiteId: string;
  title: string;
  subTitle: string;
  image: string;
  content: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({
      $or: [
        { chefId: myPlayerId },
        { 'membres.player': myPlayerId, 'membres.isSecretary': true, 'membres.status': true },
      ],
    });
    if (!equipe) return { success: false, error: 'Vous n\'avez pas les droits.' };

    const actu = (equipe.actualites as any).id(data.actualiteId);
    if (!actu) return { success: false, error: 'Actualité introuvable.' };

    actu.title = data.title.trim();
    actu.subTitle = data.subTitle.trim();
    actu.image = data.image || '';
    actu.content = data.content.filter(Boolean);
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[updateActualite]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}

// ── Supprimer une actualité ───────────────────────────────────────

export async function deleteActualite(actualiteId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Non authentifié.' };

    await connectToDb();

    const myPlayerId = await getPlayerId(session.userId);
    if (!myPlayerId) return { success: false, error: 'Profil joueur introuvable.' };

    const equipe = await Equipe.findOne({
      $or: [
        { chefId: myPlayerId },
        { 'membres.player': myPlayerId, 'membres.isSecretary': true, 'membres.status': true },
      ],
    });
    if (!equipe) return { success: false, error: 'Vous n\'avez pas les droits.' };

    const actu = (equipe.actualites as any).id(actualiteId);
    if (!actu) return { success: false, error: 'Actualité introuvable.' };

    (actu as any).deleteOne();
    await equipe.save();

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteActualite]', error);
    return { success: false, error: error.message || 'Erreur serveur.' };
  }
}