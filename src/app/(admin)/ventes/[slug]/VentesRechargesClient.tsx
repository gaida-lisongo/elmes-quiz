"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Wallet,
  RefreshCw,
  AlertCircle,
  Loader2,
  Download,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";
import RechargeCard from "@/components/player/RechargeCard";
import {
  getVentesRechargesAction,
  deleteRechargeAction,
  type VentesRechargesData,
  type VentesRechargeItem,
} from "@/app/actions/payment.actions";

// ── Types ──────────────────────────────────────────────────────────

type FilterStatus = "TOUS" | "EN_ATTENTE" | "SUCCES" | "ECHEC";

interface Props {
  initialData: VentesRechargesData | null;
  initialError: string | null;
  targetLevel: number;
  packName: string;
}

// ── Constantes ─────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  { value: "TOUS", label: "Tous", icon: <Filter className="w-3.5 h-3.5" /> },
  { value: "EN_ATTENTE", label: "En attente", icon: <Clock className="w-3.5 h-3.5" /> },
  { value: "SUCCES", label: "Confirmés", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { value: "ECHEC", label: "Échoués", icon: <XCircle className="w-3.5 h-3.5" /> },
];

const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: <Zap className="w-5 h-5 text-blue-500" />,
  2: <Star className="w-5 h-5 text-purple-500" />,
  3: <Sparkles className="w-5 h-5 text-amber-500" />,
};

// ── Helpers ────────────────────────────────────────────────────────

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

function generateCSV(recharges: VentesRechargeItem[], packName: string): string {
  const BOM = "\uFEFF";
  const headers = [
    "Pack",
    "Joueur",
    "Téléphone",
    "Montant (FC)",
    "Statut",
    "Transaction ID",
    "Date",
  ].join(";");

  const rows = recharges.map((r) =>
    [
      packName,
      r.playerPseudo,
      r.playerPhone,
      r.amount,
      r.status === "SUCCES" ? "Confirmé" : r.status === "ECHEC" ? "Échoué" : "En attente",
      r.providerTxId,
      new Date(r.createdAt).toLocaleString("fr-FR"),
    ].join(";"),
  );

  return BOM + [headers, ...rows].join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Composant ──────────────────────────────────────────────────────

export default function VentesRechargesClient({
  initialData,
  initialError,
  targetLevel,
  packName,
}: Props) {
  const [data, setData] = useState<VentesRechargesData | null>(initialData);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("TOUS");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ── Rafraîchir les données ────────────────────────────────────

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVentesRechargesAction(targetLevel);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || "Erreur de chargement.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }, [targetLevel]);

  // ── Supprimer une recharge ────────────────────────────────────

  const handleDelete = useCallback(
    async (playerId: string, rechargeIndex: number) => {
      const key = `${playerId}-${rechargeIndex}`;
      setDeletingId(key);
      setStatusMessage(null);

      try {
        const result = await deleteRechargeAction(playerId, rechargeIndex);
        if (result.success) {
          setStatusMessage({ type: "success", text: "Recharge supprimée avec succès." });
          await refreshData();
        } else {
          setStatusMessage({ type: "error", text: result.error || "Erreur de suppression." });
        }
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err.message || "Erreur inattendue." });
      } finally {
        setDeletingId(null);
        setTimeout(() => setStatusMessage(null), 5000);
      }
    },
    [refreshData],
  );

  // ── Exporter CSV ──────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    if (!data || data.recharges.length === 0) return;
    const filtered = filter === "TOUS"
      ? data.recharges
      : data.recharges.filter((r) => r.status === filter);
    const csv = generateCSV(filtered, packName);
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `ventes-${packName.toLowerCase()}-${date}.csv`);
  }, [data, filter, packName]);

  // ── Recharges filtrées ────────────────────────────────────────

  const filteredRecharges = useMemo(() => {
    if (!data) return [];
    if (filter === "TOUS") return data.recharges;
    return data.recharges.filter((r) => r.status === filter);
  }, [data, filter]);

  // ── État : chargement initial (pas de data) ───────────────────

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  // ── État : erreur ─────────────────────────────────────────────

  if (!data && error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { metrics } = data;

  return (
    <div className="space-y-6">
      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10">
            {LEVEL_ICONS[targetLevel]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Ventes — Pack {packName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Supervision des recharges {packName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={handleExportCSV}
            disabled={data.recharges.length === 0}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* ── Métriques ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <TrendingUp className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">recharges</p>
        </div>

        {/* En attente */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">En attente</p>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{metrics.enAttente}</p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">recharges</p>
        </div>

        {/* Confirmés */}
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Confirmés</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{metrics.succes}</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">recharges</p>
        </div>

        {/* Échoués */}
        <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs text-red-700 dark:text-red-400">Échoués</p>
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{metrics.echec}</p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">recharges</p>
        </div>

        {/* Montant total */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10">
              <DollarSign className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Montant</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(metrics.montantTotal)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">FC</p>
        </div>
      </div>

      {/* ── Message de statut ─────────────────────────────────── */}
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* ── Filtres ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
              filter === opt.value
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            {opt.icon}
            {opt.label}
            {opt.value !== "TOUS" && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  filter === opt.value
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {opt.value === "EN_ATTENTE"
                  ? metrics.enAttente
                  : opt.value === "SUCCES"
                  ? metrics.succes
                  : metrics.echec}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Grille de cartes ──────────────────────────────────── */}
      {filteredRecharges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {filter === "TOUS"
              ? "Aucune recharge trouvée pour ce pack."
              : `Aucune recharge avec le statut "${FILTER_OPTIONS.find((o) => o.value === filter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecharges.map((recharge) => {
            const deleteKey = `${recharge.playerId}-${recharge.rechargeIndex}`;
            return (
              <RechargeCard
                key={`${recharge.providerTxId}-${recharge.playerId}-${recharge.rechargeIndex}`}
                recharge={{ ...recharge, index: recharge.rechargeIndex }}
                onCheckStatus={() => {}}
                checking={false}
                isAdmin
                playerPseudo={recharge.playerPseudo}
                playerPhone={recharge.playerPhone}
                onDelete={handleDelete}
                deleting={deletingId === deleteKey}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}