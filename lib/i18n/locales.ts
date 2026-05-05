export const locales = ["en", "fr", "ar", "es", "hi"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const rtlLocales: Locale[] = ["ar"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Francais",
  ar: "العربية",
  es: "Espanol",
  hi: "हिन्दी",
};
