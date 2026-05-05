"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { locales, type Locale } from "@/lib/i18n/locales";

export default function SettingsPage() {
  const { t, locale, setLocale, localeLabels } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>
        <Button size="sm">{t("settings.save")}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            {t("settings.profile")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.profileSubtitle")}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                {t("settings.name")}
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                defaultValue="SellFlow Admin"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                {t("settings.email")}
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                defaultValue="admin@sellflow.ma"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            {t("settings.billing")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.billingSubtitle")}
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("settings.plan")}
              </span>
              <span className="text-foreground font-medium">Starter</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("settings.nextInvoice")}
              </span>
              <span className="text-foreground font-medium">15 mai</span>
            </div>
            <Button variant="outline" size="sm">
              {t("settings.changePlan")}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground">
            {t("settings.preferences")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.preferencesSubtitle")}
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                {t("settings.language")}
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
            <div>
              <label className="text-xs text-muted-foreground">
                {t("settings.timezone")}
              </label>
              <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option>UTC+01:00 (Casablanca)</option>
                <option>UTC+00:00 (London)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
