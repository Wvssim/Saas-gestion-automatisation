'use client';

import React from 'react';
import { KPICard } from "./KPICard";
import { DashboardKPI } from "@/types/dashboard";

interface DashboardOverviewProps {
  kpis: DashboardKPI[];
  isLoading?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  kpis,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <KPICard
              key={i}
              kpi={{
                id: `skeleton-${i}`,
                label: "",
                value: "",
                icon: "",
                trend: 0,
                trendLabel: "",
                color: "blue",
              }}
              isLoading={true}
            />
          ))
        : kpis.map((kpi) => <KPICard key={kpi.id} kpi={kpi} />)}
    </div>
  );
};
