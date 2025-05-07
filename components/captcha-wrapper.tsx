"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface CaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  siteKey?: string;
  action?: string;
}

export function CaptchaWrapper({
  onVerify,
  onExpire,
  siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
  action = "submit_post",
}: CaptchaWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Function to execute reCAPTCHA and get a token
  const executeRecaptcha = async () => {
    if (!isLoaded || typeof window.grecaptcha === "undefined") {
      console.log("reCAPTCHA not loaded yet");
      return;
    }

    try {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, {
            action: action,
          });
          console.log("reCAPTCHA token generated");
          onVerify(token);
        } catch (error) {
          console.error("Error executing reCAPTCHA:", error);
          if (onExpire) onExpire();
        }
      });
    } catch (error) {
      console.error("Error with reCAPTCHA execution:", error);
      if (onExpire) onExpire();
    }
  };

  // Set up reCAPTCHA when the component mounts
  useEffect(() => {
    if (isLoaded) {
      // Execute immediately on load
      executeRecaptcha();

      // Set up refresh interval (tokens expire after 2 minutes)
      const interval = setInterval(() => {
        console.log("Refreshing reCAPTCHA token");
        executeRecaptcha();
      }, 90000); // Refresh every 90 seconds

      setRefreshInterval(interval);

      // Clean up interval on unmount
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    }
  }, [isLoaded]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        onLoad={() => {
          console.log("reCAPTCHA script loaded");
          setIsLoaded(true);
        }}
        onError={() => {
          console.error("Error loading reCAPTCHA script");
          if (onExpire) onExpire();
        }}
      />
      <div className="text-xs text-muted-foreground text-center mt-2">
        This site is protected by reCAPTCHA v3.
        <a
          href="https://policies.google.com/privacy"
          className="underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>{" "}
        and
        <a
          href="https://policies.google.com/terms"
          className="underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>{" "}
        apply.
      </div>
    </>
  );
}

// Add this to the window object for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}
