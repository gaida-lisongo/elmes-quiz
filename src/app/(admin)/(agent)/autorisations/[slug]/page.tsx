import { Metadata } from 'next';
import { getAgents } from '@/app/actions/user.actions';
import { notFound } from 'next/navigation';
import AgentDetailClient from './AgentClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Agent | ELMESQUIZ`,
        description: `Detail de l'agent`,
    };
}

export default async function AgentDetailPage({ params }: PageProps) {
    const { slug } = await params;

    try {
        const req = await getAgents();

        if (!req?.success) throw new Error(req?.error);

        const agents = req?.data || [];
        const agent = agents.find((a: any) => a._id === slug);

        if (!agent) {
            notFound();
        }

        return <AgentDetailClient agent={agent} />;
    } catch (error) {
        console.error('[AGENT DETAIL PAGE]', error);
        notFound();
    }
}