import type { Locale } from "@/lib/i18n/locales";

type RelativeUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";

export function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCurrency(locale: Locale, value: number, currency = "MAD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(locale: Locale, value: Date) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);
}

export function formatTime(locale: Locale, value: Date) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatDateTime(locale: Locale, value: Date) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatRelativeTime(locale: Locale, value: number, unit: RelativeUnit) {
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(value, unit);
}
