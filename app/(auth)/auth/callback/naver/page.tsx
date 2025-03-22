"use client";

import { Suspense } from "react";
import { NaverCallback } from "./naver-callback";

export default function NaverCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading authentication...
            </p>
          </div>
        </div>
      }
    >
      <NaverCallback />
    </Suspense>
  );
}
