"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingIndicator() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset navigation state when route changes
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // This component doesn't render anything visible
  // It just helps reset navigation state when routes change
  return null;
}
