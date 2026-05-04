"use client";

import React from "react";
import { DashboardKPI } from "@/types/dashboard";
import { Card, CardBody } from "@/components/ui/card";

interface KPICardProps {
  kpi: DashboardKPI;
  isLoading?: boolean;
}

const colorClasses = {
  emerald: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
  purple: "text-purple-600 bg-purple-50",
  orange: "text-orange-600 bg-orange-50",
  amber: "text-amber-600 bg-amber-50",
  rose: "text-rose-600 bg-rose-50",
};

const trendColorClasses = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral: "text-gray-600",
};

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    DollarSign: "💵",
    ShoppingCart: "🛒",
    TrendingUp: "📈",
    Target: "🎯",
    Clock: "⏰",
    Star: "⭐",
  };
  return iconMap[iconName] || "📊";
};

const getTrendColor = (trend: number): keyof typeof trendColorClasses => {
  if (trend > 0) return "positive";
  if (trend < 0) return "negative";
  return "neutral";
};

export const KPICard: React.FC<KPICardProps> = ({ kpi, isLoading = false }) => {
  const colorClass =
    colorClasses[kpi.color as keyof typeof colorClasses] || colorClasses.blue;
  const trendColor = getTrendColor(kpi.trend);
  const trendIcon = kpi.trend > 0 ? "↑" : kpi.trend < 0 ? "↓" : "→";

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardBody>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="space-y-2">
        {/* Icon & Label */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium text-muted-foreground`}>
            {kpi.label}
          </span>
          <div className={`text-2xl p-2 rounded-lg ${colorClass}`}>
            {getIconComponent(kpi.icon)}
          </div>
        </div>

        {/* Value */}
        <div className="mt-2">
          <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`text-sm font-semibold ${trendColorClasses[trendColor]}`}
          >
            {trendIcon} {Math.abs(kpi.trend)}%
          </span>
          <span className="text-xs text-muted-foreground">
            {kpi.trendLabel}
          </span>
        </div>

        {/* Bottom accent line */}
        <div
          className={`mt-4 h-1 rounded-full bg-gradient-to-r from-${kpi.color}-500 to-${kpi.color}-600`}
        />
      </CardBody>
    </Card>
  );
};
