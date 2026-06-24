'use client';

import React, { useState } from 'react';
import { AgentData, PERMISSION_LABELS } from '@/types/agent';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PermissionEditor from '@/components/agent/PermissionEditor';

interface AgentDetailProps {
    agent: AgentData;
}

const permissionColor = (perm: string): 'primary' | 'success' | 'warning' | 'info' => {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    categories: 'primary',
    parties: 'info',
    recharges: 'success',
    joueurs: 'warning',
  };
  return colors[perm] || 'info';
};

export default function AgentDetailClient({ agent }: AgentDetailProps) {
    const router = useRouter();
    const [permEditorOpen, setPermEditorOpen] = useState(false);
    const user = agent.userId;

    const totalRetraits = agent.retraits.reduce((sum, r) => sum + r.amount, 0);
    const retraitsEnAttente = agent.retraits.filter(r => r.status === 'EN_ATTENTE');
    const retraitsSucces = agent.retraits.filter(r => r.status === 'SUCCES');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <PageBreadcrumb pageTitle="Détail de l'agent" />
                <Link
                    href="/autorisations"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Retour
                </Link>
            </div>

            {/* Carte principale */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
                            {user.photo ? (
                                <Image src={user.photo} alt={user.pseudo} width={80} height={80} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-100 text-2xl font-bold text-brand-600 dark:bg-brand-600/20 dark:text-brand-400">
                                    {user.pseudo.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{user.pseudo}</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.telephone}</p>
                            {user.email && <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>}
                            <div className="mt-2">
                                <Badge size="sm" color={user.role === 'ADMIN' ? 'success' : 'primary'}>
                                    {user.role}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPermEditorOpen(true)}>
                            Modifier les permissions
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid gap-5 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Permissions</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{agent.permissions.length}</p>
                    {agent.permissions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {agent.permissions.map((perm, i) => (
                                <Badge key={i} size="sm" color={permissionColor(perm)}>
                                    {PERMISSION_LABELS[perm] || perm}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total retraits</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{totalRetraits.toLocaleString()} FC</p>
                    <p className="mt-1 text-xs text-gray-400">
                        {retraitsSucces.length} reussis, {retraitsEnAttente.length} en attente
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tickets</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{agent.tickets.length}</p>
                </div>
            </div>

            {/* Historique des retraits */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Historique des retraits</h3>
                {agent.retraits.length === 0 ? (
                    <p className="text-sm text-gray-400">Aucun retrait pour le moment.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Montant</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Statut</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ID Transaction</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {agent.retraits.map((retrait) => (
                                    <tr key={retrait._id}>
                                        <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                                            {retrait.amount.toLocaleString()} FC
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                size="sm"
                                                color={retrait.status === 'SUCCES' ? 'success' : retrait.status === 'ECHEC' ? 'error' : 'warning'}
                                            >
                                                {retrait.status === 'EN_ATTENTE' ? 'En attente' : retrait.status === 'SUCCES' ? 'Succes' : 'Echec'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {retrait.providerTxId || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {formatDate(retrait.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PermissionEditor
                isOpen={permEditorOpen}
                onClose={() => setPermEditorOpen(false)}
                agentId={agent._id}
                currentPermissions={agent.permissions}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}