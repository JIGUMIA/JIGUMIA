'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Inquiry } from '@/types';

const TABS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '답변 대기' },
  { value: 'answered', label: '답변 완료' },
];

function statusBadge(status: string) {
  if (status === 'pending') {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
        답변 대기
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
      답변 완료
    </span>
  );
}

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

export default function InquiriesClient({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered =
    tab === 'all' ? inquiries : inquiries.filter((q) => q.status === tab);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleReply(inquiry: Inquiry) {
    const admin_reply = replyMap[inquiry.id] ?? '';
    if (!admin_reply.trim()) return;

    setLoadingId(inquiry.id);
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_reply }),
      });
      if (!res.ok) throw new Error();
      const updated: Inquiry = await res.json();
      setInquiries((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setExpandedId(null);
    } catch {
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(inquiry: Inquiry) {
    if (!confirm(`"${inquiry.title}" 문의를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setInquiries((prev) => prev.filter((q) => q.id !== inquiry.id));
      if (expandedId === inquiry.id) setExpandedId(null);
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">문의 관리</h1>
        <span className="text-sm text-slate-400">{inquiries.length}건</span>
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">이메일</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">제목</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">상태</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">등록일</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((inquiry) => (
              <>
                <tr
                  key={inquiry.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(inquiry.id)}
                >
                  <td className="px-4 py-3 text-slate-300">{inquiry.user_email}</td>
                  <td className="px-4 py-3 text-white font-medium">{inquiry.title}</td>
                  <td className="px-4 py-3">{statusBadge(inquiry.status)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(inquiry.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(inquiry)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => toggleExpand(inquiry.id)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                      >
                        {expandedId === inquiry.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedId === inquiry.id && (
                  <tr key={`${inquiry.id}-detail`} className="border-b border-slate-800 last:border-0">
                    <td colSpan={5} className="px-4 py-4 bg-slate-800/30">
                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 mb-1">문의 내용</p>
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{inquiry.content}</p>
                      </div>

                      {/* Existing reply */}
                      {inquiry.admin_reply && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-xs text-green-400 mb-1">
                            등록된 답변 {inquiry.replied_at ? `(${formatDate(inquiry.replied_at)})` : ''}
                          </p>
                          <p className="text-slate-300 text-sm whitespace-pre-wrap">{inquiry.admin_reply}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500">
                          {inquiry.admin_reply ? '답변 수정' : '답변 등록'}
                        </p>
                        <textarea
                          rows={3}
                          value={replyMap[inquiry.id] ?? inquiry.admin_reply ?? ''}
                          onChange={(e) =>
                            setReplyMap((prev) => ({ ...prev, [inquiry.id]: e.target.value }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                          placeholder="답변 내용을 입력하세요..."
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleReply(inquiry)}
                            disabled={loadingId === inquiry.id}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {loadingId === inquiry.id ? (
                              '등록 중...'
                            ) : (
                              <>
                                <Check size={14} />
                                답변 등록
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                  문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
