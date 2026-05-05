"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <LocaleProvider>{children}</LocaleProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
