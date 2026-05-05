"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { formatCurrency, formatDateTime } from "@/lib/i18n/formatters";

const orders = [
  {
    id: "#EGW011546",
    itemsCount: 1,
    product: "Chemise en lin Aurora - Beige",
    date: new Date("2026-05-05T14:21:00"),
    client: "Nabil Amrani",
    phone: "+212 660 049 807",
    address: "14 Rue Bab Doukala, Marrakech",
    payment: "pending",
    status: "new",
    amount: 289,
  },
  {
    id: "#EGW011545",
    itemsCount: 1,
    product: "Terra Knit Pullover - Moss",
    date: new Date("2026-05-05T10:44:00"),
    client: "Mehdi Tazi",
    phone: "+212 661 334 805",
    address: "Residence Benkhayat, Kenitra",
    payment: "pending",
    status: "autoconfirmation",
    amount: 619,
  },
  {
    id: "#EGW011544",
    itemsCount: 1,
    product: "Nomad Denim Jacket - Indigo M",
    date: new Date("2026-05-05T10:30:00"),
    client: "Rachid Amrani",
    phone: "+212 661 411 467",
    address: "10 Green Town Cgi Les, Bouskoura",
    payment: "pending",
    status: "autoconfirmation",
    amount: 350,
  },
  {
    id: "#EGW011543",
    itemsCount: 1,
    product: "Marrakech Leather Loafers - Tan 42",
    date: new Date("2026-05-05T10:28:00"),
    client: "Rachid Amrani",
    phone: "+212 661 411 467",
    address: "10 Green Town Cgi Les, Bouskoura",
    payment: "pending",
    status: "autoconfirmation",
    amount: 350,
  },
  {
    id: "#EGW011542",
    itemsCount: 2,
    product: "Kasbah Wool Coat - Charcoal L",
    date: new Date("2026-05-05T10:14:00"),
    client: "Sofia El Idrissi",
    phone: "+212 662 708 193",
    address: "12 Rue Ibn Batouta, Tetouan",
    payment: "paid",
    status: "confirmed",
    amount: 1280,
  },
  {
    id: "#EGW011541",
    itemsCount: 1,
    product: "Atlas Cotton Tank - Ivory S",
    date: new Date("2026-05-05T09:52:00"),
    client: "Yassine Haddad",
    phone: "+212 663 921 040",
    address: "Av. Hassan II - R3, Tanger",
    payment: "pending",
    status: "shipped",
    amount: 195,
  },
  {
    id: "#EGW011540",
    itemsCount: 3,
    product: "Aurora Linen Shirt - Sand M",
    date: new Date("2026-05-05T09:31:00"),
    client: "Imane Belkaid",
    phone: "+212 664 556 218",
    address: "Residence Al Manar, Casablanca",
    payment: "paid",
    status: "delivered",
    amount: 867,
  },
];

const paymentBadge: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
};

const statusBadge: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  autoconfirmation:
    "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  shipped: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
  delivered: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
};

export default function OrdersPage() {
  const { t, locale } = useI18n();
  const kpis = [
    { label: t("orders.kpi.total"), value: "68" },
    { label: t("orders.kpi.paid"), value: "54" },
    { label: t("orders.kpi.pending"), value: "11" },
    { label: t("orders.kpi.refunded"), value: "0" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("orders.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("orders.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            {t("orders.import")}
          </Button>
          <Button variant="outline" size="sm">
            {t("orders.export")}
          </Button>
          <Button size="sm">{t("orders.new")}</Button>
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
              {t("orders.searchLabel")}
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("orders.searchPlaceholder")}
            />
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs text-muted-foreground">
              {t("orders.filter.payment")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("orders.filter.allTypes")}</option>
              <option>{t("orders.payment.paid")}</option>
              <option>{t("orders.payment.pending")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("orders.filter.status")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("orders.filter.all")}</option>
              <option>{t("orders.status.new")}</option>
              <option>{t("orders.status.autoconfirmation")}</option>
              <option>{t("orders.status.confirmed")}</option>
              <option>{t("orders.status.shipped")}</option>
              <option>{t("orders.status.delivered")}</option>
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-muted-foreground">
              {t("orders.filter.pipeline")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("orders.filter.pipeline")}</option>
              <option>{t("orders.pipeline.standard")}</option>
              <option>{t("orders.pipeline.express")}</option>
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground">
              {t("orders.filter.users")}
            </label>
            <select className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option>{t("orders.filter.users")}</option>
              <option>{t("orders.users.ops")}</option>
              <option>{t("orders.users.support")}</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3">{t("orders.table.order")}</th>
                <th className="px-4 py-3">{t("orders.table.date")}</th>
                <th className="px-4 py-3">{t("orders.table.client")}</th>
                <th className="px-4 py-3">{t("orders.table.address")}</th>
                <th className="px-4 py-3">{t("orders.table.payment")}</th>
                <th className="px-4 py-3">{t("orders.table.status")}</th>
                <th className="px-4 py-3 text-right">
                  {t("orders.table.amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {order.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.itemsCount === 1
                        ? t("orders.items.one")
                        : t("orders.items.other", {
                            count: order.itemsCount,
                          })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {order.product}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(locale, order.date)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-foreground">{order.client}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {order.address}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        paymentBadge[order.payment]
                      }`}
                    >
                      {t(`orders.payment.${order.payment}`)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[order.status]
                      }`}
                    >
                      {t(`orders.status.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-foreground">
                    {formatCurrency(locale, order.amount, "MAD")}
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
