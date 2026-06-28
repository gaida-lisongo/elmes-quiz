'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { CompetitionOutput } from '@/app/actions/competition.actions';
import Button from '@/components/ui/button/Button';
import { ShootingStarIcon, GroupIcon, DollarLineIcon, CalenderIcon, PaperPlaneIcon, DownloadIcon } from '@/icons';

interface CompetitionDetailClientProps {
  competition: CompetitionOutput;
}

export default function CompetitionDetailClient({ competition }: CompetitionDetailClientProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Générer le QR code
  React.useEffect(() => {
    const generateQrCode = async () => {
      try {
        const url = `${window.location.origin}/competitions/${competition.slug}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1f2937',
            light: '#ffffff',
          },
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Erreur génération QR code', err);
      }
    };
    generateQrCode();
  }, [competition.slug]);

  const handleShare = async () => {
    const url = `${window.location.origin}/competitions/${competition.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: competition.designation,
          text: `Participez à la compétition "${competition.designation}" sur ELMES-QUIZ !`,
          url,
        });
      } catch (err) {
        console.error('Erreur partage', err);
      }
    } else {
      // Fallback: copier dans le presse-papier
      await navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qr-code-${competition.slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = new Date(competition.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec image et métriques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {competition.image ? (
              <div className="relative h-64 w-full">
                <Image
                  src={competition.image}
                  alt={competition.designation}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-800">
                <ShootingStarIcon className="h-24 w-24 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <div className="p-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {competition.designation}
              </h1>
              {competition.description && (
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {competition.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <DollarLineIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cagnotte</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {competition.cagnotte.toLocaleString()} FC
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                    <GroupIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Parties</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {competition.parties}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <CalenderIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Créée le</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code et partage */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Partagez cette compétition
            </h3>
            <div className="mb-4 flex flex-col items-center">
              {qrCodeDataUrl ? (
                <Image
                  src={qrCodeDataUrl}
                  alt="QR Code de partage"
                  width={160}
                  height={160}
                  className="rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <div className="h-32 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                </div>
              )}
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Scannez ce QR code pour accéder à la compétition
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleShare}
                startIcon={<PaperPlaneIcon className="h-4 w-4" />}
                className="w-full"
              >
                Partager le lien
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadQr}
                startIcon={<DownloadIcon className="h-4 w-4" />}
                className="w-full"
                disabled={!qrCodeDataUrl}
              >
                Télécharger QR Code
              </Button>
            </div>
          </div>

          {/* Statut */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Statut
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Statut</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  competition.status === 'ACTIVE'
                    ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400'
                    : competition.status === 'COMPLETED'
                    ? 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {competition.status === 'ACTIVE'
                  ? 'Active'
                  : competition.status === 'COMPLETED'
                  ? 'Terminée'
                  : 'Inactive'}
              </span>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // TODO: Éditer la compétition
                  window.location.href = `/agent/competitions/${competition.slug}/edit`;
                }}
              >
                Éditer la compétition
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section des catégories */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Catégories associées
        </h3>
        {competition.categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {competition.categories.map((catId) => (
              <span
                key={catId}
                className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
              >
                Catégorie #{catId.substring(0, 8)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Aucune catégorie associée à cette compétition.
          </p>
        )}
      </div>

      {/* Section des équipes inscrites (future fonctionnalité) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Équipes inscrites
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Cette fonctionnalité sera disponible prochainement.
        </p>
      </div>
    </div>
  );
}