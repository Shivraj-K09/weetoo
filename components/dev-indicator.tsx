"use client";

import { Badge } from "@/components/ui/badge";
import { IconBarrierBlock } from "@tabler/icons-react";

export function DevIndicator() {
  // Only show in development environment
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Badge className="rounded-full flex items-center gap-2">
      <IconBarrierBlock />
      Development Mode
    </Badge>
  );
}
