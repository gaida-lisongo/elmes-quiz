"use client";

import React, { useState } from "react";
import { Zap, Star, Sparkles, Phone, Coins, Loader2, CreditCard, Smartphone } from "lucide-react";
import { rechargePlayerAction } from "@/app/actions/payment.actions";
import { useLoader } from "@/context/LoaderContext";

interface RechargeFormProps {
  playerId: string;
  phone: string;
  onSuccess: () => void;
}

type PaymentMethod = "mobile-money" | "card";
type Currency = "CDF" | "USD";

const levels = [
  { value: 1, label: "ELEMBO", priceCDF: 3000, priceUSD: 1, games: 15, icon: Zap, color: "text-blue-500", desc: "15 parties" },
  { value: 2, label: "MOTUYA", priceCDF: 5000, priceUSD: 2, games: 25, icon: Star, color: "text-purple-500", desc: "25 parties" },
  { value: 3, label: "ELONGA", priceCDF: 10000, priceUSD: 4, games: 60, icon: Sparkles, color: "text-amber-500", desc: "50 + 10 parties" },
];

export default function RechargeForm({ playerId, phone, onSuccess }: RechargeFormProps) {
  const { showLoader, hideLoader } = useLoader();
  const [activeTab, setActiveTab] = useState<PaymentMethod>("mobile-money");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency>("CDF");
  const [transactionPhone, setTransactionPhone] = useState(phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel || activeTab !== "mobile-money") return;

    setLoading(true);
    showLoader('Initialisation du paiement Mobile Money...');
    setMessage(null);

    const level = levels.find((l) => l.value === selectedLevel);
    if (!level) return;

    const amount = currency === "CDF" ? level.priceCDF : level.priceUSD;

    try {
      const result = await rechargePlayerAction(playerId, transactionPhone, selectedLevel, amount, currency);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Collecte lancée ! Vous allez recevoir une demande de paiement sur ${transactionPhone}.`,
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
      hideLoader();
    }
  };

  const selectedPrice = selectedLevel
    ? levels.find((l) => l.value === selectedLevel)?.[currency === "CDF" ? "priceCDF" : "priceUSD"]
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab("mobile-money")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            activeTab === "mobile-money"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile Money
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("card")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
            activeTab === "card"
              ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Carte bancaire
        </button>
      </div>

      {activeTab === "card" ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-8 text-center">
          <CreditCard className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-500" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Paiement par carte bancaire
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponible prochainement.
          </p>
        </div>
      ) : (
        <>
          {/* Sélecteur de devise */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Devise
            </p>
            <div className="flex gap-2">
              {(["CDF", "USD"] as Currency[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    currency === c
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro de téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numéro Mobile Money
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={transactionPhone}
                onChange={(e) => setTransactionPhone(e.target.value)}
                placeholder="243XXXXXXXXX"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Ce numéro sera utilisé pour le retrait / la transaction.
            </p>
          </div>

          {/* Sélecteur de niveau */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Choisissez votre carte de recharge
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {levels.map((level) => {
                const Icon = level.icon;
                const isSelected = selectedLevel === level.value;
                const price = currency === "CDF" ? level.priceCDF : level.priceUSD;
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
                        {price.toLocaleString("fr-FR")} {currency}
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
                <span className="font-medium text-gray-800 dark:text-white">{transactionPhone || phone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  Montant
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {selectedPrice?.toLocaleString("fr-FR")} {currency}
                </span>
              </div>
            </div>
          )}
        </>
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
        disabled={activeTab === "card" || !selectedLevel || loading || !transactionPhone}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Traitement en cours...
          </>
        ) : activeTab === "card" ? (
          <>
            <CreditCard className="w-4 h-4" />
            Bientôt disponible
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