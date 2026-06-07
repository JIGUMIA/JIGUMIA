import { createAdminClient } from '@/lib/supabase/server';
import { Tag, Calendar, Users, TrendingUp } from 'lucide-react';
import { computeSaleStatus } from '@/lib/sale-status';

async function getStats() {
  const supabase = createAdminClient();
  const [brands, events, favorites] = await Promise.all([
    supabase.from('brands').select('id', { count: 'exact', head: true }),
    supabase.from('sale_events').select('id, start_date, end_date', { count: 'exact' }),
    supabase.from('user_favorites').select('id', { count: 'exact', head: true }),
  ]);

  const statuses = events.data?.map((e) => computeSaleStatus(e.start_date, e.end_date)) ?? [];
  const activeCount = statuses.filter((s) => s === 'active').length;
  const upcomingCount = statuses.filter((s) => s === 'upcoming').length;

  return {
    brands: brands.count ?? 0,
    totalEvents: events.count ?? 0,
    activeEvents: activeCount,
    upcomingEvents: upcomingCount,
    favorites: favorites.count ?? 0,
  };
}

async function getRecentEvents() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('sale_events')
    .select('*, brand:brands(name, color)')
    .order('created_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function DashboardPage() {
  const [stats, recentEvents] = await Promise.all([getStats(), getRecentEvents()]);

  const statCards = [
    { label: '전체 브랜드', value: stats.brands, icon: Tag, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: '진행 중 세일', value: stats.activeEvents, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: '예정 세일', value: stats.upcomingEvents, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: '즐겨찾기 수', value: stats.favorites, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-slate-400 text-sm mt-1">JIGUMIA 서비스 현황</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${card.bg} mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-slate-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">최근 등록된 세일</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {recentEvents.map((event) => (
            <div key={event.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: event.brand?.color ?? '#6C63FF' }}
                >
                  {event.brand?.name?.[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{event.title}</div>
                  <div className="text-xs text-slate-400">{event.brand?.name} · {event.start_date} ~ {event.end_date}</div>
                </div>
              </div>
              <StatusBadge status={computeSaleStatus(event.start_date, event.end_date)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:   { label: '진행 중', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    upcoming: { label: '예정',    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    ended:    { label: '종료',    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };
  const s = map[status] ?? map.ended;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
      {s.label}
    </span>
  );
}
