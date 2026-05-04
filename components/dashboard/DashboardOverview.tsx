'use client';

import React from 'react';
import { KPICard } from './KPICard';
import { DashboardKPI } from '@/types/dashboard';
import { SkeletonCard } from '@/components/ui/skeleton';

interface DashboardOverviewProps {
  kpis: DashboardKPI[];
  isLoading?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  kpis,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))
      ) : (
        kpis.map((kpi) => (
          <KPICard
            key={kpi.id}
            kpi={kpi}
            isLoading={false}
          />
        ))
      )}
    </div>
  );
};
