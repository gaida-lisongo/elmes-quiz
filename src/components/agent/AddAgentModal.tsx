'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { useLoader } from '@/context/LoaderContext';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800';

export default function AddAgentModal({ isOpen, onClose, onSuccess }: AddAgentModalProps) {
  const { showLoader, hideLoader } = useLoader();
  const [pseudo, setPseudo] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MOD');
  const [secure, setSecure] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    showLoader("Création de l'agent...");

    try {
      const { createAgent } = await import('@/app/actions/user.actions');
      const result = await createAgent({
        pseudo,
        telephone,
        email: email || undefined,
        role: role as 'MOD' | 'ADMIN',
        secure,
      });

      if (!result.success) {
        setError(result.error || 'Une erreur est survenue.');
        hideLoader();
        return;
      }

      setPseudo('');
      setTelephone('');
      setEmail('');
      setRole('MOD');
      setSecure('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la creation de l'agent.");
    } finally {
      hideLoader();
    }
  };

  const roleOptions = [
    { value: 'MOD', label: 'Moderateur (MOD)' },
    { value: 'ADMIN', label: 'Administrateur (ADMIN)' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg" showCloseButton>
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          Ajouter un agent
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="pseudo">Pseudo *</Label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Ex: Jean123"
              required
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="telephone">Telephone *</Label>
            <input
              id="telephone"
              type="text"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Ex: +243 81X XXX XXX"
              required
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="email">Email (optionnel)</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@exemple.com"
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select
              options={roleOptions}
              placeholder="Selectionner un role"
              defaultValue="MOD"
              onChange={(value) => setRole(value)}
            />
          </div>

          <div>
            <Label htmlFor="secure">Mot de passe *</Label>
            <input
              id="secure"
              type="password"
              value={secure}
              onChange={(e) => setSecure(e.target.value)}
              placeholder="Mot de passe securise"
              required
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Creer l&apos;agent
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}