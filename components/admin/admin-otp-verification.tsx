"use client";

import type React from "react";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ThemeProvider } from "@/providers/theme-provider";

interface AdminOtpVerificationProps {
  children: React.ReactNode;
}

export function AdminOtpVerification({ children }: AdminOtpVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);

  const handleOtpComplete = (otp: string) => {
    // For now, just check if it's 6 digits long
    if (otp.length === 6) {
      setIsVerified(true);
    }
  };

  if (!isVerified) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        {/* ThemeProvider is needed here for consistent styling of the OTP screen */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <h2 className="text-xl font-semibold">
              Enter Admin Verification Code
            </h2>
            <InputOTP maxLength={6} onComplete={handleOtpComplete}>
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
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code to access the admin panel. (Any 6 digits
              for now)
            </p>
          </div>
        </ThemeProvider>
      </div>
    );
  }

  // Render the children (the actual admin layout) if verified
  return <>{children}</>;
}
