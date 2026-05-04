"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage listings and inventory status.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/integrations/shopify")}
        >
          Sync Products
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-sm text-gray-600">No products found yet.</p>
        </div>
      </Card>
    </div>
  );
}
