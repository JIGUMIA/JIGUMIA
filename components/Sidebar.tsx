'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tag, CalendarDays, MessageSquare, Globe } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/brands', label: '브랜드', icon: Tag },
  { href: '/sale-events', label: '세일 이벤트', icon: CalendarDays },
  { href: '/inquiries', label: '문의 관리', icon: MessageSquare },
  { href: '/crawl', label: '크롤링', icon: Globe },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-800">
        <span className="text-white font-bold text-lg tracking-tight">지구미아</span>
        <span className="ml-2 text-xs text-slate-400">Admin</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{role}</span>
      </div>
    </aside>
  );
}
