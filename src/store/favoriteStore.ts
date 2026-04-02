import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

interface FavoriteState {
  // favorites are bound to a specific auth user (avoid cross-account leaks)
  userId: string | null;
  favoriteIds: Set<string>;
  loading: boolean;

  fetchFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, brandId: string) => Promise<void>;
  isFavorite: (brandId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      userId: null,
      favoriteIds: new Set(),
      loading: false,

      fetchFavorites: async (nextUserId: string) => {
        set({ loading: true, userId: nextUserId });

        let lastError: any = null;
        try {
          // retry once to handle "session not fully ready yet" timing
          for (let attempt = 0; attempt < 2; attempt++) {
            const { data, error } = await supabase
              .from('user_favorites')
              .select('brand_id')
              .eq('user_id', nextUserId);

            if (!error && data) {
              set({ favoriteIds: new Set(data.map((f) => f.brand_id)) });
              return;
            }

            lastError = error;
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 400));
            }
          }
        } finally {
          set({ loading: false });
        }

        if (lastError) {
          console.error('[fetchFavorites] failed:', lastError);
        }
      },

      toggleFavorite: async (nextUserId: string, brandId: string) => {
        // keep the local store consistent with the user that performs the action
        if (get().userId !== nextUserId) set({ userId: nextUserId, favoriteIds: new Set() });

        const { favoriteIds } = get();
        const isFav = favoriteIds.has(brandId);

        if (isFav) {
          await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', nextUserId)
            .eq('brand_id', brandId);

          const next = new Set(favoriteIds);
          next.delete(brandId);
          set({ favoriteIds: next });
        } else {
          await supabase
            .from('user_favorites')
            .insert({ user_id: nextUserId, brand_id: brandId });

          const next = new Set(favoriteIds);
          next.add(brandId);
          set({ favoriteIds: next });
        }
      },

      isFavorite: (brandId: string) => {
        return get().favoriteIds.has(brandId);
      },
    }),
    {
      name: 'favorite-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        favoriteIds: Array.from(state.favoriteIds),
      }),
      merge: (persistedState, currentState) => {
        const ids = (persistedState as any)?.favoriteIds;
        return {
          ...currentState,
          userId: (persistedState as any)?.userId ?? currentState.userId,
          favoriteIds: new Set(Array.isArray(ids) ? ids : []),
        };
      },
    }
  )
);
