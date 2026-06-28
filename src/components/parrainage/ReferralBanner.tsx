"use client";

import React, { useState, useCallback } from "react";
import Button from "@/components/ui/button/Button";
import { CopyIcon, DownloadIcon } from "@/icons";

interface ReferralBannerProps {
  code: string;
  referralUrl: string;
  qrCodeDataUrl: string;
}

export default function ReferralBanner({ code, referralUrl, qrCodeDataUrl }: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [referralUrl]);

  const handleDownloadQR = useCallback(() => {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `parrainage-${code.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrCodeDataUrl, code]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* ── Colonne gauche : infos + lien ── */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Votre lien de parrainage
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Partagez ce lien avec vos amis. À chaque recharge validée d&apos;un filleul,
              vous gagnez <span className="font-semibold text-brand-500">+3 parties</span> bonus !
            </p>
          </div>

          {/* Code de parrainage */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Code :</span>
            <code className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-mono font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
              {code}
            </code>
          </div>

          {/* Lien de parrainage */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
              <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                {referralUrl}
              </p>
            </div>
            <Button
              size="sm"
              variant={copied ? "outline" : "primary"}
              onClick={handleCopyLink}
              startIcon={<CopyIcon />}
            >
              {copied ? "Copié !" : "Copier le lien"}
            </Button>
          </div>
        </div>

        {/* ── Colonne droite : QR Code ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeDataUrl}
              alt="QR Code de parrainage"
              className="h-40 w-40 lg:h-44 lg:w-44"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadQR}
            startIcon={<DownloadIcon />}
          >
            Télécharger le QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}