"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatCurrency, formatNumber } from "@/lib/i18n/formatters";

const products = [
  {
    sku: "SF-LIN-001",
    name: "Chemise en lin Aurora",
    variant: "Beige / M",
    price: 289,
    stock: 18,
    status: "active",
  },
  {
    sku: "SF-KNT-014",
    name: "Terra Knit Pullover",
    variant: "Moss / L",
    price: 619,
    stock: 6,
    status: "low",
  },
  {
    sku: "SF-DNM-043",
    name: "Nomad Denim Jacket",
    variant: "Indigo / M",
    price: 350,
    stock: 0,
    status: "out",
  },
  {
    sku: "SF-SHO-021",
    name: "Marrakech Leather Loafers",
    variant: "Tan / 42",
    price: 350,
    stock: 24,
    status: "active",
  },
  {
    sku: "SF-COA-006",
    name: "Kasbah Wool Coat",
    variant: "Charcoal / L",
    price: 1280,
    stock: 4,
    status: "low",
  },
  {
    sku: "SF-TSH-030",
    name: "Atlas Cotton Tank",
    variant: "Ivory / S",
    price: 195,
    stock: 31,
    status: "active",
  },
];

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  low: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  out: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

export default function ProductsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const kpis = [
    { label: t("products.kpi.total"), value: "248" },
    { label: t("products.kpi.active"), value: "221" },
    { label: t("products.kpi.low"), value: "19" },
    { label: t("products.kpi.out"), value: "8" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("products.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("products.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            {t("products.import")}
          </Button>
          <Button variant="outline" size="sm">
            {t("products.export")}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/integrations/shopify")}
          >
            {t("products.sync")}
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
              {t("products.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("products.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("products.filter.status")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("products.filter.all")}</option>
              <option>{t("products.status.active")}</option>
              <option>{t("products.status.low")}</option>
              <option>{t("products.status.out")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("products.filter.collection")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("products.collection.all")}</option>
              <option>{t("products.collection.essentials")}</option>
              <option>{t("products.collection.spring")}</option>
              <option>{t("products.collection.premium")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("products.filter.channel")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("products.channel.all")}</option>
              <option>{t("products.channel.shopify")}</option>
              <option>{t("products.channel.pos")}</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">{t("products.table.product")}</th>
                <th className="px-4 py-3">{t("products.table.sku")}</th>
                <th className="px-4 py-3">{t("products.table.variant")}</th>
                <th className="px-4 py-3">{t("products.table.price")}</th>
                <th className="px-4 py-3">{t("products.table.stock")}</th>
                <th className="px-4 py-3">{t("products.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.sku}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {product.sku}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {product.variant}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {formatCurrency(locale, product.price, "MAD")}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {formatNumber(locale, product.stock)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[product.status]
                      }`}
                    >
                      {t(`products.status.${product.status}`)}
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
