export function TradingFormSkeleton() {
  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c] overflow-y-auto no-scrollbar animate-pulse">
      {/* Header section */}
      <div className="flex gap-1.5 w-full mb-4">
        <div className="flex items-center w-full justify-between gap-2 px-4 py-2 bg-[#1a1e27] rounded-md border border-white/10">
          <div className="h-4 w-12 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 px-4 py-2 bg-[#1a1e27] rounded-md border border-white/10">
          <div className="h-4 w-8 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <div className="h-6 w-16 bg-gray-700 rounded"></div>
          <div className="h-6 w-16 bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Price input */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
        <div className="h-8 w-full bg-gray-700 rounded"></div>
      </div>

      {/* Quantity input */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
        <div className="h-8 w-full bg-gray-700 rounded"></div>
      </div>

      {/* Percentage buttons */}
      <div className="h-10 w-full bg-gray-700 rounded mb-4"></div>

      {/* Risk management section */}
      <div className="h-40 w-full bg-gray-700 rounded mb-4"></div>

      {/* Trading info section */}
      <div className="h-60 w-full bg-gray-700 rounded mb-4"></div>

      {/* Buy/Sell buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-10 w-full bg-green-800/50 rounded"></div>
        <div className="h-10 w-full bg-red-800/50 rounded"></div>
      </div>

      {/* Balance section */}
      <div className="h-40 w-full bg-gray-700 rounded"></div>
    </div>
  );
}
