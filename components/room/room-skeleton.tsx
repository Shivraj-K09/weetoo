interface RoomSkeletonProps {
  isVoiceRoom?: boolean;
}

export function RoomSkeleton({ isVoiceRoom = false }: RoomSkeletonProps) {
  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-4 w-full flex gap-1.5 bg-[#181a20]">
        <div className="h-full text-white rounded-md shadow-sm flex-1 w-full">
          <div className="flex flex-col gap-1.5">
            {/* Room Header Skeleton */}
            <div className="w-full bg-[#1a1e27] border border-[#3f445c] rounded-md">
              <div className="p-3">
                <div className="flex items-center">
                  {/* Avatar Skeleton */}
                  <div className="h-16 w-16 rounded-full bg-[#212631]" />
                  <div className="ml-3">
                    <div className="h-6 w-40 bg-[#212631] mb-1" />
                    <div className="h-4 w-24 bg-[#212631] mb-1" />
                    <div className="h-3 w-32 bg-[#212631]" />
                  </div>
                </div>

                {/* Voice Channel Skeleton (only for voice rooms) */}
                {isVoiceRoom && (
                  <div className="mt-3 px-3 py-4 bg-[#1a1e27] border border-[#3f445c] rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-40 bg-[#212631]" />
                      <div className="h-8 w-32 bg-[#212631] rounded-md" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Info Bar Skeleton */}
            <div className="bg-[#212631] rounded-md w-full">
              <div className="border w-full border-[#3f445c] text-white rounded p-4 flex items-center bg-[#1a1e27]">
                <div className="flex flex-col gap-1.5">
                  <div className="h-7 w-24 bg-[#212631] rounded" />
                  <div className="h-4 w-36 bg-[#212631] rounded" />
                </div>
                <div className="mx-5 h-15">
                  <div className="w-[1px] h-12 bg-[#3f445c]" />
                </div>
                <div className="flex-1 flex items-center gap-4">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="h-3 w-16 bg-[#212631]" />
                        <div className="h-4 w-20 bg-[#212631]" />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 w-full">
              {/* Trading Chart Skeleton */}
              <div className="bg-[#212631] rounded w-full h-[45rem] border border-[#3f445c] flex items-center justify-center">
                <div className="h-[90%] w-[95%] bg-[#1a1e27]" />
              </div>

              {/* Tabs Skeleton */}
              <div className="bg-[#212631] p-1 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
                <div className="flex gap-2 mb-3">
                  <div className="h-8 w-16 bg-[#1a1e27]" />
                  <div className="h-8 w-16 bg-[#1a1e27]" />
                </div>
                <div className="h-[calc(100%-40px)] w-full bg-[#1a1e27]" />
              </div>

              {/* Trading Marketplace Skeleton */}
              <div className="flex max-w-[290px] w-full">
                <div className="bg-[#212631] p-2 rounded w-full h-[45rem] border border-[#3f445c]">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5 w-full">
                      <div className="h-8 w-full bg-[#1a1e27]" />
                      <div className="h-8 w-full bg-[#1a1e27]" />
                    </div>
                    <div className="h-8 w-full bg-[#1a1e27]" />
                    <div className="h-8 w-full bg-[#1a1e27]" />
                    <div className="h-40 w-full bg-[#1a1e27]" />
                    <div className="h-20 w-full bg-[#1a1e27]" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 w-full bg-[#1a1e27]" />
                      <div className="h-10 w-full bg-[#1a1e27]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Tabs Bottom Skeleton */}
            <div className="bg-[#212631] w-full h-[16rem] border border-[#3f445c]">
              <div className="p-2">
                <div className="flex gap-2 mb-2">
                  <div className="h-8 w-24 bg-[#1a1e27]" />
                  <div className="h-8 w-24 bg-[#1a1e27]" />
                </div>
                <div className="h-[calc(100%-40px)] w-full bg-[#1a1e27]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-[19rem] rounded-md text-white flex flex-col gap-1.5">
          {/* Participants Panel Skeleton */}
          <div className="w-full bg-[#212631] h-[300px] p-4 py-3 text-sm border border-[#3f445c]">
            <div className="flex justify-between text-sm mb-2">
              <div className="h-4 w-32 bg-[#1a1e27]" />
            </div>
            <div className="space-y-2 mt-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#1a1e27] mr-2" />
                      <div className="h-4 w-24 bg-[#1a1e27]" />
                    </div>
                    {i === 0 && <div className="h-4 w-12 bg-[#1a1e27]" />}
                  </div>
                ))}
            </div>
          </div>

          {/* Chat Panel Skeleton */}
          <div className="w-full bg-[#212631] h-[400px] relative border border-[#3f445c]">
            <div className="bg-[#1a1e27] flex items-center justify-between w-full p-2 border-b border-[#3f445c]">
              <div className="h-4 w-12 bg-[#212631]" />
              <div className="h-4 w-16 bg-[#212631]" />
            </div>
            <div className="p-2 h-[330px]">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex items-center">
                      <div className="h-4 w-24 bg-[#1a1e27] mr-2" />
                      <div className="h-3 w-16 bg-[#1a1e27]" />
                    </div>
                    <div className="h-4 w-48 bg-[#1a1e27] mt-1" />
                  </div>
                ))}
            </div>
            <div className="absolute w-full px-2 bottom-2">
              <div className="relative">
                <div className="h-10 w-full bg-[#1a1e27]" />
                <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                  <div className="h-8 w-16 bg-[#212631]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
