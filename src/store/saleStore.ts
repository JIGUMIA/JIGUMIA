import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Brand, SaleEvent, Category, SaleStatus } from '../types';

interface SaleState {
  brands: Brand[];
  saleEvents: SaleEvent[];
  loading: boolean;
  selectedCategory: Category | null;
  searchQuery: string;

  fetchAll: () => Promise<void>;
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
  selectedCategory: null,
  searchQuery: '',

  fetchAll: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        (async () => {
          const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');
          if (error) console.error('[fetchBrands] error:', JSON.stringify(error));
          else if (data) {
            console.log('[fetchBrands] 성공, 브랜드 수:', data.length);
            set({ brands: data });
          }
        })(),
        (async () => {
          const { data, error } = await supabase
            .from('sale_events')
            .select('*, brand:brands(*)')
            .order('start_date');
          if (error) console.error('[fetchSaleEvents] error:', JSON.stringify(error));
          else if (data) {
            console.log('[fetchSaleEvents] 성공, 세일 수:', data.length);
            set({ saleEvents: data });
          }
        })(),
      ]);
    } finally {
      set({ loading: false });
    }
  },

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
