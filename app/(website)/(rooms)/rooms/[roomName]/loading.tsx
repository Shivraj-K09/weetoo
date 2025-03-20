export default function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-20 h-8 bg-red-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="border rounded-lg p-4 mb-6">
          <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4 h-[400px] flex items-center justify-center bg-gray-50">
          <div className="w-64 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
