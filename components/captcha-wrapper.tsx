"use client";

import { useTheme } from "next-themes";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useEffect, useRef, useState } from "react";

interface CaptchaWrapperProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  siteKey?: string;
}

export function CaptchaWrapper({
  onVerify,
  onExpire,
  siteKey = "10000000-ffff-ffff-ffff-000000000001", // Test site key
}: CaptchaWrapperProps) {
  const { resolvedTheme } = useTheme();
  const captchaRef = useRef<HCaptcha>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Update theme when resolvedTheme changes
  useEffect(() => {
    setTheme(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  return (
    <div className="flex justify-center my-4">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        theme={theme}
      />
    </div>
  );
}
