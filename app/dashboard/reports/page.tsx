import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Scheduled exports and summaries.</p>
      </div>

      <Card>
        <div className="p-6">
          <p className="text-sm text-gray-600">No reports generated yet.</p>
        </div>
      </Card>
    </div>
  );
}
