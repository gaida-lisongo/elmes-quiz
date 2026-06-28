'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CompetitionOutput } from '@/app/actions/competition.actions';
import { EquipeData } from '@/app/actions/equipe.actions';
import {
  initiateEnrollementAction,
  checkEnrollementStatusAction,
} from '@/app/actions/enrollement.actions';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import {
  ShootingStarIcon,
  DollarLineIcon,
  GroupIcon,
  CalenderIcon,
  ShootingStarIcon as TrophyIcon,
} from '@/icons';

interface CompetitionEnrollmentClientProps {
  competition: CompetitionOutput;
  enrollementAmount: number;
  isAuthenticated: boolean;
  equipe: EquipeData | null;
}

export default function CompetitionEnrollmentClient({
  competition,
  enrollementAmount,
  isAuthenticated,
  equipe,
}: CompetitionEnrollmentClientProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrollementId, setEnrollementId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const formattedDate = new Date(competition.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isChef = equipe?.isChef ?? false;
  const canEnroll = isAuthenticated && equipe && isChef;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canEnroll) {
      setError('Vous devez être chef d\'une équipe pour inscrire votre équipe.');
      return;
    }

    if (!phone.trim()) {
      setError('Veuillez saisir un numéro de téléphone Mobile Money.');
      return;
    }

    setLoading(true);
    try {
      const result = await initiateEnrollementAction(competition._id, phone.trim());
      if (result.success) {
        setEnrollementId(result.enrollementId ?? null);
        setOrderNumber(result.orderNumber ?? null);
        setSuccess(result.message || 'Paiement initié.');
      } else {
        setError(result.error || 'Échec de l\'inscription.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!enrollementId) return;
    setChecking(true);
    setError(null);
    try {
      const result = await checkEnrollementStatusAction(enrollementId);
      if (result.success) {
        setSuccess(result.message || 'Statut mis à jour.');
        if (result.status === 'CONFIRMED') {
          router.refresh();
        }
      } else {
        setError(result.error || 'Impossible de vérifier le statut.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
            {competition.designation}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Inscrivez votre équipe et participez à la compétition
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Description de la compétition */}
          <div className="space-y-6">
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
                <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                  À propos de cette compétition
                </h2>
                {competition.description ? (
                  <p className="mb-6 whitespace-pre-line text-gray-600 dark:text-gray-400">
                    {competition.description}
                  </p>
                ) : (
                  <p className="mb-6 text-gray-500 dark:text-gray-400">
                    Aucune description disponible.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                      <DollarLineIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cagnotte</p>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {competition.cagnotte.toLocaleString()} FC
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-4 dark:bg-purple-500/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      <GroupIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Parties</p>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {competition.parties}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      <CalenderIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Créée le</p>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'inscription */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
                  <TrophyIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    Inscription
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Montant : {enrollementAmount.toLocaleString()} FC
                  </p>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mb-4 rounded-lg bg-warning-50 p-4 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">
                  Veuillez vous{' '}
                  <a href="/signin" className="font-medium underline">
                    connecter
                  </a>{' '}
                  pour inscrire votre équipe.
                </div>
              )}

              {isAuthenticated && !equipe && (
                <div className="mb-4 rounded-lg bg-warning-50 p-4 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">
                  Vous devez faire partie d&apos;une équipe pour vous inscrire.{' '}
                  <a href="/equipe" className="font-medium underline">
                    Créer ou rejoindre une équipe
                  </a>
                </div>
              )}

              {isAuthenticated && equipe && !isChef && (
                <div className="mb-4 rounded-lg bg-warning-50 p-4 text-sm text-warning-700 dark:bg-warning-500/15 dark:text-warning-400">
                  Seul le chef d&apos;équipe peut inscrire l&apos;équipe à une compétition.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/15 dark:text-error-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-lg bg-success-50 p-4 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-400">
                  {success}
                </div>
              )}

              {orderNumber && (
                <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <p>
                    <span className="font-medium">Référence :</span> {orderNumber}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Numéro Mobile Money *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="243XXXXXXXXX"
                    disabled={!canEnroll || !!enrollementId}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format international, ex: 243810000000
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Total à payer :</span>{' '}
                    {enrollementAmount.toLocaleString()} FC
                  </p>
                </div>

                {!enrollementId ? (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !canEnroll}
                  >
                    {loading ? 'Traitement...' : 'Payer et inscrire mon équipe'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCheckStatus}
                    disabled={checking}
                  >
                    {checking ? 'Vérification...' : 'Vérifier le statut du paiement'}
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
