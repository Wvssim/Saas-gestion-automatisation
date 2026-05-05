"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatRelativeTime } from "@/lib/i18n/formatters";

const integrations = [
  {
    name: "Shopify",
    status: "connected",
    lastSync: { value: -12, unit: "minute" as const },
    descriptionKey: "integrations.description.shopify",
  },
  {
    name: "Meta Ads",
    status: "pending",
    lastSync: null,
    descriptionKey: "integrations.description.meta",
  },
  {
    name: "WhatsApp Business",
    status: "connected",
    lastSync: { value: -2, unit: "hour" as const },
    descriptionKey: "integrations.description.whatsapp",
  },
  {
    name: "Amazon",
    status: "soon",
    lastSync: null,
    descriptionKey: "integrations.description.amazon",
  },
];

const statusBadge: Record<string, string> = {
  connected: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  soon: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
};

export default function IntegrationsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("integrations.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("integrations.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("integrations.catalogs")}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/integrations/shopify")}
          >
            {t("integrations.add")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("integrations.kpi.connected")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">2</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("integrations.kpi.pending")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">1</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("integrations.kpi.soon")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">1</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("integrations.kpi.last")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">12 min</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-muted-foreground">
              {t("integrations.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("integrations.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("integrations.filter.status")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("integrations.filter.all")}</option>
              <option>{t("integrations.status.connected")}</option>
              <option>{t("integrations.status.pending")}</option>
              <option>{t("integrations.status.soon")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("integrations.filter.type")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("integrations.filter.all")}</option>
              <option>{t("integrations.type.marketplace")}</option>
              <option>{t("integrations.type.marketing")}</option>
              <option>{t("integrations.type.support")}</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {integration.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(integration.descriptionKey)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  statusBadge[integration.status]
                }`}
              >
                {t(`integrations.status.${integration.status}`)}
              </span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {t("integrations.lastSync")}: {
                integration.lastSync
                  ? formatRelativeTime(locale, integration.lastSync.value, integration.lastSync.unit)
                  : t("integrations.lastSync.na")
              }
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm">
                {t("integrations.configure")}
              </Button>
              <Button size="sm">{t("integrations.open")}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
