'use client';

import React from 'react';
import { StockAlert } from '@/types/dashboard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { SkeletonTable } from '@/components/ui/skeleton';

interface LowStockAlertProps {
  alerts: StockAlert[];
  isLoading?: boolean;
}

const getSeverityStyles = (severity: 'low' | 'critical') => {
  if (severity === 'critical') {
    return {
      container: 'border-l-4 border-red-500 bg-red-50',
      badge: 'bg-red-100 text-red-800',
      icon: '⚠️',
      label: 'CRITICAL',
    };
  }
  return {
    container: 'border-l-4 border-amber-500 bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    icon: '⏱️',
    label: 'LOW',
  };
};

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  alerts,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Stock Alerts" description="Inventory warnings" />
        <CardBody>
          <SkeletonTable rows={3} />
        </CardBody>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader title="Stock Alerts" description="Inventory warnings" />
        <CardBody className="py-8">
          <div className="text-center">
            <span className="text-4xl mb-2 block">✅</span>
            <p className="text-gray-600 font-medium">
              All products have healthy stock levels
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Stock Alerts" description="Inventory warnings" />
      <CardBody>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const stockPercentage = (alert.currentStock / alert.minStock) * 100;

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg ${styles.container}`}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{styles.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {alert.productName}
                      </h4>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${styles.badge}`}
                      >
                        {styles.label}
                      </span>
                    </div>

                    {alert.sku && (
                      <p className="text-xs text-gray-600 mb-2">
                        SKU: {alert.sku}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {alert.currentStock} / {alert.minStock} units
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          alert.severity === 'critical'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        role="progressbar"
                        aria-valuenow={alert.currentStock}
                        aria-valuemin={0}
                        aria-valuemax={alert.minStock}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Manage inventory"
          >
            📦 Manage Inventory
          </button>
        </div>
      </CardBody>
    </Card>
  );
};
