import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  biometricEnabled: boolean;
  language: 'ko' | 'en';
  setBiometricEnabled: (enabled: boolean) => void;
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      language: 'ko',
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
