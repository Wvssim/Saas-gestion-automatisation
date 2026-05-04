import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage profile, billing, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-600 mt-2">
              Update name, email, and avatar.
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-gray-900">Plan</h2>
            <p className="text-sm text-gray-600 mt-2">Starter plan active.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
