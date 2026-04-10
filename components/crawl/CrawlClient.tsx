'use client';

import { useState } from 'react';
import { Globe, Loader2, Check, AlertCircle } from 'lucide-react';
import type { CrawlResult, Platform } from '@/lib/crawlers/types';

interface Brand {
  id: string;
  name: string;
  color: string | null;
}

interface EditableResult extends CrawlResult {
  selected: boolean;
  brand_id: string;
  editing_title: string;
  editing_start_date: string;
  editing_end_date: string;
  editing_discount_rate: string;
  editing_description: string;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  oliveyoung: '올리브영',
  musinsa: '무신사',
  '29cm': '29cm',
};

export default function CrawlClient({ brands }: { brands: Brand[] }) {
  const [platform, setPlatform] = useState<Platform>('oliveyoung');
  const [results, setResults] = useState<EditableResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCrawl() {
    setLoading(true);
    setErrors([]);
    setMessage(null);
    setResults([]);

    try {
      const res = await fetch(`/api/crawl/${platform}`, { method: 'POST' });
      const data = await res.json();

      if (data.errors?.length) setErrors(data.errors);

      const editable: EditableResult[] = (data.results ?? []).map((r: CrawlResult) => ({
        ...r,
        selected: true,
        brand_id: '',
        editing_title: r.title,
        editing_start_date: r.start_date ?? '',
        editing_end_date: r.end_date ?? '',
        editing_discount_rate: r.discount_rate ?? '',
        editing_description: r.description,
      }));

      setResults(editable);
      if (editable.length === 0 && !data.errors?.length) {
        setMessage('크롤링 결과가 없습니다.');
      }
    } catch {
      setErrors(['크롤링 요청 중 오류가 발생했습니다.']);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(idx: number) {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
    );
  }

  function toggleSelectAll() {
    const allSelected = results.every((r) => r.selected);
    setResults((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  }

  function updateField(idx: number, field: string, value: string) {
    setResults((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    const selected = results.filter((r) => r.selected);
    if (selected.length === 0) {
      setMessage('저장할 항목을 선택해주세요.');
      return;
    }

    const missingBrand = selected.find((r) => !r.brand_id);
    if (missingBrand) {
      setMessage('모든 선택 항목에 브랜드를 지정해주세요.');
      return;
    }

    const missingDate = selected.find((r) => !r.editing_start_date || !r.editing_end_date);
    if (missingDate) {
      setMessage('모든 선택 항목에 시작일/종료일을 입력해주세요.');
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const events = selected.map((r) => ({
        brand_id: r.brand_id,
        title: r.editing_title,
        start_date: r.editing_start_date,
        end_date: r.editing_end_date,
        discount_rate: r.editing_discount_rate || null,
        description: r.editing_description || null,
        status: 'upcoming' as const,
      }));

      const res = await fetch('/api/sale-events/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(`저장 실패: ${err.error}`);
        return;
      }

      setMessage(`${selected.length}개 이벤트가 저장되었습니다.`);
      setResults([]);
    } catch {
      setMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const selectedCount = results.filter((r) => r.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">세일 크롤링</h1>
      </div>

      {/* Platform tabs + crawl button */}
      <div className="flex items-center gap-3">
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              setPlatform(p);
              setResults([]);
              setErrors([]);
              setMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === p
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}

        <button
          onClick={handleCrawl}
          disabled={loading}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
          {loading ? '크롤링 중...' : '크롤링 실행'}
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 space-y-1">
          {errors.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
          {message}
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={results.every((r) => r.selected)}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-600"
                    />
                  </th>
                  <th className="p-3 text-left">브랜드</th>
                  <th className="p-3 text-left">제목</th>
                  <th className="p-3 text-left">시작일</th>
                  <th className="p-3 text-left">종료일</th>
                  <th className="p-3 text-left">할인율</th>
                  <th className="p-3 text-left">설명</th>
                  <th className="p-3 text-left">원본</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-800 ${
                      r.selected ? 'bg-slate-800/50' : 'opacity-50'
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={() => toggleSelect(idx)}
                        className="rounded border-slate-600"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={r.brand_id}
                        onChange={(e) => updateField(idx, 'brand_id', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="">선택</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_title}
                        onChange={(e) => updateField(idx, 'editing_title', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={r.editing_start_date}
                        onChange={(e) => updateField(idx, 'editing_start_date', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={r.editing_end_date}
                        onChange={(e) => updateField(idx, 'editing_end_date', e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_discount_rate}
                        onChange={(e) => updateField(idx, 'editing_discount_rate', e.target.value)}
                        className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={r.editing_description}
                        onChange={(e) => updateField(idx, 'editing_description', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-xs underline"
                      >
                        링크
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900">
            <span className="text-sm text-slate-400">
              {selectedCount}개 선택됨
            </span>
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {saving ? '저장 중...' : '선택 항목 저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
