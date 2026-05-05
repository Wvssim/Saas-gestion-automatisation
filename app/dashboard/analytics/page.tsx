"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/i18n/formatters";

const topChannels = [
  { label: "Shopify", value: 0.62 },
  { label: "Instagram", value: 0.18 },
  { label: "WhatsApp", value: 0.12 },
  { label: "Marketplace", value: 0.08 },
];

export default function AnalyticsPage() {
  const { t, locale } = useI18n();

  const kpis = [
    {
      label: t("analytics.kpi.revenue"),
      value: formatCurrency(locale, 126840, "MAD"),
    },
    { label: t("analytics.kpi.orders"), value: formatNumber(locale, 1284) },
    { label: t("analytics.kpi.conversion"), value: formatPercent(locale, 0.036) },
    {
      label: t("analytics.kpi.aov"),
      value: formatCurrency(locale, 98.7, "MAD"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("analytics.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("analytics.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("analytics.filter")}
          </Button>
          <Button size="sm">{t("analytics.export")}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-2">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {t("analytics.section.performance")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("analytics.section.performanceSubtitle")}
                </p>
              </div>
              <span className="text-xs text-emerald-400">+12.4%</span>
            </div>
            <div className="mt-6 h-52 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
              Graphique tendance (placeholder)
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-foreground">
              {t("analytics.section.channels")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("analytics.section.channelsSubtitle")}
            </p>
            <div className="mt-6 space-y-4">
              {topChannels.map((channel) => (
                <div key={channel.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{channel.label}</p>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: channel.value }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatPercent(locale, channel.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-foreground">
              {t("analytics.section.cohorts")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("analytics.section.cohortsSubtitle")}
            </p>
            <div className="mt-6 h-44 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
              Tableau cohortes (placeholder)
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-foreground">
              {t("analytics.section.basket")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("analytics.section.basketSubtitle")}
            </p>
            <div className="mt-6 h-44 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
              Bar chart (placeholder)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
