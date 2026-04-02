import { create } from 'zustand';
import { SaleEvent } from '../types';

interface SheetState {
  selectedSale: SaleEvent | null;
  openSheet: (sale: SaleEvent) => void;
  closeSheet: () => void;
}

export const useSheetStore = create<SheetState>((set) => ({
  selectedSale: null,
  openSheet: (sale) => set({ selectedSale: sale }),
  closeSheet: () => set({ selectedSale: null }),
}));
