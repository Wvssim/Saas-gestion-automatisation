"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {session.user?.name}!</h1>
        <p className="text-gray-600 mt-2">Dashboard • {session.user?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">€12,450</p>
            <p className="text-green-600 text-sm mt-2">+12% vs last week</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-3xl font-bold mt-2">284</p>
            <p className="text-green-600 text-sm mt-2">+8% vs last week</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Avg Order Value</p>
            <p className="text-3xl font-bold mt-2">€43.83</p>
            <p className="text-red-600 text-sm mt-2">-2% vs last week</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Conversion Rate</p>
            <p className="text-3xl font-bold mt-2">3.2%</p>
            <p className="text-green-600 text-sm mt-2">+0.5% vs last week</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Products Listed</p>
            <p className="text-3xl font-bold mt-2">127</p>
            <p className="text-gray-600 text-sm mt-2">15 low stock</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Active Automations</p>
            <p className="text-3xl font-bold mt-2">3</p>
            <p className="text-green-600 text-sm mt-2">All running</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/integrations")}
              >
                Connect Marketplace
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/automation/new")}
              >
                Create Automation
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/reports")}
              >
                View Reports
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-bold mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-semibold">
                  ✓ Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Integrations</span>
                <span className="text-gray-600">None yet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Session</span>
                <span className="text-green-600 font-semibold">✓ Active</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
