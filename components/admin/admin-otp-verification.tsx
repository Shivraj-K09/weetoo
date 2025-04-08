"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ThemeProvider } from "@/providers/theme-provider";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store/user-store";
import { sendAdminOtp, verifyAdminOtp } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Mail, ShieldIcon } from "lucide-react";

interface AdminOtpVerificationProps {
  children: React.ReactNode;
}

export function AdminOtpVerification({ children }: AdminOtpVerificationProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const { user, profile, isLoggedIn } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializationRef = useRef(false);

  // Check localStorage for verification immediately on component mount
  // This runs before rendering to prevent flash of OTP screen
  useEffect(() => {
    // Check localStorage synchronously to prevent flash
    if (typeof window !== "undefined") {
      try {
        const storedVerification = localStorage.getItem("adminOtpVerified");
        if (storedVerification) {
          const { timestamp, userId } = JSON.parse(storedVerification);
          const now = new Date().getTime();
          const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

          // If verification is valid and matches current user
          if (hoursDiff < 24 && userId === user?.id) {
            setIsVerified(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking localStorage:", error);
      }

      // Only set to false if we couldn't verify
      // This prevents the OTP screen from flashing if we're not sure yet
      if (user) {
        setIsVerified(false);
      }
    }
  }, [user]);

  // Main verification logic
  useEffect(() => {
    // Skip if we've already determined verification status
    if (isVerified !== false || initializationRef.current) return;

    const checkVerification = async () => {
      try {
        // Wait for profile to be loaded
        if (!profile) {
          console.log("Profile not loaded yet, waiting...");
          return;
        }

        // Set initialization flag to prevent multiple runs
        initializationRef.current = true;

        console.log(
          "Checking verification for user:",
          profile.id,
          "with role:",
          profile.role
        );

        // Check for OTP in URL (from email link)
        const otpFromUrl = searchParams.get("otp");
        if (otpFromUrl && profile?.email) {
          console.log("Found OTP in URL:", otpFromUrl);
          setOtp(otpFromUrl);
          // Verify the OTP from URL
          await handleOtpComplete(otpFromUrl);
          // Remove the OTP from URL to prevent reuse
          router.replace("/admin");
          return;
        }

        // If we reach here, we need to verify the user
        // Check if user has admin role
        if (
          !profile ||
          (profile.role !== "admin" && profile.role !== "super_admin")
        ) {
          console.error("User doesn't have admin role:", profile?.role);
          setError("You don't have permission to access the admin area");
          toast.error("You don't have permission to access the admin area");
          router.push("/");
          return;
        }

        console.log("User has admin role, sending OTP");

        // Send OTP automatically when component mounts and user is not verified
        if (profile?.email && !otpSent) {
          await handleSendOtp();
          setOtpSent(true);
        } else if (!profile?.email) {
          console.error("User has no email address");
          setError("User has no email address");
          toast.error(
            "Unable to send verification code: No email address found"
          );
        }
      } catch (err) {
        console.error("Error in checkVerification:", err);
        setError(
          `Verification error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    };

    // Only run verification check if user is logged in and not verified
    if (isLoggedIn && user && isVerified === false) {
      checkVerification();
    }
  }, [user, profile, router, isLoggedIn, searchParams, otpSent, isVerified]);

  const handleSendOtp = async () => {
    if (!profile?.email) {
      toast.error("No email address found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending OTP to:", profile.email);
      const result = await sendAdminOtp(profile.email);

      console.log("OTP send result:", result);

      if (result.success) {
        setOtpSent(true);
        toast.success(`OTP sent to ${maskEmail(profile.email)}`);
      } else {
        console.error("Failed to send OTP:", result.error);
        setError(`Failed to send OTP: ${result.error}`);
        toast.error(result.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error in handleSendOtp:", error);
      setError(
        `Error sending OTP: ${error instanceof Error ? error.message : String(error)}`
      );
      toast.error("An error occurred while sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = async (value: string) => {
    if (value.length === 6 && profile?.email) {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Verifying OTP:", value, "for email:", profile.email);
        const result = await verifyAdminOtp(profile.email, value);

        console.log("OTP verification result:", result);

        if (result.success) {
          // Store verification in localStorage with timestamp and user ID
          localStorage.setItem(
            "adminOtpVerified",
            JSON.stringify({
              timestamp: new Date().getTime(),
              userId: user?.id,
            })
          );
          setIsVerified(true);
          toast.success("OTP verified successfully");
        } else {
          console.error("Invalid OTP:", result.error);
          setError(`Invalid OTP: ${result.error}`);
          toast.error(result.error || "Invalid OTP");
        }
      } catch (error) {
        console.error("Error in handleOtpComplete:", error);
        setError(
          `Error verifying OTP: ${error instanceof Error ? error.message : String(error)}`
        );
        toast.error("An error occurred while verifying OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.charAt(0) +
      "*".repeat(Math.max(1, username.length - 2)) +
      username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  // Show loading state while we determine verification status
  if (isVerified === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col items-center justify-center gap-4 p-6 max-w-md w-full bg-card rounded-lg shadow-lg border text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#f8e9e8] mb-2">
              <ShieldIcon className="h-8 w-8 text-[#c74135]" />
            </div>
            <h2 className="text-xl font-semibold">Verifying Admin Access</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              <span>Checking your verification status...</span>
            </div>
          </div>
        </ThemeProvider>
      </div>
    );
  }

  // Show OTP verification screen if not verified
  if (isVerified === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col items-center justify-center gap-4 p-6 max-w-md w-full bg-card rounded-lg shadow-lg border">
            <h2 className="text-xl font-semibold">
              Admin Verification Required
            </h2>

            {profile?.email && otpSent && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                <span>OTP sent to {maskEmail(profile.email)}</span>
              </div>
            )}

            {error && (
              <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}

            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onComplete={handleOtpComplete}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <div className="flex gap-4 mt-2">
              <Button
                variant="outline"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-sm"
              >
                {isLoading ? "Sending..." : "Resend OTP"}
              </Button>
              <Button
                onClick={() => handleOtpComplete(otp)}
                disabled={otp.length !== 6 || isLoading}
                className="text-sm"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-2">
              Enter the 6-digit code sent to your email to access the admin
              panel.
              <br />
              This verification is valid for 24 hours.
            </p>
          </div>
        </ThemeProvider>
      </div>
    );
  }

  // Render the children (the actual admin layout) if verified
  return <>{children}</>;
}
