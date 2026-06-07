'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { computeSaleStatus } from '@/lib/sale-status';
import type { SaleStatus } from '@/types';

interface Brand {
  id: string;
  name: string;
  color: string | null;
}

interface SaleEvent {
  id: string;
  brand_id: string;
  title: string;
  start_date: string;
  end_date: string;
  description: string | null;
  status: SaleStatus;
  brand: Brand | null;
}

const STATUSES: { value: SaleStatus; label: string; className: string }[] = [
  { value: 'upcoming', label: '예정', className: 'bg-blue-500/20 text-blue-400' },
  { value: 'active', label: '진행중', className: 'bg-green-500/20 text-green-400' },
  { value: 'ended', label: '종료', className: 'bg-slate-500/20 text-slate-400' },
];

const emptyForm = {
  brand_id: '',
  title: '',
  start_date: '',
  end_date: '',
  description: '',
};

function statusBadge(status: SaleStatus) {
  const s = STATUSES.find((x) => x.value === status);
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${s?.className ?? ''}`}>
      {s?.label ?? status}
    </span>
  );
}

export default function SaleEventsClient({
  initialEvents,
  brands,
}: {
  initialEvents: SaleEvent[];
  brands: Brand[];
}) {
  const [events, setEvents] = useState<SaleEvent[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SaleEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(ev: SaleEvent) {
    setEditing(ev);
    setForm({
      brand_id: ev.brand_id,
      title: ev.title,
      start_date: ev.start_date,
      end_date: ev.end_date,
      description: ev.description ?? '',
    });
    setShowForm(true);
    setError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = {
      ...form,
      description: form.description || null,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/sale-events/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const updated: SaleEvent = await res.json();
        const brand = brands.find((b) => b.id === updated.brand_id) ?? null;
        setEvents((prev) =>
          prev.map((ev) => (ev.id === updated.id ? { ...updated, brand } : ev))
        );
      } else {
        const res = await fetch('/api/sale-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const created: SaleEvent = await res.json();
        const brand = brands.find((b) => b.id === created.brand_id) ?? null;
        setEvents((prev) => [{ ...created, brand }, ...prev]);
      }
      closeForm();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 이벤트를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/sale-events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  const eventsWithStatus = events.map((ev) => ({
    ...ev,
    computedStatus: computeSaleStatus(ev.start_date, ev.end_date),
  }));

  const filtered =
    filter === 'all'
      ? eventsWithStatus
      : eventsWithStatus.filter((ev) => ev.computedStatus === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">세일 이벤트 관리</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          이벤트 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {[{ value: 'all', label: '전체' }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                {editing ? '이벤트 수정' : '이벤트 추가'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">브랜드 *</label>
                <select
                  required
                  value={form.brand_id}
                  onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">선택하세요</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">제목 *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="봄 시즌 대세일"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">시작일 *</label>
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">종료일 *</label>
                  <input
                    required
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {form.start_date && form.end_date && (
                <div className="text-xs text-slate-400">
                  상태는 날짜에 따라 자동 계산됩니다 →{' '}
                  {statusBadge(computeSaleStatus(form.start_date, form.end_date))}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">설명</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="세일 이벤트에 대한 설명..."
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? '저장 중...' : <><Check size={15} /> 저장</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">브랜드</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">제목</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">기간</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">상태</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev) => (
              <tr key={ev.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ev.brand?.color ?? '#6C63FF' }}
                    />
                    <span className="text-slate-300">{ev.brand?.name ?? '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-medium">{ev.title}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {ev.start_date} ~ {ev.end_date}
                </td>
                <td className="px-4 py-3">{statusBadge(ev.computedStatus)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(ev)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  이벤트가 없습니다. 추가해보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
