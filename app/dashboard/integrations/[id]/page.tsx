type IntegrationDetailPageProps = {
  params: {
    id: string;
  };
};

export default function IntegrationDetailPage({
  params,
}: IntegrationDetailPageProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integration</h1>
        <p className="text-gray-600">Integration ID: {params.id}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">Configuration coming soon.</p>
      </div>
    </div>
  );
}
