"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);

        // Get session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(sessionData);

        if (sessionData.session) {
          // Get user data
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
          } else {
            setUserData(userData);
          }
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Checking authentication status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            This page shows your current authentication status and user data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Session Status</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">
                  {session?.session ? (
                    <span className="text-green-600 font-medium">
                      ✓ Authenticated
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">
                      ✗ Not authenticated
                    </span>
                  )}
                </p>
              </div>
            </div>

            {session?.session && (
              <div>
                <h3 className="text-lg font-medium">Session Data</h3>
                <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}

            {userData && (
              <div>
                <h3 className="text-lg font-medium">User Data</h3>
                <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-auto max-h-40">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link href="/login">Go to Login</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go to Main Page</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
