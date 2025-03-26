"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  handleNaverCallback,
  type NaverCallbackResult,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

// Add these type definitions at the top of the file, after the imports
interface SessionInfo {
  session: {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    user: {
      id: string;
      email?: string;
      user_metadata: Record<string, unknown>;
    };
  } | null;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: unknown;
  details?: string;
  email?: string;
  password?: string;
  userId?: string;
}

export function NaverCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [authState, setAuthState] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Check if user is already logged in
  useEffect(() => {
    async function checkExistingSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log(
          "User already has an active session, redirecting to dashboard"
        );
        setSessionInfo(data);
        setAuthState("success");

        // Add a small delay to ensure everything is updated
        setTimeout(() => {
          router.push("/");
        }, 1000);
        return true;
      }
      return false;
    }

    checkExistingSession();
  }, [router]);

  useEffect(() => {
    async function processCallback() {
      try {
        // If we're already at max retries, don't try again
        if (retryCount >= MAX_RETRIES) {
          setError(
            `Failed after ${MAX_RETRIES} attempts. Please try logging in again.`
          );
          setAuthState("error");
          setIsLoading(false);
          return;
        }

        const code = searchParams.get("code");

        if (!code) {
          setError("No authorization code received");
          setAuthState("error");
          setIsLoading(false);
          return;
        }

        // Capture the raw response for debugging
        let rawResult: unknown;
        try {
          const result: NaverCallbackResult = await handleNaverCallback(code);
          rawResult = result;
          setApiResponse(result);

          if (result.success) {
            // If we have email and password, sign in directly on the client
            if (result.email && result.password) {
              console.log("Signing in with email and password");

              const { data: signInData, error: signInError } =
                await supabase.auth.signInWithPassword({
                  email: result.email,
                  password: result.password,
                });

              if (signInError) {
                console.error("Error signing in:", signInError);
                setError("Failed to sign in: " + signInError.message);
                setDebugInfo(JSON.stringify(signInError, null, 2));
                setAuthState("error");
                setIsLoading(false);
                return;
              }

              console.log("Sign in successful:", signInData);
              setSessionInfo(signInData);
              setAuthState("success");

              // Add a small delay to ensure everything is updated
              setTimeout(() => {
                router.push("/");
              }, 1000);
            } else {
              // No email/password provided
              setError(
                "Authentication successful but no login credentials provided"
              );
              setAuthState("error");
              setIsLoading(false);
            }
          } else {
            setError(result.message || "Authentication failed");
            if (result.error) {
              setDebugInfo(
                typeof result.error === "object"
                  ? JSON.stringify(result.error, null, 2)
                  : String(result.error)
              );
            }
            setAuthState("error");
            setIsLoading(false);
          }
        } catch (err) {
          rawResult = err;

          // Network error - retry after a delay
          if (
            err instanceof Error &&
            (err.message.includes("fetch failed") ||
              err.message.includes("ECONNRESET") ||
              err.message.includes("network"))
          ) {
            console.log(
              `Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`
            );
            setRetryCount((prev) => prev + 1);

            // Wait 2 seconds before retrying
            setTimeout(() => {
              processCallback();
            }, 2000);

            return;
          }

          throw err;
        } finally {
          if (rawResult) {
            setRawResponse(
              JSON.stringify(rawResult as Record<string, unknown>, null, 2)
            );
          }
        }
      } catch (err) {
        console.error("Error during Naver callback:", err);
        setError("An unexpected error occurred");
        setDebugInfo(
          err instanceof Error ? err.stack ?? String(err) : String(err)
        );
        setAuthState("error");
        setIsLoading(false);
      }
    }

    if (authState === "loading") {
      processCallback();
    }
  }, [searchParams, router, retryCount, authState]);

  // Add a manual retry button handler
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setAuthState("loading");
    setRetryCount(0);
  };

  // If we're in the success state, show the success UI
  if (authState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Authentication successful! Redirecting...
          </p>
          {/* {sessionInfo && (
            <details className="text-xs mt-4 max-w-md mx-auto">
              <summary className="cursor-pointer text-muted-foreground">
                Session Information
              </summary>
              <pre className="mt-2 whitespace-pre-wrap bg-slate-100 p-2 rounded text-slate-800 overflow-auto max-h-60 text-left">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </details>
          )} */}
        </div>
      </div>
    );
  }

  // If we're still loading, show the loading UI
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {retryCount > 0
              ? `Completing authentication (Attempt ${retryCount}/${MAX_RETRIES})...`
              : "Completing authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If we have an error, show the error UI
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {apiResponse && apiResponse.details && (
              <div className="mb-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="font-medium text-yellow-800">Error Details:</p>
                <p className="text-sm text-yellow-700">{apiResponse.details}</p>
              </div>
            )}

            {/* {sessionInfo && (
              <details className="text-xs mb-4">
                <summary className="cursor-pointer text-muted-foreground">
                  Session Information
                </summary>
                <pre className="mt-2 whitespace-pre-wrap bg-slate-100 p-2 rounded text-slate-800 overflow-auto max-h-60">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </details>
            )} */}

            {debugInfo && (
              <details className="text-xs mb-4">
                <summary className="cursor-pointer text-muted-foreground">
                  Debug Information
                </summary>
                <pre className="mt-2 whitespace-pre-wrap bg-slate-100 p-2 rounded text-slate-800 overflow-auto max-h-60">
                  {debugInfo}
                </pre>
              </details>
            )}

            {rawResponse && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">
                  Raw Response
                </summary>
                <pre className="mt-2 whitespace-pre-wrap bg-slate-100 p-2 rounded text-slate-800 overflow-auto max-h-60">
                  {rawResponse}
                </pre>
              </details>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Try these troubleshooting steps:
              </p>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                <li>Check if your Supabase service role key is correct</li>
                <li>Verify that your Naver Developer credentials are valid</li>
                <li>
                  Make sure your redirect URI is correctly configured in Naver
                  Developer Console
                </li>
                <li>Check your browser console for additional errors</li>
                <li>Check the server logs for more detailed error messages</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <Button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="bg-red-600 hover:bg-red-700"
            >
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Fallback UI (should not reach here)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          Processing authentication...
        </p>
      </div>
    </div>
  );
}
