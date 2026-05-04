import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Key trends and performance snapshots.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
            <p className="text-sm text-gray-600 mt-2">
              Connect data sources to unlock charts.
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Order Velocity</h2>
            <p className="text-sm text-gray-600 mt-2">
              No data yet. Run a sync to populate.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
