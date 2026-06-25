"use client";

import React from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Banknote,
} from "lucide-react";

export interface RetraitData {
  index: number;
  amount: number;
  providerTxId: string;
  status: "EN_ATTENTE" | "SUCCES" | "ECHEC";
  createdAt: Date;
}

interface RetraitCardProps {
  retrait: RetraitData;
  onCheckStatus: (index: number) => void;
  checking: boolean;
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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

export default function RetraitCard({ retrait, onCheckStatus, checking }: RetraitCardProps) {
  const cfg = statusConfig[retrait.status];
  const StatusIcon = cfg.icon;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${cfg.bg} ${cfg.border}`}>
      {/* Montant */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Retrait</p>
          <p className={`text-2xl font-bold mt-0.5 ${cfg.color}`}>
            {formatAmount(retrait.amount)} <span className="text-sm font-medium">FC</span>
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
      </div>

      {/* Détails */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Banknote className="w-3.5 h-3.5" />
          <span className="font-mono truncate max-w-[160px]">#{retrait.providerTxId.slice(0, 18)}...</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(retrait.createdAt)}</span>
        </div>
      </div>

      {retrait.status === "EN_ATTENTE" && (
        <button
          onClick={() => onCheckStatus(retrait.index)}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Vérification..." : "Vérifier le statut"}
        </button>
      )}

      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
        retrait.status === "EN_ATTENTE" ? "from-amber-400 to-amber-500"
        : retrait.status === "SUCCES" ? "from-emerald-400 to-emerald-500"
        : "from-red-400 to-red-500"
      }`} />
    </div>
  );
}