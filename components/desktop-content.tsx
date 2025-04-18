"use client";

import Image from "next/image";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Community } from "./community/community";
import { Ranking } from "./community/ranking";
import { Trading } from "./trading";
import { useEffect } from "react";
import { toast } from "sonner";

export function DesktopContent() {
  // Check for welcome bonus notification
  useEffect(() => {
    // Check both possible keys for backward compatibility
    const showWelcomeBonus = sessionStorage.getItem("showWelcomeBonus");
    const checkWelcomeBonus = sessionStorage.getItem("checkWelcomeBonus");

    if (showWelcomeBonus === "true" || checkWelcomeBonus === "true") {
      // Display the toast with higher duration and priority
      toast.success(
        "Welcome! You've received 5,000 Kor_coins as a welcome bonus!",
        {
          duration: 6000,
          position: "top-center",
          id: "welcome-bonus-toast", // Unique ID to prevent duplicates
        }
      );

      // Clear both flags
      sessionStorage.removeItem("showWelcomeBonus");
      sessionStorage.removeItem("checkWelcomeBonus");

      // Log for debugging
      console.log("Welcome bonus toast displayed from DesktopContent");
    }
  }, []);

  return (
    <div className="font-[family-name:var(--font-geist-sans)] w-full h-full lg:block hidden">
      <div className="h-full">
        <Image
          src="/banner.png"
          alt="banner"
          width={1000}
          height={250}
          draggable={false}
          className="w-full rounded-md"
        />
        <div className="py-2">
          <TickerTape
            symbols={[
              { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
              { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
              { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
              { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
              { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
            ]}
            showSymbolLogo={true}
            isTransparent={true}
            displayMode="compact"
            colorTheme="light"
            locale="en"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Community />
          <Ranking />
        </div>

        <Trading />
      </div>
    </div>
  );
}
