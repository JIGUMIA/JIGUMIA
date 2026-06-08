'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  category: string;
  website_url: string;
  color: string | null;
  logo_url: string | null;
  description: string | null;
}

const CATEGORIES = ['패션', '뷰티', '라이프스타일', '식품', '전자', '쇼핑몰', '기타'];

const emptyForm = { name: '', category: '', website_url: '', color: '#6C63FF', logo_url: '', description: '' };

export default function BrandsClient({ initialBrands }: { initialBrands: Brand[] }) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setForm({
      name: brand.name,
      category: brand.category,
      website_url: brand.website_url,
      color: brand.color ?? '#6C63FF',
      logo_url: brand.logo_url ?? '',
      description: brand.description ?? '',
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
      logo_url: form.logo_url || null,
      description: form.description || null,
    };

    try {
      const url = editing ? `/api/brands/${editing.id}` : '/api/brands';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      const saved: Brand = await res.json();
      if (editing) {
        setBrands((prev) => prev.map((b) => (b.id === saved.id ? saved : b)));
      } else {
        setBrands((prev) => [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)));
      }
      closeForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(`저장 중 오류가 발생했습니다: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 브랜드를 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">브랜드 관리</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          브랜드 추가
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                {editing ? '브랜드 수정' : '브랜드 추가'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">브랜드명 *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="올리브영"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">카테고리 *</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">웹사이트 URL *</label>
                <input
                  required
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://www.oliveyoung.co.kr"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">브랜드 색상</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="#6C63FF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">로고 URL</label>
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  브랜드 설명
                  <span className="text-slate-500 ml-1">({form.description.length}자)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="브랜드를 소개하는 2-3 문장. 앱에 노출됩니다."
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">브랜드</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">카테고리</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">설명</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">웹사이트</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">색상</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{brand.name}</td>
                <td className="px-4 py-3 text-slate-300">{brand.category}</td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-[280px]">
                  <div className="line-clamp-2" title={brand.description ?? ''}>
                    {brand.description ?? <span className="text-slate-600">-</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 truncate max-w-[200px] inline-block"
                  >
                    {brand.website_url}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-slate-600"
                      style={{ backgroundColor: brand.color ?? '#6C63FF' }}
                    />
                    <span className="text-slate-400 font-mono text-xs">{brand.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(brand)}
                      className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  브랜드가 없습니다. 추가해보세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
