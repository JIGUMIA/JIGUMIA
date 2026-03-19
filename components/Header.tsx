'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function Header({ email, role }: { email: string; role: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-white leading-none">{email}</p>
          <p className="text-xs text-slate-400 mt-0.5">{role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>
    </header>
  );
}
