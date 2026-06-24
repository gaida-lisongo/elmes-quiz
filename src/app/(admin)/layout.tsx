import { redirect } from 'next/navigation';
import { getSession } from '@/lib/utils/auth';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Non connecté → redirection vers la page de connexion
  if (!session) {
    redirect('/signin');
  }

  // Session valide → rendu normal du layout
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
