"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatDateTime, formatTime } from "@/lib/i18n/formatters";

const reports = [
  {
    name: "Performance hebdomadaire",
    type: "PDF",
    schedule: "weekly",
    lastRun: new Date("2026-04-29T08:00:00"),
    status: "active",
  },
  {
    name: "Catalogue produits",
    type: "CSV",
    schedule: "daily",
    lastRun: new Date("2026-05-05T07:15:00"),
    status: "active",
  },
  {
    name: "Commandes par region",
    type: "XLSX",
    schedule: "friday",
    lastRun: new Date("2026-05-02T19:30:00"),
    status: "paused",
  },
];

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
};

export default function ReportsPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("reports.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("reports.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("reports.schedule")}
          </Button>
          <Button size="sm">{t("reports.generate")}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("reports.kpi.active")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">2</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("reports.kpi.paused")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">1</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("reports.kpi.last")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">
            {formatTime(locale, new Date("2026-05-05T07:15:00"))}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">
            {t("reports.kpi.format")}
          </p>
          <p className="text-2xl font-semibold text-foreground mt-2">CSV</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-muted-foreground">
              {t("reports.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("reports.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("reports.filter.type")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("reports.filter.all")}</option>
              <option>PDF</option>
              <option>CSV</option>
              <option>XLSX</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("reports.filter.status")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("reports.filter.all")}</option>
              <option>{t("reports.status.active")}</option>
              <option>{t("reports.status.paused")}</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">{t("reports.table.report")}</th>
                <th className="px-4 py-3">{t("reports.table.type")}</th>
                <th className="px-4 py-3">{t("reports.table.schedule")}</th>
                <th className="px-4 py-3">{t("reports.table.last")}</th>
                <th className="px-4 py-3">{t("reports.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.name}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {report.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {report.type}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {t(`reports.schedule.${report.schedule}`)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(locale, report.lastRun)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[report.status]
                      }`}
                    >
                      {t(`reports.status.${report.status}`)}
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
