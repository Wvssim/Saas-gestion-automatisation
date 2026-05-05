import React from "react";
import { StockAlert } from "@/types/dashboard";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LowStockAlertProps {
  alerts: StockAlert[];
  isLoading?: boolean;
}

const severityStyles = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
    icon: <AlertOctagon className="h-5 w-5" />,
    label: "CRITICAL",
  },
  low: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "LOW",
  },
};

const LoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>Stock Alerts</CardTitle>
      <CardDescription>Products running low on inventory.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);

const EmptyState = () => (
  <Card>
    <CardHeader>
      <CardTitle>Stock Alerts</CardTitle>
      <CardDescription>Products running low on inventory.</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
      <h3 className="text-lg font-semibold text-foreground">All Good!</h3>
      <p className="text-muted-foreground">
        All products have healthy stock levels.
      </p>
    </CardContent>
  </Card>
);

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  alerts,
  isLoading = false,
}) => {
  if (isLoading) return <LoadingSkeleton />;
  if (alerts.length === 0) return <EmptyState />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Alerts</CardTitle>
        <CardDescription>Products running low on inventory.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const styles = severityStyles[alert.severity];
          const stockPercentage = (alert.currentStock / alert.minStock) * 100;

          return (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
              role="alert"
            >
              <div className={styles.text}>{styles.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground truncate">
                    {alert.productName}
                  </p>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${styles.bg} ${styles.text}`}
                  >
                    {styles.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className={styles.text}>{alert.currentStock}</span> /{" "}
                  {alert.minStock} units
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <PackageOpen className="mr-2 h-4 w-4" />
          Manage Inventory
        </Button>
      </CardFooter>
    </Card>
  );
};
