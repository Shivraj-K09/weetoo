// Cache for storing fetched data with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Global cache for data
const dataCache = new Map<string, CacheItem<any>>();

// Default TTL in milliseconds (10 seconds)
const DEFAULT_TTL = 10000;

/**
 * Fetches data with caching to reduce redundant API calls
 * @param cacheKey Unique key for caching
 * @param fetchFn Function that fetches the data
 * @param ttl Time to live in milliseconds
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const now = Date.now();
  const cached = dataCache.get(cacheKey);

  // Return cached data if valid
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();

    // Store in cache
    dataCache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });

    return data;
  } catch (error) {
    // If error and we have stale data, return it with extended TTL
    if (cached) {
      console.log(
        `[Cache] Using stale data for ${cacheKey} due to fetch error`
      );
      // Extend TTL by 5 seconds to prevent hammering failing API
      cached.expiresAt = now + 5000;
      return cached.data;
    }
    throw error;
  }
}

/**
 * Invalidates a specific cache entry
 */
export function invalidateCache(cacheKey: string): void {
  dataCache.delete(cacheKey);
}

/**
 * Invalidates all cache entries that match a prefix
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of dataCache.keys()) {
    if (key.startsWith(prefix)) {
      dataCache.delete(key);
    }
  }
}

/**
 * Clears all cache entries
 */
export function clearCache(): void {
  dataCache.clear();
}

/**
 * Batch multiple data fetching operations
 */
export async function batchFetch<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(operations.map((op) => op()));
}

/**
 * Debounce function to limit the frequency of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function to limit the frequency of function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T> | undefined;

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastResult = func(...args);
      lastCall = now;
    }
    return lastResult;
  };
}

/**
 * Optimized batch data loader for room data
 */
export async function loadRoomData(roomId: string, supabase: any) {
  // Create batch operations
  const operations = [
    // Room details
    () =>
      fetchWithCache(
        `room:${roomId}`,
        async () => {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("*")
            .eq("id", roomId)
            .single();

          if (error) throw error;
          return data;
        },
        30000
      ), // 30 second TTL for room details

    // Participants
    () =>
      fetchWithCache(
        `participants:${roomId}`,
        async () => {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("participants")
            .eq("id", roomId)
            .single();

          if (error) throw error;
          return data.participants || [];
        },
        15000
      ), // 15 second TTL for participants

    // Open positions
    () =>
      fetchWithCache(
        `positions:${roomId}`,
        async () => {
          const { data, error } = await supabase
            .from("trading_positions")
            .select("*")
            .eq("room_id", roomId)
            .eq("status", "open");

          if (error) throw error;
          return data || [];
        },
        5000
      ), // 5 second TTL for positions (more frequent updates)
  ];

  // Execute all operations in parallel
  const [roomDetails, participants, positions] = await batchFetch(operations);

  return {
    roomDetails,
    participants,
    positions,
  };
}

// Function to preload critical assets
export function preloadAssets() {
  // Preload critical images
  const imagesToPreload = [
    "/images/logo.png",
    // Add other critical images here
  ];

  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
