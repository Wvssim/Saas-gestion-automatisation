"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatCurrency, formatNumber, getCurrencyForLocale } from "@/lib/i18n/formatters";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  orders: number;
  revenue: number;
  status: "active" | "vip" | "new" | "inactive";
}

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  vip: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  new: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  inactive: "bg-gray-500/15 text-gray-300 border border-gray-500/30",
};

export default function ClientsPage() {
  const { t, locale } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        const json = await res.json();
        setCustomers(json.data || []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const kpis = [
    { label: t("clients.kpi.total"), value: "1,482" },
    { label: t("clients.kpi.new"), value: "128" },
    { label: t("clients.kpi.loyal"), value: "342" },
    { label: t("clients.kpi.risk"), value: "46" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("clients.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("clients.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("clients.import")}
          </Button>
          <Button size="sm">{t("clients.add")}</Button>
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
              {t("clients.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("clients.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("clients.filter.segment")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("clients.segment.all")}</option>
              <option>{t("clients.segment.new")}</option>
              <option>{t("clients.segment.active")}</option>
              <option>{t("clients.segment.vip")}</option>
              <option>{t("clients.segment.risk")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("clients.filter.source")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("clients.source.all")}</option>
              <option>{t("clients.source.shopify")}</option>
              <option>{t("clients.source.instagram")}</option>
              <option>{t("clients.source.whatsapp")}</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">{t("clients.table.client")}</th>
                <th className="px-4 py-3">{t("clients.table.contact")}</th>
                <th className="px-4 py-3">{t("clients.table.orders")}</th>
                <th className="px-4 py-3">{t("clients.table.revenue")}</th>
                <th className="px-4 py-3">{t("clients.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t("common.loading")}...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t("clients.noData")}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-border hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">
                        {customer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {customer.phone || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {formatNumber(locale, customer.orders)}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {formatCurrency(locale, customer.revenue, getCurrencyForLocale(locale))}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusBadge[customer.status]
                        }`}
                      >
                        {t(`clients.status.${customer.status}`)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
