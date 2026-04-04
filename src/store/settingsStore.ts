import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  biometricEnabled: boolean;
  language: 'ko' | 'en';
  hasSeenOnboarding: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  setLanguage: (lang: 'ko' | 'en') => void;
  setHasSeenOnboarding: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      language: 'ko',
      hasSeenOnboarding: false,
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setLanguage: (lang) => set({ language: lang }),
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
