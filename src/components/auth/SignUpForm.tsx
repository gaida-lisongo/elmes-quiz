"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import { registerPlayer } from '@/app/actions/auth.actions';

const inputClass =
  'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800';

export default function SignUpForm({ refSlug }: { refSlug?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pseudo, setPseudo] = useState('');
  const [telephone, setTelephone] = useState('');
  const [school, setSchool] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('pseudo', pseudo);
      formData.append('telephone', telephone);
      formData.append('school', school);
      formData.append('password', password);
      if (refSlug) {
        formData.append('ref', refSlug);
      }

      const result = await registerPlayer(formData);

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'inscription.');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour au tableau de bord
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Inscription Joueur
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Créez votre compte pour participer aux quiz.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Pseudo <span className="text-error-500">*</span>
                </Label>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <Label>
                  Téléphone <span className="text-error-500">*</span>
                </Label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+243 81X XXX XXX"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <Label>
                  École / Établissement <span className="text-error-500">*</span>
                </Label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Nom de votre école"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <Label>
                  Mot de passe <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              <div>
                <Button className="w-full" size="sm" disabled={loading} type='submit'>
                  {loading ? 'Inscription...' : "S'inscrire"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Déjà un compte ?{' '}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}