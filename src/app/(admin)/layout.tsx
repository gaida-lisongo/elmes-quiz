import { redirect } from 'next/navigation';
import { getSession } from '@/lib/utils/auth';
import { getCurrentUserDetailed } from '@/app/actions/auth.actions';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/signin');
  }

  const user = await getCurrentUserDetailed();

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
