"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AutomationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-600">Rules that keep your store optimized.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/automation/new")}
        >
          Create Automation
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-sm text-gray-600">
            No automations configured yet.
          </p>
        </div>
      </Card>
    </div>
  );
}
