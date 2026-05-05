"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  localeLabels,
  locales,
  rtlLocales,
  type Locale,
} from "@/lib/i18n/locales";
import { translations } from "@/lib/i18n/translations";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localeLabels: Record<Locale, string>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "sellflow-locale";

function resolveLocale(value?: string): Locale {
  if (value && locales.includes(value as Locale)) {
    return value as Locale;
  }
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setLocaleState(resolveLocale(saved || undefined));
  }, []);

  useEffect(() => {
    const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const template =
        translations[locale]?.[key] ||
        translations[defaultLocale]?.[key] ||
        key;

      if (!params) {
        return template;
      }

      return template.replace(/\{(\w+)\}/g, (match, paramKey) => {
        const value = params[paramKey];
        if (value === undefined || value === null) {
          return match;
        }
        return String(value);
      });
    };
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, localeLabels }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18nContext must be used within LocaleProvider");
  }
  return context;
}
