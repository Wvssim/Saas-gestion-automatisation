"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { locales, type Locale } from "@/lib/i18n/locales";
import { Bell, UserCircle } from "lucide-react";

interface HeaderProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs }) => {
  const { user } = useAuth();
  const { t, locale, setLocale, localeLabels } = useI18n();
  const resolvedTitle = title || t("dashboard.title");

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Title & Breadcrumbs */}
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-2 text-sm mb-2"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {resolvedTitle}
          </h1>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-4 ml-4">
          <div className="hidden md:block">
            <label className="sr-only" htmlFor="locale-select">
              {t("settings.language")}
            </label>
            <select
              id="locale-select"
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              {locales.map((lang) => (
                <option key={lang} value={lang}>
                  {localeLabels[lang]}
                </option>
              ))}
            </select>
          </div>
          {/* Notifications (placeholder) */}
          <button
            className="relative p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.plan || "starter"}
              </p>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold flex items-center justify-center hover:shadow-md transition-shadow"
              aria-label="User menu"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="User"
                  className="rounded-full h-full w-full object-cover"
                />
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
