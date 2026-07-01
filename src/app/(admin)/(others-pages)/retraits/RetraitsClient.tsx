"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  Plus,
  AlertCircle,
  ArrowUpRight,
  Landmark,
} from "lucide-react";
import RetraitCard from "@/components/player/RetraitCard";
import RetraitForm from "@/components/player/RetraitForm";
import { getMyRetraitsAction, checkRetraitStatusAction } from "@/app/actions/payment.actions";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useLoader } from "@/context/LoaderContext";

interface RetraitItem {
  index: number;
  amount: number;
  providerTxId: string;
  status: "EN_ATTENTE" | "SUCCES" | "ECHEC";
  createdAt: Date;
}

interface RetraitsData {
  solde: number;
  pseudo: string;
  telephone: string;
  role: string;
  retraits: RetraitItem[];
}

export default function RetraitsClient() {
  const [data, setData] = useState<RetraitsData | null>(null);
  const [ready, setReady] = useState(false);
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const formModal = useModal();
  const { showLoader, hideLoader } = useLoader();

  const fetchData = useCallback(async () => {
    showLoader('Chargement de vos retraits...');
    try {
      const result = await getMyRetraitsAction();
      if (result.success && result.data) setData(result.data as RetraitsData);
    } catch {} finally { hideLoader(); setReady(true); }
  }, [showLoader, hideLoader]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckStatus = async (index: number) => {
    if (!data) return;
    setCheckingIndex(index);
    setStatusMessage(null);

    const result = await checkRetraitStatusAction(index);
    if (result.success) {
      setStatusMessage({ type: result.status === "SUCCES" ? "success" : "error", text: result.message || "" });
      await fetchData();
    } else {
      setStatusMessage({ type: "error", text: result.error || "Erreur." });
    }

    setCheckingIndex(null);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSuccess = () => { formModal.closeModal(); fetchData(); };

  if (!ready) {
    return null;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">Impossible de charger vos retraits.</p>
      </div>
    );
  }

  const pendingRetraits = data.retraits.filter((r) => r.status === "EN_ATTENTE").length;
  const successRetraits = data.retraits.filter((r) => r.status === "SUCCES").length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Retraits</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Retirez votre solde via Mobile Money</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-4 py-2.5">
            <Wallet className="w-5 h-5 text-success-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Solde</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {data.solde.toLocaleString("fr-FR")} FC
              </p>
            </div>
          </div>
          <button
            onClick={formModal.openModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Retirer
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.retraits.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{successRetraits}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Effectués</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingRetraits}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">En attente</p>
        </div>
      </div>

      {statusMessage && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          statusMessage.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>{statusMessage.text}</div>
      )}

      {/* Grille */}
      {data.retraits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-10 text-center">
          <Landmark className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun retrait pour le moment</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Cliquez sur "Retirer" pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.retraits].reverse().map((retrait) => (
            <RetraitCard key={`${retrait.providerTxId}-${retrait.index}`} retrait={retrait} onCheckStatus={handleCheckStatus} checking={checkingIndex === retrait.index} />
          ))}
        </div>
      )}

      {/* Modale */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">Nouveau retrait</h4>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Retirez votre argent sur votre compte Mobile Money.</p>
          </div>
          <div className="px-2">
            <RetraitForm phone={data.telephone} solde={data.solde} onSuccess={handleSuccess} />
          </div>
          <div className="flex justify-end px-2 mt-4">
            <Button size="sm" variant="outline" onClick={formModal.closeModal}>Annuler</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}