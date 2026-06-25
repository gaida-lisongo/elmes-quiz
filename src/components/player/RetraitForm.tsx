"use client";

import React, { useState } from "react";
import { Phone, Coins, Loader2, ArrowUpRight } from "lucide-react";
import { requestRetraitAction } from "@/app/actions/payment.actions";

interface RetraitFormProps {
  phone: string;
  solde: number;
  onSuccess: () => void;
}

export default function RetraitForm({ phone, solde, onSuccess }: RetraitFormProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const numericAmount = parseInt(amount, 10) || 0;
  const isValid = numericAmount >= 500 && numericAmount <= solde && numericAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await requestRetraitAction(phone, numericAmount);
      if (result.success) {
        setMessage({ type: "success", text: `Retrait demandé ! Vous allez recevoir ${numericAmount.toLocaleString("fr-FR")} FC sur ${phone}.` });
        setTimeout(() => { setMessage(null); setAmount(""); onSuccess(); }, 2000);
      } else {
        setMessage({ type: "error", text: result.error || "Erreur." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Téléphone (lecture seule) */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Phone className="w-4 h-4" /> Numéro Mobile Money
        </p>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
          {phone}
        </div>
      </div>

      {/* Montant */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Coins className="w-4 h-4" /> Montant à retirer (FC)
        </p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="500 minimum"
          min={500}
          max={solde}
          className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:focus:border-brand-800 outline-hidden"
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Solde disponible : <span className="font-semibold text-gray-800 dark:text-white">{solde.toLocaleString("fr-FR")} FC</span>
        </p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}>{message.text}</div>
      )}

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
        ) : (
          <><ArrowUpRight className="w-4 h-4" /> Retirer maintenant</>
        )}
      </button>
    </form>
  );
}