"use client";

import React from "react";
import {
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  Star,
  Trash2,
  User,
  Phone,
} from "lucide-react";

export interface RechargeData {
  index: number;
  amount: number;
  providerTxId: string;
  status: "EN_ATTENTE" | "SUCCES" | "ECHEC";
  targetLevel: number;
  createdAt: Date;
  playerId?: string;
}

interface RechargeCardProps {
  recharge: RechargeData;
  onCheckStatus: (index: number) => void;
  checking: boolean;
  /** Mode admin : affiche les infos joueur + bouton supprimer */
  isAdmin?: boolean;
  playerPseudo?: string;
  playerPhone?: string;
  onDelete?: (playerId: string, rechargeIndex: number) => void;
  deleting?: boolean;
}

const statusConfig = {
  EN_ATTENTE: {
    label: "En attente",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  SUCCES: {
    label: "Confirmé",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  ECHEC: {
    label: "Échoué",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  },
};

const niveauParCarte: Record<number, { name: string; icon: React.ReactNode; games: number }> = {
  1: { name: "ELEMBO", icon: <Zap className="w-3.5 h-3.5" />, games: 15 },
  2: { name: "MOTUYA", icon: <Star className="w-3.5 h-3.5" />, games: 25 },
  3: { name: "ELONGA", icon: <Sparkles className="w-3.5 h-3.5" />, games: 60 },
};

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

export default function RechargeCard({
  recharge,
  onCheckStatus,
  checking,
  isAdmin = false,
  playerPseudo,
  playerPhone,
  onDelete,
  deleting = false,
}: RechargeCardProps) {
  const cfg = statusConfig[recharge.status];
  const StatusIcon = cfg.icon;
  const levelInfo = niveauParCarte[recharge.targetLevel] || {
    name: `Carte ${recharge.targetLevel}`,
    icon: null,
    games: 0,
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${cfg.bg} ${cfg.border}`}
    >
      {/* Montant principal */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Montant
          </p>
          <p className={`text-2xl font-bold mt-0.5 ${cfg.color}`}>
            {formatAmount(recharge.amount)}{" "}
            <span className="text-sm font-medium">FC</span>
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>

      {/* Détails */}
      <div className="space-y-2 mb-4">
        {/* Carte + parties */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <ArrowUpRight className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-medium">Carte :</span>
          <span className="flex items-center gap-1">
            {levelInfo.icon}
            {levelInfo.name}
          </span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>{levelInfo.games} parties{recharge.targetLevel === 3 ? " (50+10)" :(recharge.targetLevel === 2 ? " (20+5)" : (recharge.targetLevel === 1 ? " (10+5)" :""))}</span>
        </div>

        {/* Transaction ID */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Wallet className="w-3.5 h-3.5" />
          <span className="font-mono truncate max-w-[160px]">
            #{recharge.providerTxId.slice(0, 18)}...
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(recharge.createdAt)}</span>
        </div>

        {/* Infos joueur (admin uniquement) */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium truncate max-w-[140px]">
                {playerPseudo || "Inconnu"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono truncate max-w-[140px]">
                {playerPhone || "N/A"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Actions admin : bouton supprimer */}
      {isAdmin && onDelete && (
        <button
          onClick={() => onDelete(recharge.playerId!, recharge.index)}
          disabled={deleting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
        >
          <Trash2 className={`w-4 h-4 ${deleting ? "animate-pulse" : ""}`} />
          {deleting ? "Suppression..." : "Supprimer"}
        </button>
      )}

      {/* Bouton Vérifier (uniquement pour EN_ATTENTE) */}
      {recharge.status === "EN_ATTENTE" && (
        <button
          onClick={() => onCheckStatus(recharge.index)}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${checking ? "animate-spin" : ""}`}
          />
          {checking ? "Vérification..." : "Vérifier le statut"}
        </button>
      )}

      {/* Ligne décorative colorée en haut */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          recharge.status === "EN_ATTENTE"
            ? "bg-gradient-to-r from-amber-400 to-amber-500"
            : recharge.status === "SUCCES"
            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
            : "bg-gradient-to-r from-red-400 to-red-500"
        }`}
      />
    </div>
  );
}