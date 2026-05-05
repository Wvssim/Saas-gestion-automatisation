"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DashboardKPI,
  DateTrend,
  TopProduct,
  StockAlert,
} from "@/types/dashboard";

const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.error || "Failed to fetch data");
  }
  const data = await res.json();
  return data.data;
};

export const useAnalytics = () => {
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useQuery<{ kpis: DashboardKPI[] }>({
    queryKey: ["analyticsOverview"],
    queryFn: () => fetcher("/api/analytics/overview"),
  });

  const {
    data: trendsData,
    isLoading: isTrendsLoading,
    error: trendsError,
  } = useQuery<{ revenue: DateTrend[]; orders: DateTrend[] }>({
    queryKey: ["analyticsTrends"],
    queryFn: () => fetcher("/api/analytics/trends"),
  });

  const {
    data: topProductsData,
    isLoading: isTopProductsLoading,
    error: topProductsError,
  } = useQuery<TopProduct[]>({
    queryKey: ["topProducts"],
    queryFn: () => fetcher("/api/analytics/products/top"),
  });

  // NOTE: Assuming a stock alerts endpoint exists or will be created
  const {
    data: stockAlertsData,
    isLoading: isStockAlertsLoading,
    error: stockAlertsError,
  } = useQuery<StockAlert[]>({
    queryKey: ["stockAlerts"],
    queryFn: () => fetcher("/api/analytics/stock-alerts"),
    // Mocking data until the endpoint is ready
    initialData: [
      {
        id: "1",
        productName: "Classic Leather Wallet",
        sku: "LW-001",
        currentStock: 8,
        minStock: 10,
        severity: "critical",
      },
      {
        id: "2",
        productName: "Bluetooth Speaker",
        sku: "BS-012",
        currentStock: 22,
        minStock: 20,
        severity: "low",
      },
    ],
  });

  return {
    overview: {
      kpis: overviewData?.kpis ?? [],
    },
    trends: {
      revenue: trendsData?.revenue ?? [],
      orders: trendsData?.orders ?? [],
    },
    topProducts: topProductsData ?? [],
    stockAlerts: stockAlertsData ?? [],
    isLoading: {
      overview: isOverviewLoading,
      trends: isTrendsLoading,
      topProducts: isTopProductsLoading,
      stockAlerts: isStockAlertsLoading,
    },
    error: overviewError || trendsError || topProductsError || stockAlertsError,
  };
};
