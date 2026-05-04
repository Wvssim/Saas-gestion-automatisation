import { Card } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">
          Track recent orders and fulfillment status.
        </p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-sm text-gray-600">No orders synced yet.</p>
        </div>
      </Card>
    </div>
  );
}
