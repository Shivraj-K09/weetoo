interface RoomSkeletonProps {
  index: number;
  totalSkeletons: number;
}

export function RoomSkeleton({ index, totalSkeletons }: RoomSkeletonProps) {
  return (
    <div
      className={`flex items-center border-b border-gray-200 py-3 px-2 ${
        index === 1 ? "bg-amber-50" : "bg-white"
      } relative`}
    >
      {/* Hanging Medal Skeleton (only for first and last items) */}
      {(index === 1 || index === totalSkeletons) && (
        <div className="absolute left-[70%] transform -translate-x-1/2 -top-[6px] z-10">
          <div className="flex flex-col items-center">
            <div className="w-2 h-3 bg-gray-300 rounded-t-full animate-pulse"></div>
            <div className="w-8 h-8 rounded-full bg-amber-200 animate-pulse flex items-center justify-center shadow-md">
              <div className="w-5 h-5 rounded-full bg-amber-300 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Rank Skeleton */}
      <div className="flex flex-col items-center mr-3 w-8">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center animate-pulse ${
            index === 1
              ? "bg-blue-200"
              : index === 2
                ? "bg-gray-200"
                : "bg-gray-200"
          }`}
        />
        <div className="w-6 h-2 bg-gray-200 rounded animate-pulse mt-1" />
      </div>

      {/* Thumbnail Skeleton */}
      <div className="relative w-14 h-14 mr-3 flex-shrink-0">
        <div className="absolute inset-0 bg-gray-200 rounded-md overflow-hidden animate-pulse" />
      </div>

      {/* Time and Status Skeleton */}
      <div className="flex flex-col mr-3 min-w-[60px]">
        <div className="flex gap-2">
          <div className="w-12 h-4 bg-red-200 rounded-sm animate-pulse" />
          <div className="w-12 h-4 bg-red-200 rounded-sm animate-pulse" />
        </div>
        <div className="w-10 h-3 bg-gray-200 rounded animate-pulse mt-1" />
      </div>

      {/* Title and Ratio Skeleton */}
      <div className="flex-1 min-w-0">
        <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="flex items-center mt-1">
          <div className="w-15 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Avatar and Username Skeleton */}
      <div className="flex items-center ml-auto">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-20 h-3 bg-gray-200 rounded animate-pulse ml-1" />
        </div>
      </div>
    </div>
  );
}
