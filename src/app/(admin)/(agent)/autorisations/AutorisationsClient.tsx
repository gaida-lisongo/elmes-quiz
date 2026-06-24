'use client';

import React, { useState, useMemo } from 'react';
import AgentCard from '@/components/agent/AgentCard';
import AddAgentModal from '@/components/agent/AddAgentModal';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';

interface PageProps {
    agents: any[];
}

export default function AutorisationsPage({ agents }: PageProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredAgents = useMemo(() => {
        if (!search.trim()) return agents;
        const q = search.toLowerCase();
        return agents.filter(
            (a: any) =>
                a.userId?.pseudo?.toLowerCase().includes(q) ||
                a.userId?.telephone?.toLowerCase().includes(q) ||
                a.userId?.email?.toLowerCase().includes(q) ||
                a.permissions?.some((p: string) => p.toLowerCase().includes(q))
        );
    }, [agents, search]);

    return (
        <div className="space-y-6">
            {/* Barre d'outils : recherche + ajout */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <svg
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un agent..."
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    startIcon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    }
                >
                    Ajouter un agent
                </Button>
            </div>

            {/* Grille des agents */}
            {filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {search
                            ? 'Aucun agent ne correspond a votre recherche.'
                            : 'Aucun agent pour le moment.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAgents.map((agent: any) => (
                        <AgentCard key={agent._id} agent={agent} />
                    ))}
                </div>
            )}

            <AddAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}