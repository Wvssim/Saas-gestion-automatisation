import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Target,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
  kpi: {
    label: string;
    value: string;
    icon: string;
    trend: number;
    trendLabel: string;
    color: string;
  };
  isLoading?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-6 w-6" />,
  ShoppingCart: <ShoppingCart className="h-6 w-6" />,
  TrendingUp: <TrendingUp className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Clock: <Clock className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
};

const colorVariants = {
  emerald: {
    text: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  purple: {
    text: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  orange: {
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  amber: {
    text: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  rose: {
    text: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

const trendVariants = {
  positive: {
    text: "text-emerald-500",
    icon: <ArrowUp className="h-4 w-4" />,
  },
  negative: {
    text: "text-rose-500",
    icon: <ArrowDown className="h-4 w-4" />,
  },
  neutral: {
    text: "text-muted-foreground",
    icon: <ArrowRight className="h-4 w-4" />,
  },
};

export const KPICard: React.FC<KPICardProps> = ({ kpi, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    );
  }

  const color =
    colorVariants[kpi.color as keyof typeof colorVariants] ||
    colorVariants.blue;
  const trendDirection =
    kpi.trend > 0 ? "positive" : kpi.trend < 0 ? "negative" : "neutral";
  const trend = trendVariants[trendDirection];

  return (
    <Card
      className={`transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${color.border}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
        <div className={`p-2 rounded-full ${color.bg} ${color.text}`}>
          {iconMap[kpi.icon] || <TrendingUp className="h-6 w-6" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
        <div className="flex items-center gap-1 text-xs mt-1">
          <span
            className={`flex items-center gap-1 font-semibold ${trend.text}`}
          >
            {trend.icon}
            {Math.abs(kpi.trend)}%
          </span>
          <span className="text-muted-foreground">{kpi.trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
};
