"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { useSession, useUserPlan } from "@/hooks/useSession";
import { locales, type Locale } from "@/lib/i18n/locales";

export default function SettingsPage() {
  const { t, locale, setLocale, localeLabels } = useI18n();
  const { data: session } = useSession();
  const { plan } = useUserPlan();
  const [billingError, setBillingError] = useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");

  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : "Starter";

  const openCheckout = async () => {
    setBillingError(null);
    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.redirectUrl) {
          window.location.href = payload.redirectUrl;
          return;
        }
        throw new Error(payload?.error || "Checkout failed");
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      throw new Error("Checkout url missing");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      setBillingError(message);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const openPortal = async () => {
    setBillingError(null);
    setIsPortalLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.redirectUrl) {
          window.location.href = payload.redirectUrl;
          return;
        }
        throw new Error(payload?.error || "Billing portal failed");
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      throw new Error("Billing portal url missing");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Billing portal failed";
      setBillingError(message);
    } finally {
      setIsPortalLoading(false);
    }
  };

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
              <span className="text-foreground font-medium">{planLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("settings.nextInvoice")}
              </span>
              <span className="text-foreground font-medium">
                {session?.user?.email ? "After upgrade" : "--"}
              </span>
            </div>
            {plan !== "starter" && (
              <div>
                <label className="text-xs text-muted-foreground">
                  Upgrade to
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={selectedPlan}
                  onChange={(e) =>
                    setSelectedPlan(e.target.value as "pro" | "enterprise")
                  }
                >
                  <option value="pro">Pro - $39/month</option>
                  <option value="enterprise">Enterprise - $149/month</option>
                </select>
              </div>
            )}
            {billingError ? (
              <p className="text-xs text-red-400">{billingError}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                isLoading={isCheckoutLoading}
                onClick={openCheckout}
              >
                {t("settings.changePlan")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isPortalLoading}
                onClick={openPortal}
              >
                Manage billing
              </Button>
            </div>
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
