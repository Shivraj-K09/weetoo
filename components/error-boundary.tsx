"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add error event listener for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
      setError(new Error(event.message));
    };

    // Add unhandled rejection listener for uncaught promises
    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setHasError(true);
      setError(
        new Error(event.reason?.message || "Unhandled Promise Rejection")
      );
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 border border-red-200 rounded-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-600 mb-4 text-center max-w-md">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
