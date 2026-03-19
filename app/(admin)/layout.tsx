import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login?error=unauthorized');

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header email={user.email ?? ''} role={profile.role} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
