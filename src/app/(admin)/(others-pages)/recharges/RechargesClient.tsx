"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import RechargeCard from "@/components/player/RechargeCard";
import RechargeForm from "@/components/player/RechargeForm";
import {
  getMyRechargesAction,
  checkRechargeStatusAction,
} from "@/app/actions/payment.actions";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface RechargeItem {
  index: number;
  amount: number;
  providerTxId: string;
  status: "EN_ATTENTE" | "SUCCES" | "ECHEC";
  targetLevel: number;
  createdAt: Date;
}

interface PlayerData {
  playerId: string;
  userId: string;
  telephone: string;
  pseudo: string;
  solde: number;
  parties: number;
  level: number;
  recharges: RechargeItem[];
}

export default function RechargesClient() {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const formModal = useModal();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyRechargesAction();
      if (result.success && result.data) {
        setData(result.data as PlayerData);
      }
    } catch (err) {
      console.error("[RechargesClient]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckStatus = async (index: number) => {
    if (!data) return;
    setCheckingIndex(index);
    setStatusMessage(null);

    try {
      const result = await checkRechargeStatusAction(data.playerId, index);
      if (result.success) {
        setStatusMessage({
          type: result.status === "SUCCES" ? "success" : "error",
          text: result.message || "Statut mis à jour.",
        });
        // Rafraîchir les données
        await fetchData();
      } else {
        setStatusMessage({ type: "error", text: result.error || "Erreur de vérification." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setCheckingIndex(null);
      // Effacer le message après 5s
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleRechargeSuccess = () => {
    formModal.closeModal();
    fetchData();
  };

  // Stats
  const totalRecharges = data?.recharges.length || 0;
  const successfulRecharges = data?.recharges.filter((r) => r.status === "SUCCES").length || 0;
  const pendingRecharges = data?.recharges.filter((r) => r.status === "EN_ATTENTE").length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">
          Impossible de charger vos recharges. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête + solde */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Mes Recharges
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez vos rechargements Mobile Money
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-4 py-2.5">
            <Wallet className="w-5 h-5 text-brand-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Parties</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data.parties}
              </p>
            </div>
          </div>
          <button
            onClick={formModal.openModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Recharger
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecharges}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{successfulRecharges}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confirmées</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingRecharges}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En attente</p>
        </div>
      </div>

      {/* Message de statut */}
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

      {/* Grille de cartes (4 par ligne) */}
      {data.recharges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Aucune recharge pour le moment
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Cliquez sur &quot;Recharger&quot; pour commencer
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.recharges].reverse().map((recharge) => (
            <RechargeCard
              key={`${recharge.providerTxId}-${recharge.index}`}
              recharge={recharge}
              onCheckStatus={handleCheckStatus}
              checking={checkingIndex === recharge.index}
            />
          ))}
        </div>
      )}

      {/* Modale Nouvelle Recharge */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        className="max-w-[500px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Nouvelle recharge
            </h4>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Choisissez un niveau et validez via Mobile Money.
            </p>
          </div>
          <div className="px-2">
            <RechargeForm
              playerId={data.playerId}
              phone={data.telephone}
              onSuccess={handleRechargeSuccess}
            />
          </div>
          <div className="flex justify-end px-2 mt-4">
            <Button size="sm" variant="outline" onClick={formModal.closeModal}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}