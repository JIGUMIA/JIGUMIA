import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Brand, SaleEvent, Category, SaleStatus } from '../types';

interface SaleState {
  brands: Brand[];
  saleEvents: SaleEvent[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  selectedCategory: Category | null;
  searchQuery: string;

  fetchAll: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  setSelectedCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  getSaleEventsForDate: (date: string) => SaleEvent[];
  getSaleEventsForBrand: (brandId: string) => SaleEvent[];
  getFilteredBrands: () => Brand[];
}

export const useSaleStore = create<SaleState>((set, get) => ({
  brands: [],
  saleEvents: [],
  loading: false,
  refreshing: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [brandsResult, salesResult] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('sale_events').select('*, brand:brands(*)').order('start_date'),
      ]);

      if (brandsResult.error) throw new Error(brandsResult.error.message);
      if (salesResult.error) throw new Error(salesResult.error.message);

      set({ brands: brandsResult.data ?? [], saleEvents: salesResult.data ?? [] });
    } catch (e: any) {
      set({ error: e.message ?? '데이터를 불러오지 못했어요' });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    set({ refreshing: true, error: null });
    try {
      const [brandsResult, salesResult] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('sale_events').select('*, brand:brands(*)').order('start_date'),
      ]);

      if (brandsResult.error) throw new Error(brandsResult.error.message);
      if (salesResult.error) throw new Error(salesResult.error.message);

      set({ brands: brandsResult.data ?? [], saleEvents: salesResult.data ?? [] });
    } catch (e: any) {
      set({ error: e.message ?? '새로고침에 실패했어요' });
    } finally {
      set({ refreshing: false });
    }
  },

  clearError: () => set({ error: null }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  getSaleEventsForDate: (date: string) => {
    const { saleEvents } = get();
    return saleEvents.filter(
      (event) => date >= event.start_date && date <= event.end_date
    );
  },

  getSaleEventsForBrand: (brandId: string) => {
    const { saleEvents } = get();
    return saleEvents.filter((event) => event.brand_id === brandId);
  },

  getFilteredBrands: () => {
    const { brands, selectedCategory, searchQuery } = get();
    let filtered = brands;
    if (selectedCategory) {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b) => b.name.toLowerCase().includes(q));
    }
    return filtered;
  },
}));
