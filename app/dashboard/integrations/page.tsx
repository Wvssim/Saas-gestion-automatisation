"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">
            Connect marketplaces and data sources.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/integrations/shopify")}
        >
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Shopify</h2>
            <p className="text-sm text-gray-600 mt-2">Not connected</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Amazon</h2>
            <p className="text-sm text-gray-600 mt-2">Coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
