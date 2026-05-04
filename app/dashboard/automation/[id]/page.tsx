type AutomationDetailPageProps = {
  params: {
    id: string;
  };
};

export default function AutomationDetailPage({
  params,
}: AutomationDetailPageProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
        <p className="text-gray-600">Automation ID: {params.id}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">Details coming soon.</p>
      </div>
    </div>
  );
}
