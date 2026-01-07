import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translations } from './translations';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof translations.vi;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app_locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Lấy locale từ localStorage hoặc mặc định là 'vi'
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    return savedLocale === 'en' || savedLocale === 'vi' ? savedLocale : 'vi';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  useEffect(() => {
    // Lưu locale vào localStorage mỗi khi thay đổi
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const value: LocaleContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
