'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { PERMISSION_LABELS } from '@/types/agent';
import { updateAgentPermissions } from '@/app/actions/user.actions';

interface PermissionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  currentPermissions: string[];
  onSuccess: () => void;
}

const ALL_PERMISSIONS = ['categories', 'parties', 'recharges', 'joueurs'];

const permissionColor = (perm: string): 'primary' | 'success' | 'warning' | 'info' => {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    categories: 'primary',
    parties: 'info',
    recharges: 'success',
    joueurs: 'warning',
  };
  return colors[perm] || 'info';
};

export default function PermissionEditor({
  isOpen,
  onClose,
  agentId,
  currentPermissions,
  onSuccess,
}: PermissionEditorProps) {
  const [selected, setSelected] = useState<string[]>(currentPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePermission = (perm: string) => {
    setSelected((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await updateAgentPermissions(agentId, selected);

      if (!result.success) {
        setError(result.error || 'Erreur lors de la mise à jour.');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md" showCloseButton>
      <div className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Modifier les permissions
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Cochez ou décochez les permissions à attribuer à cet agent.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {ALL_PERMISSIONS.map((perm) => {
            const isChecked = selected.includes(perm);
            return (
              <label
                key={perm}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition ${
                  isChecked
                    ? 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePermission(perm)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {PERMISSION_LABELS[perm] || perm}
                  </span>
                </div>
                <Badge size="sm" color={permissionColor(perm)} variant="light">
                  {perm}
                </Badge>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}