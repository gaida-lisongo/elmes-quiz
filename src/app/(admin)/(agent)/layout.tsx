import { redirect } from 'next/navigation';
import { getSession } from '@/lib/utils/auth';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Un joueur (PLAYER) n'a pas accès aux pages agent
  if (session?.role === 'PLAYER') {
    redirect('/');
  }

  return <>{children}</>;
}