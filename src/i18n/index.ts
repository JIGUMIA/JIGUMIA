import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ko from './ko.json';
import en from './en.json';

// 저장된 언어 설정을 비동기로 불러와서 적용
async function getSavedLanguage(): Promise<'ko' | 'en'> {
  try {
    const raw = await AsyncStorage.getItem('settings-store');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.language) return parsed.state.language;
    }
  } catch {}
  return 'ko'; // 기본값: 한국어
}

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: 'ko', // 기본값 한국어로 시작
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});

// 저장된 설정이 있으면 적용
getSavedLanguage().then((lang) => {
  if (lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;
