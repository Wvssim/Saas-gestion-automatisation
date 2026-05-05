"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "@/lib/i18n/formatters";

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const kpis = [
    {
      label: t("dashboard.kpi.revenue"),
      value: formatCurrency(locale, 126840, "MAD"),
      delta: formatPercent(locale, 0.12),
    },
    {
      label: t("dashboard.kpi.orders"),
      value: formatNumber(locale, 1284),
      delta: formatPercent(locale, 0.08),
    },
    {
      label: t("dashboard.kpi.aov"),
      value: formatCurrency(locale, 98.7, "MAD"),
      delta: formatPercent(locale, -0.02),
    },
    {
      label: t("dashboard.kpi.conversion"),
      value: formatPercent(locale, 0.036),
      delta: formatPercent(locale, 0.005),
    },
    {
      label: t("dashboard.kpi.products"),
      value: formatNumber(locale, 248),
      delta: t("dashboard.delta.lowStock", { count: 19 }),
    },
    {
      label: t("dashboard.kpi.automations"),
      value: formatNumber(locale, 6),
      delta: t("dashboard.delta.allActive"),
    },
  ];

  const activity = [
    {
      title: t("dashboard.activity.newOrder", { id: "#EGW011546" }),
      meta: `${formatCurrency(locale, 289, "MAD")} · ${t(
        "orders.payment.pending",
      )}`,
      time: formatRelativeTime(locale, -8, "minute"),
    },
    {
      title: t("dashboard.activity.lowStock", {
        product: "Kasbah Wool Coat",
      }),
      meta: t("dashboard.activity.lowStockMeta", { count: 4 }),
      time: formatRelativeTime(locale, -32, "minute"),
    },
    {
      title: t("dashboard.activity.sync"),
      meta: t("dashboard.activity.syncMeta", { count: 128 }),
      time: formatRelativeTime(locale, -2, "hour"),
    },
  ];

  const tasks = [
    {
      label: t("dashboard.task.pendingOrders"),
      status: t("dashboard.task.priority"),
    },
    {
      label: t("dashboard.task.weeklyReport"),
      status: t("dashboard.task.today"),
    },
    {
      label: t("dashboard.task.activatePricing"),
      status: t("dashboard.task.thisWeek"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("dashboard.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("dashboard.refresh")}
          </Button>
          <Button size="sm">{t("dashboard.export")}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-2">
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{kpi.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {t("dashboard.section.performance")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.section.performanceSubtitle")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/analytics")}
              >
                {t("dashboard.viewDetails")}
              </Button>
            </div>
            <div className="mt-6 h-52 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
              Graphique principal (placeholder)
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-foreground">
              {t("dashboard.section.activity")}
            </h2>
            <div className="mt-4 space-y-4">
              {activity.map((item) => (
                <div key={item.title} className="space-y-1">
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {t("dashboard.section.tasks")}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/orders")}
              >
                {t("dashboard.viewOrders")}
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.label}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <span className="text-sm text-foreground">{task.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-base font-semibold text-foreground">
              {t("dashboard.section.system")}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("dashboard.system.database")}
                </span>
                <span className="text-emerald-400">
                  {t("dashboard.system.connected")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("dashboard.system.integrations")}
                </span>
                <span className="text-muted-foreground">
                  {t("dashboard.system.activeCount", { count: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("dashboard.system.sync")}
                </span>
                <span className="text-muted-foreground">
                  {formatRelativeTime(locale, -12, "minute")}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/integrations")}
              >
                {t("dashboard.manageIntegrations")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
