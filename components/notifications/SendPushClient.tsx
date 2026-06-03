'use client';

import { useMemo, useState } from 'react';
import { Bell, Send, Users, Tag } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  color: string | null;
}

interface RecentItem {
  id: string;
  title: string;
  body: string;
  type: string;
  sent_at: string;
  brand_id: string | null;
}

interface Props {
  brands: Brand[];
  tokenCount: number;
  recentMarketing: RecentItem[];
}

const TITLE_MAX = 65;
const BODY_MAX = 240;

export default function SendPushClient({ brands, tokenCount, recentMarketing }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [target, setTarget] = useState<'all' | 'brand'>('all');
  const [brandId, setBrandId] = useState<string>(brands[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ sent: number; dead: number; target_count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const canSubmit =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    title.length <= TITLE_MAX &&
    body.length <= BODY_MAX &&
    (target === 'all' || (target === 'brand' && brandId));

  const targetLabel = target === 'all'
    ? `전체 알림 켠 유저`
    : `${brandById.get(brandId)?.name ?? ''} 관심 등록 유저`;

  const doSend = async () => {
    setConfirmOpen(false);
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          deep_link: deepLink.trim() || undefined,
          target,
          brand_id: target === 'brand' ? brandId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? '발송 실패');
      } else {
        setResult(json);
        setTitle('');
        setBody('');
        setDeepLink('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '네트워크 오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell size={24} />
          푸시 알림 발송
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          관심 브랜드 알림 외에, 운영자가 직접 푸시를 발송할 수 있어요.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Users size={16} />} label="등록된 디바이스" value={`${tokenCount}대`} />
        <Stat icon={<Tag size={16} />} label="브랜드 수" value={`${brands.length}개`} />
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
        <Field label="제목" hint={`${title.length}/${TITLE_MAX}`}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="예: 오늘만 특별 혜택!"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </Field>

        <Field label="본문" hint={`${body.length}/${BODY_MAX}`}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            rows={3}
            placeholder="예: 지금 앱에서 확인하세요"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
        </Field>

        <Field label="딥링크" hint="선택 — jigumia:// 로 시작">
          <input
            value={deepLink}
            onChange={(e) => setDeepLink(e.target.value)}
            placeholder="jigumia://sale/<sale_id> 또는 jigumia://brand/<brand_id>"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </Field>

        <Field label="발송 대상">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={target === 'all'}
                onChange={() => setTarget('all')}
                className="accent-indigo-500"
              />
              <span className="text-sm text-slate-200">전체 유저 (푸시 켠 유저만)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={target === 'brand'}
                onChange={() => setTarget('brand')}
                className="accent-indigo-500"
              />
              <span className="text-sm text-slate-200">특정 브랜드 관심 유저</span>
            </label>
            {target === 'brand' && (
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="ml-6 mt-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
        </Field>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            발송 대상: <span className="text-slate-200 font-medium">{targetLabel}</span>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
            {submitting ? '발송 중…' : '발송하기'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-emerald-700 bg-emerald-900/20 p-4">
          <div className="text-sm text-emerald-300 font-semibold">발송 완료</div>
          <div className="mt-1 text-xs text-emerald-200/80">
            대상 유저: {result.target_count}명 · 발송: {result.sent}건 · 만료 토큰 정리: {result.dead}건
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-700 bg-rose-900/20 p-4">
          <div className="text-sm text-rose-300 font-semibold">발송 실패</div>
          <div className="mt-1 text-xs text-rose-200/80">{error}</div>
        </div>
      )}

      {/* Recent */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-white mb-3">최근 발송 내역 (marketing)</h2>
        {recentMarketing.length === 0 ? (
          <div className="text-xs text-slate-500">아직 발송한 마케팅 푸시가 없어요</div>
        ) : (
          <ul className="space-y-3">
            {recentMarketing.map((r) => (
              <li key={r.id} className="border-l-2 border-indigo-500 pl-3">
                <div className="text-sm text-slate-200 font-medium">{r.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{r.body}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {new Date(r.sent_at).toLocaleString('ko-KR')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white">발송 확인</h3>
            <p className="mt-2 text-sm text-slate-300">
              <span className="text-white font-medium">{targetLabel}</span>에게 푸시를 발송합니다.
            </p>
            <div className="mt-4 rounded-lg bg-slate-950 border border-slate-700 p-3 space-y-1">
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-xs text-slate-400">{body}</div>
              {deepLink && <div className="text-[10px] text-indigo-400 mt-1">{deepLink}</div>}
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"
              >
                취소
              </button>
              <button
                onClick={doSend}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500"
              >
                발송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-white">{value}</div>
    </div>
  );
}
