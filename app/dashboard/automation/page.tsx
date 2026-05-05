"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatDateTime } from "@/lib/i18n/formatters";

const automations = [
  {
    nameKey: "automation.name.lowStock",
    triggerKey: "automation.trigger.lowStock",
    triggerValue: { count: 5 },
    status: "active",
    lastRun: new Date("2026-05-05T09:12:00"),
  },
  {
    nameKey: "automation.name.dynamicPrice",
    triggerKey: "automation.trigger.margin",
    triggerValue: { percent: "20%" },
    status: "active",
    lastRun: new Date("2026-05-05T08:40:00"),
  },
  {
    nameKey: "automation.name.abandonedCart",
    triggerKey: "automation.trigger.abandoned",
    triggerValue: { hours: 2 },
    status: "paused",
    lastRun: new Date("2026-05-02T18:30:00"),
  },
  {
    nameKey: "automation.name.restock",
    triggerKey: "automation.trigger.restock",
    triggerValue: { count: 10 },
    status: "active",
    lastRun: new Date("2026-05-05T07:15:00"),
  },
];

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

export default function AutomationPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const kpis = [
    { label: t("automation.kpi.active"), value: "6" },
    { label: t("automation.kpi.executions"), value: "128" },
    { label: t("automation.kpi.alerts"), value: "12" },
    { label: t("automation.kpi.failures"), value: "2" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("automation.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("automation.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("automation.import")}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/automation/new")}
          >
            {t("automation.create")}
          </Button>
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

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-muted-foreground">
              {t("automation.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("automation.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("automation.filter.status")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("automation.filter.all")}</option>
              <option>{t("automation.status.active")}</option>
              <option>{t("automation.status.paused")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("automation.filter.type")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("automation.type.all")}</option>
              <option>{t("automation.type.stock")}</option>
              <option>{t("automation.type.price")}</option>
              <option>{t("automation.type.marketing")}</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">
                  {t("automation.table.automation")}
                </th>
                <th className="px-4 py-3">{t("automation.table.trigger")}</th>
                <th className="px-4 py-3">{t("automation.table.last")}</th>
                <th className="px-4 py-3">{t("automation.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {automations.map((automation) => (
                <tr
                  key={automation.nameKey}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {t(automation.nameKey)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {t(automation.triggerKey, Object.fromEntries(Object.entries(automation.triggerValue).filter(([_, v]) => v !== undefined)) as Record<string, string | number>)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(locale, automation.lastRun)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[automation.status]
                      }`}
                    >
                      {t(`automation.status.${automation.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
