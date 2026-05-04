'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { SkeletonChart } from '@/components/ui/skeleton';

interface OrdersChartProps {
  data: { date: string; orders: number }[];
  isLoading?: boolean;
}

export const OrdersChart: React.FC<OrdersChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Orders Overview" description="Last 7 days" />
        <CardBody>
          <SkeletonChart />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Orders Overview" description="Last 7 days" />
      <CardBody>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value, 'Orders']}
              labelStyle={{ color: '#111827' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar
              dataKey="orders"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Daily Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
