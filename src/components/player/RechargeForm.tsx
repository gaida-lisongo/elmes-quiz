"use client";

import React, { useState } from "react";
import { Zap, Star, Sparkles, Phone, Coins, Loader2 } from "lucide-react";
import { rechargePlayerAction } from "@/app/actions/payment.actions";

interface RechargeFormProps {
  playerId: string;
  phone: string;
  onSuccess: () => void;
}

const levels = [
  { value: 1, label: "ELEMBO", price: 3000, games: 15, icon: Zap, color: "text-blue-500", desc: "15 parties" },
  { value: 2, label: "MOTUYA", price: 5000, games: 25, icon: Star, color: "text-purple-500", desc: "25 parties" },
  { value: 3, label: "ELONGA", price: 10000, games: 60, icon: Sparkles, color: "text-amber-500", desc: "50 + 10 parties" },
];

export default function RechargeForm({ playerId, phone, onSuccess }: RechargeFormProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) return;

    setLoading(true);
    setMessage(null);

    const level = levels.find((l) => l.value === selectedLevel);
    if (!level) return;

    try {
      const result = await rechargePlayerAction(playerId, phone, selectedLevel, level.price);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Collecte lancée ! Vous allez recevoir une demande de paiement sur votre téléphone.`,
        });
        setTimeout(() => {
          setMessage(null);
          setSelectedLevel(null);
          onSuccess();
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur inattendue." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sélecteur de niveau */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Choisissez votre carte de recharge
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.value;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => setSelectedLevel(level.value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon className={`w-8 h-8 ${isSelected ? level.color : "text-gray-400 dark:text-gray-500"}`} />
                <div className="text-center">
                  <p className={`text-sm font-semibold ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                    {level.label}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${isSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-500"}`}>
                    {level.price.toLocaleString("fr-FR")} FC
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{level.desc}</p>
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Récapitulatif */}
      {selectedLevel && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile Money
            </span>
            <span className="font-medium text-gray-800 dark:text-white">{phone}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Montant
            </span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              {levels.find((l) => l.value === selectedLevel)?.price.toLocaleString("fr-FR")} FC
            </span>
          </div>
        </div>
      )}

      {/* Message feedback */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Bouton */}
      <button
        type="submit"
        disabled={!selectedLevel || loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Recharger maintenant
          </>
        )}
      </button>
    </form>
  );
}