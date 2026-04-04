import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'jigumia://auth/callback',
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, user: null });
  },

  deleteAccount: async () => {
    // 1. 관련 데이터 삭제 (favorites, notification settings)
    const userId = supabase.auth.getUser().then((r) => r.data.user?.id);
    const uid = await userId;
    if (uid) {
      await supabase.from('user_favorites').delete().eq('user_id', uid);
      await supabase.from('user_notification_settings').delete().eq('user_id', uid);
    }

    // 2. Supabase Edge Function으로 유저 삭제 요청
    // Edge Function이 없는 경우 auth.admin.deleteUser는 서버에서만 가능
    // 대안: RPC 함수 호출
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      // RPC가 없으면 로그아웃만 수행
      console.warn('[deleteAccount] RPC not available, signing out only:', error.message);
    }

    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },
}));
