"use client";

import { useI18nContext } from "@/components/providers/LocaleProvider";

export function useI18n() {
  return useI18nContext();
}
