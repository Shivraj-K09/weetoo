"use client";

import { Badge } from "@/components/ui/badge";

export function DevIndicator() {
  // Only show in development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="mb-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-300/20"
    >
      Development Mode
    </Badge>
  );
}
